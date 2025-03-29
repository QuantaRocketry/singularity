use crate::AppData;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Default, Serialize, Deserialize, Debug, PartialEq, Clone, Copy)]
pub struct SerialSettings {
    pub baud_rate: u32,
}

#[tauri::command]
pub async fn get_serial_settings(
    state: tauri::State<'_, Mutex<AppData>>,
) -> Result<SerialSettings, String> {
    let state = state.lock().unwrap();
    Ok(state.serial.settings.clone())
}

#[tauri::command]
pub async fn set_serial_settings(
    settings: SerialSettings,
    state: tauri::State<'_, Mutex<AppData>>,
) -> Result<(), String> {
    let mut state = state.lock().unwrap();
    state.serial.settings = settings;
    Ok(())
}
