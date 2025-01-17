use std::sync::Mutex;

use crate::AppData;
use serde::{Deserialize, Serialize};

#[derive(Default, Serialize, Deserialize, Debug, PartialEq, Clone, Copy)]
pub struct BoardSettings {
    lora: LoRaSettings,
    deployment: DeploymentSettings,
}

#[tauri::command]
pub async fn get_board_settings(
    state: tauri::State<'_, Mutex<AppData>>,
) -> Result<BoardSettings, String> {
    let state = state.lock().unwrap();
    return Ok(state.board_settings.clone());
}

#[tauri::command]
pub async fn upload_board_settings(
    _settings: BoardSettings,
    _state: tauri::State<'_, Mutex<AppData>>,
) -> Result<(), String> {
    // let mut state = state.lock().unwrap();
    return Err("Upload not implemented".to_string());
}

#[tauri::command]
pub async fn download_board_settings(
    _state: tauri::State<'_, Mutex<AppData>>,
) -> Result<BoardSettings, String> {
    // let mut state = state.lock().unwrap();
    // return Ok(BoardSettings::default());
    return Err("Download not implemented".to_string());
}

#[derive(Default, Serialize, Deserialize, Debug, PartialEq, Clone, Copy)]
struct LoRaSettings {
    frequency: u32,
    bandwidth: u32,
    spreading_factor: u8,
    sync_word: u8,
    coding_rate: u8,
}

#[tauri::command]
pub async fn set_lora_frequency(
    frequency: u32,
    state: tauri::State<'_, Mutex<AppData>>,
) -> Result<String, String> {
    let mut state = state.lock().unwrap();
    state.board_settings.lora.frequency = frequency;
    return Ok("".to_string());
}

#[tauri::command]
pub async fn set_lora_bandwidth(
    _state: tauri::State<'_, Mutex<AppData>>,
) -> Result<String, String> {
    // let mut state = state.lock().unwrap();
    return Ok("".to_string());
}

#[tauri::command]
pub async fn set_lora_spreading_factor(
    _state: tauri::State<'_, Mutex<AppData>>,
) -> Result<String, String> {
    // let mut state = state.lock().unwrap();
    return Ok("".to_string());
}

#[tauri::command]
pub async fn set_lora_sync_word(
    _state: tauri::State<'_, Mutex<AppData>>,
) -> Result<String, String> {
    // let mut state = state.lock().unwrap();
    return Ok("".to_string());
}

#[derive(Default, Serialize, Deserialize, Debug, PartialEq, Clone, Copy)]
struct DeploymentSettings {
    apogee: bool,
    main: bool,
    apogee_delay: f32,
    main_altitude: f32,
}

#[derive(Default, Serialize, Deserialize, Debug, PartialEq, Clone, Copy)]
pub struct SerialSettings {
    pub baud_rate: u32,
}
