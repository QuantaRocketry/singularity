use std::io::{self, Write};
use std::time::Duration;
use std::{sync::Mutex, thread};

use crate::{settings, AppData};

use serialport;
use tauri::{Emitter, Manager};

#[derive(Default)]
pub struct SerialData {
    settings: settings::SerialSettings,
    content: Vec<String>,
    connected_port: Option<Box<dyn serialport::SerialPort>>,
}

#[tauri::command]
pub async fn get_ports() -> Result<Vec<String>, String> {
    let mut port_names: Vec<String> = Vec::new();
    match serialport::available_ports() {
        Ok(ports) => {
            for port in ports {
                if let serialport::SerialPortType::UsbPort(_info) = port.port_type {
                    port_names.push(port.port_name.clone());
                }
            }
        }
        Err(_) => return Err("Error reading ports".to_string()),
    }
    Ok(port_names)
}

#[tauri::command]
pub async fn set_port(
    port: &str,
    state: tauri::State<'_, Mutex<AppData>>,
) -> Result<String, String> {
    let mut state = state.lock().unwrap();
    state.serial.connected_port = None;
    match serialport::new(port, 9600)
        .timeout(Duration::from_secs(10))
        .open()
    {
        Ok(p) => {
            let name = p.name().unwrap_or("Unknown".to_string());
            state.serial.connected_port = Some(p);
            Ok(name)
        }
        Err(err) => Err(format!("Failed to connect to {}\n{}", port, err)),
    }
}

#[tauri::command]
pub async fn set_baud_rate(
    baud_rate: u32,
    state: tauri::State<'_, Mutex<AppData>>,
) -> Result<String, String> {
    let mut state = state.lock().unwrap();
    state.serial.settings.baud_rate = baud_rate;
    let port = if let Some(p) = &state.serial.connected_port {
        if let Some(name) = p.name() {
            name
        } else {
            return Ok("".to_string());
        }
    } else {
        return Ok("".to_string());
    };

    state.serial.connected_port = None;
    match serialport::new(&port, 9600)
        .timeout(Duration::from_secs(10))
        .open()
    {
        Ok(p) => {
            let name = p.name().unwrap_or("Unknown".to_string());
            state.serial.connected_port = Some(p);
            Ok(name)
        }
        Err(err) => Err(format!("Failed to connect to {}\n{}", port, err)),
    }
}

#[tauri::command]
pub async fn get_active_port(state: tauri::State<'_, Mutex<AppData>>) -> Result<String, String> {
    let state = state.lock().unwrap();
    if let Some(port) = &state.serial.connected_port {
        let name = port.name().unwrap_or("".to_string());
        return Ok(name);
    }
    return Ok("".to_string());
}

#[tauri::command]
pub async fn send_serial_message(
    message: String,
    state: tauri::State<'_, Mutex<AppData>>,
) -> Result<String, String> {
    let mut state = state.lock().unwrap();
    state.serial.content.push(message.clone());

    if let Some(p) = &state.serial.connected_port {
        let mut port = p.try_clone().expect("Failed to obtain clone");
        match port.write(message.as_bytes()) {
            Ok(_) => {
                eprintln!("{}", &message);
                std::io::stdout().flush().unwrap();
            }
            Err(ref e) => {
                eprintln!("{:?}", e);
                return Err(format!(
                    "Serial port error while trying to send message: {}\n{}",
                    message, e
                ));
            }
        }

        return Ok("".to_string());
    } else {
        return Err("No port connected".to_string());
    }
}

#[tauri::command]
pub async fn get_serial_content(
    state: tauri::State<'_, Mutex<AppData>>,
) -> Result<Vec<String>, String> {
    let state = state.lock().unwrap();
    return Ok(state.serial.content.clone());
}

#[tauri::command]
pub async fn clear_serial_content(state: tauri::State<'_, Mutex<AppData>>) -> Result<(), String> {
    let mut state = state.lock().unwrap();
    state.serial.content = vec!["".to_string()];
    return Ok(());
}

pub async fn serial_monitor(handle: &tauri::AppHandle) -> Result<(), String> {
    let mut serial_buf: Vec<u8> = vec![0; 1000];
    loop {
        thread::sleep(Duration::from_millis(10));
        let state_handle = handle.clone();
        let state = state_handle.state::<Mutex<AppData>>();
        let mut state = state.lock().unwrap();

        if let Some(p) = &state.serial.connected_port {
            let mut port = p.try_clone().expect("Failed to obtain clone");
            match port.read(serial_buf.as_mut_slice()) {
                Ok(t) => {
                    let _result = state_handle.emit(
                        "serial_message_received",
                        String::from_utf8_lossy(&serial_buf[..t]).to_string(),
                    );
                    state
                        .serial
                        .content
                        .push(String::from_utf8_lossy(&serial_buf[..t]).to_string());
                }
                Err(ref e) => match e.kind() {
                    io::ErrorKind::BrokenPipe => {
                        state.serial.connected_port = None;
                        let _ = state_handle.emit("serial_disconnected", ());
                        eprintln!("Port disconnected")
                    }
                    _ => eprintln!("{:?}", e),
                },
            }
            let _ = port.flush();
        }
    }
}
