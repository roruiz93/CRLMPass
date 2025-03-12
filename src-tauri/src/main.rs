// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::{self, Value}; // Para manejar JSON en Rust
use std::fs;
use std::fs::read_to_string;
use std::path::{Path, PathBuf};
use tauri::{command, AppHandle, Manager};

// Buscar un socio en el JSON guardado
#[command]
fn buscar_socio(app_handle: tauri::AppHandle, numero_socio: String) -> Result<String, String> {
    let json_path = obtener_ruta_base(&app_handle)?.join("ClubRegatas_datos.json");

    if !json_path.exists() {
        return Err("No hay archivo JSON guardado".to_string());
    }

    // Leer el contenido del JSON
    let json_content = read_to_string(&json_path).map_err(|e| format!("Error al leer JSON: {}", e))?;
    let json_data: Vec<Value> = serde_json::from_str(&json_content).map_err(|e| format!("Error al parsear JSON: {}", e))?;

    // Buscar el socio en la lista
    for socio in json_data.iter() {
        if let Some(socio_num) = socio.get("Número de Socio").and_then(|n| n.as_str()) {
            if socio_num == numero_socio {
                return serde_json::to_string(&socio)
                    .map_err(|e| format!("Error serializando datos: {}", e));
            }
        }
    }

    // Envia un error 
    Err(format!(r#"{{"error": "Número de socio no encontrado"}}"#))
}


// Guardar el JSON en la aplicación (cuando se sube un nuevo archivo)
#[command]
fn guardar_json(app_handle: tauri::AppHandle, json_data: String) -> Result<String, String> {
    let json_path = obtener_ruta_base(&app_handle)?.join("ClubRegatas_datos.json");

    if let Some(parent) = json_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    fs::write(&json_path, json_data).map_err(|e| e.to_string())?;
    Ok("JSON guardado correctamente".to_string())
}

// Obtener la ruta del JSON guardado
#[command]
fn obtener_ruta_json_guardado(app_handle: tauri::AppHandle) -> Result<String, String> {
    let json_path = obtener_ruta_base(&app_handle)?.join("ClubRegatas_datos.json");

    if json_path.exists() {
        Ok(json_path.to_string_lossy().to_string())
    } else {
        Err("No hay archivo JSON guardado".to_string())
    }
}

// Función auxiliar para obtener la ruta base de la aplicación
fn obtener_ruta_base(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    app_handle
        .path()
        .app_data_dir()
        .map_err(|e| {
            format!(
                "Error al obtener el directorio de datos de la aplicación: {}",
                e
            )
        })
        .map(|dir| dir.join("CRLMPass"))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            buscar_socio,
            guardar_json,
            obtener_ruta_json_guardado
        ])
        .run(tauri::generate_context!())
        .expect("❌ Error al ejecutar la aplicación Tauri");
}
