use serde::{Deserialize, Serialize};
use std::{fs, io, path::PathBuf};
use tauri::{AppHandle, Manager};

use crate::{env, AppData};

#[derive(Default, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    cesium_api_key: Option<String>,
}

impl AppSettings {
    pub fn load(path: PathBuf) -> Self {
        let initial_settings = if let Ok(data) = fs::read_to_string(path) {
            serde_json::from_str(&data).unwrap_or_default()
        } else {
            Self::default()
        };

        initial_settings
    }

    pub fn save(&self, path: PathBuf) -> Result<(), io::Error> {
        let data = serde_json::to_string(self).unwrap_or("\n".into());
        fs::write(path, data)?;
        Ok(())
    }
}

#[tauri::command]
pub async fn get_cesium_ion_token(state: tauri::State<'_, AppData>) -> Result<String, ()> {
    let app_settings = state.app_settings.lock().unwrap();
    if let Some(token) = &app_settings.cesium_api_key {
        Ok(token.clone())
    } else {
        Err(())
    }
}

#[tauri::command]
pub async fn set_cesium_ion_token(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppData>,
    token: String,
) -> Result<(), String> {
    let path = app.path().app_data_dir().unwrap().join(super::FILE_NAME);
    let mut app_settings = state.app_settings.lock().unwrap();
    app_settings.cesium_api_key = Some(token);
    app_settings.save(path).map_err(|e| e.to_string())
}
