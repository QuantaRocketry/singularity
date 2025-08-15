use std::sync::Mutex;

pub mod app;
pub mod device;
pub mod serial;

pub use app::AppSettings;
pub use device::DeviceSettings;
pub use serial::SerialSettings;

use crate::env;
use crate::AppData;

pub const FILE_NAME: &'static str = "settings.json";
