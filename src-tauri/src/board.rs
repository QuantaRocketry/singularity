use serde::{Deserialize, Serialize};
use std::{collections::HashSet, sync::Mutex};

use crate::AppData;

#[derive(Serialize, Deserialize, Debug, Hash, Eq, PartialEq, Clone, Copy)]
pub enum Capability {
    GPS,
    LoRa,
    Ejection,
}
#[derive(Serialize, Deserialize, Debug, Hash, Eq, PartialEq, Clone, Copy)]
pub enum BoardVariant {
    Entangler,
    Warp,
    Default,
}

impl BoardVariant {
    pub fn get_capabilities(self) -> HashSet<Capability> {
        let mut capabilities = HashSet::new();
        match self {
            BoardVariant::Entangler => {
                capabilities.insert(Capability::GPS);
                capabilities.insert(Capability::LoRa);
            }
            BoardVariant::Warp => {
                capabilities.insert(Capability::GPS);
                capabilities.insert(Capability::Ejection);
            }
            BoardVariant::Default => {} // No capabilities
        }
        capabilities
    }

    pub fn serialize(self) -> String {
        let capabilities = self.get_capabilities();
        serde_json::to_string(&capabilities).unwrap()
    }
}

#[tauri::command]
pub fn get_board_variants() -> Vec<BoardVariant> {
    vec![
        BoardVariant::Entangler,
        BoardVariant::Warp,
        BoardVariant::Default,
    ]
}

#[tauri::command]
pub fn set_board_variant(variant: BoardVariant, state: tauri::State<'_, Mutex<AppData>>) {
    let mut state = state.lock().unwrap();
    state.board_variant = Some(variant);
}

#[tauri::command]
pub async fn get_board_variant(
    state: tauri::State<'_, Mutex<AppData>>,
) -> Result<BoardVariant, String> {
    let state = state.lock().unwrap();
    if let Some(board) = state.board_variant {
        return Ok(board);
    } else {
        return Err("No selected board".to_string());
    }
}
