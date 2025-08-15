use crate::AppData;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Default, Serialize, Deserialize, Debug, PartialEq, Clone, Copy)]
pub struct SerialSettings {
    pub baud_rate: u32,
}

#[tauri::command]
pub async fn get_serial_settings(
    state: tauri::State<'_, AppData>,
) -> Result<SerialSettings, String> {
    Ok(state.serial.lock().unwrap().settings.clone())
}

#[tauri::command]
pub async fn set_serial_settings(
    settings: SerialSettings,
    state: tauri::State<'_, AppData>,
) -> Result<(), String> {
    state.serial.lock().unwrap().settings = settings;
    Ok(())
}
