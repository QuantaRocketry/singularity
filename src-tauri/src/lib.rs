// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod serial;
mod settings;

use std::sync::Mutex;
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn greet(name: &str) -> Result<String, String> {
    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

#[derive(Default)]
struct AppData {
    board_settings: Option<settings::DeviceSettings>,
    serial: serial::SerialData,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            let handler_clone = app.handle().clone();
            app.manage(Mutex::new(AppData::default()));
            tauri::async_runtime::spawn(async move {
                if let Err(e) = serial::serial_monitor(&handler_clone).await {
                    eprintln!("Error in serial monitor: {}", e);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            serial::set_port,
            serial::set_baud_rate,
            serial::get_ports,
            serial::get_active_port,
            serial::get_serial_content,
            serial::send_serial_message,
            serial::clear_serial_content,
            serial::set_baud_rate,
            settings::device::upload_device_settings,
            settings::device::download_device_settings,
            settings::device::get_device_settings,
            settings::device::set_device_settings,
            settings::device::set_device_variant,
            settings::device::get_device_variants,
            settings::serial::set_serial_settings,
            settings::serial::get_serial_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
