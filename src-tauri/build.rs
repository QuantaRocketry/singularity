use std::{env, fs, path::Path};

fn main() {
    println!("cargo:rerun-if-file-changed=.env");
    println!("cargo:rerun-if-env-changed=CESIUM_ION_ACCESS_TOKEN");

    if dotenv::dotenv().is_ok() {
        println!("cargo:warning=Successfully loaded .env file");
    }

    let env_dir = env::var("OUT_DIR").expect("OUT_DIR must be set by Cargo");
    let dest_path = Path::new(&env_dir).join("env.rs");

    let version_string = env::var("CESIUM_ION_ACCESS_TOKEN");

    let rust_code = match version_string {
        Ok(v) => format!(
            "mod env {{ pub const CESIUM_ION_ACCESS_TOKEN: Option<&[u8]> = Some(b\"{}\"); }}",
            v
        ),
        Err(_) => {
            println!("cargo:warning=no env var");
            format!("mod env {{ pub const CESIUM_ION_ACCESS_TOKEN: Option<&[u8]> = None; }}",)
        }
    };

    fs::write(&dest_path, rust_code).expect("Failed to write version.rs");

    tauri_build::build()
}
