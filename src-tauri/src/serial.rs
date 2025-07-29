use std::io::{self, Write};
use std::time::Duration;
use std::{sync::Mutex, thread};

use crate::{protocol, settings, AppData};

use serialport::{self, SerialPort};
use tauri::{Emitter, Manager};

#[derive(Default)]
pub struct SerialData {
    pub settings: settings::SerialSettings,
    pub content: Vec<String>,
    pub connected_port: Option<Box<dyn serialport::SerialPort>>,
    pub protocol: Option<Box<dyn protocol::ProtocolTrait>>,
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

fn open_port(
    port: &str,
    settings: &settings::SerialSettings,
) -> serialport::Result<Box<dyn SerialPort>> {
    serialport::new(port, settings.baud_rate)
        .timeout(Duration::from_millis(10))
        .open()
}

#[tauri::command]
pub async fn set_port(
    port: &str,
    state: tauri::State<'_, Mutex<AppData>>,
) -> Result<String, String> {
    let mut state = state.lock().unwrap();
    state.serial.connected_port = None;
    match open_port(port, &state.serial.settings) {
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
    match open_port(&port, &state.serial.settings) {
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
    let state = state.lock().unwrap();

    if let Some(p) = &state.serial.connected_port {
        let mut port = p.try_clone().expect("Failed to obtain clone");
        let message = message + "\n";
        match port.write(message.as_bytes()) {
            Ok(_) => {
                port.flush().unwrap();
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
        thread::sleep(Duration::from_millis(100));
        let state_handle = handle.clone();
        let state = state_handle.state::<Mutex<AppData>>();
        let mut state = state.lock().unwrap();

        if let Some(p) = &state.serial.connected_port {
            let mut port = p.try_clone().expect("Failed to obtain clone");
            match port.read(serial_buf.as_mut_slice()) {
                Ok(t) => {
                    let message: String;
                    if let Some(p) = &state.serial.protocol {
                        message = p.parse_to_string(&serial_buf[..t]);
                    } else {
                        message = String::from_utf8_lossy(&serial_buf[..t]).into();
                    }
                    let lines = message.split(|b| b as u8 == b'\n');
                    lines.for_each(|line| {
                        let _result = state_handle.emit(
                            "serial_message_received",
                            line.to_string(),
                        );
                        state
                            .serial
                            .content
                            .push(line.to_string());
                    });
                }
                Err(ref e) => match e.kind() {
                    io::ErrorKind::BrokenPipe => {
                        state.serial.connected_port = None;
                        let _ = state_handle.emit("serial_disconnected", ());
                        eprintln!("Port disconnected")
                    }
                    io::ErrorKind::TimedOut => {} // expected timeout
                    _ => eprintln!("{:?}", e),
                },
            }
            let _ = port.flush();
        }
    }
}
