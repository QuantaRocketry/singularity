// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod board;
mod serial;
mod settings;
use board::BoardVariant;

use std::{
    io::{self, Write},
    sync::{Arc, Mutex},
    thread,
};
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn greet(name: &str) -> Result<String, String> {
    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

#[derive(Default)]
struct AppData {
    board_variant: Option<BoardVariant>,
    board_settings: settings::BoardSettings,
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
            settings::upload_board_settings,
            settings::download_board_settings,
            settings::get_board_settings,
            settings::set_lora_bandwidth,
            settings::set_lora_frequency,
            settings::set_lora_spreading_factor,
            settings::set_lora_sync_word,
            board::set_board_variant,
            board::get_board_variant,
            board::get_board_variants,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
