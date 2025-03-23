#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{command};

#[derive(Serialize, Deserialize, Debug)]
struct Socio {
    numero_socio: String,
    nombre: String,
    apellido: String,
    deuda: f64,
}
#[derive(Serialize, Deserialize, Debug)]
struct Operarios{
    codigo: String,
    nombre: String,
    categoria:String,
    
}

// 📂 Obtener la ruta donde se guardará el JSON
fn obtener_ruta_archivo() -> PathBuf {
    let mut path = std::env::current_dir().unwrap(); // Carpeta donde corre la app
    path.push("socios.json"); // Nombre del archivo JSON
    path
}

// 🔹 Función para guardar datos en un archivo JSON
#[command]
fn guardar_json(socios: Vec<Socio>) -> Result<String, String> {
    let path = obtener_ruta_archivo();

    // Convertir a JSON con formato legible
    let json = match serde_json::to_string_pretty(&socios) {
        Ok(json) => json,
        Err(e) => return Err(format!("Error serializando JSON: {}", e)),
    };

    // Guardar en archivo
    if let Err(e) = fs::write(&path, json) {
        return Err(format!("Error escribiendo archivo: {}", e));
    }

    println!("✅ Datos guardados en {:?}", path);
    Ok("JSON guardado correctamente".to_string())
}

// 🔹 Función para leer datos desde el archivo JSON
#[command]
fn cargar_json() -> Result<Vec<Socio>, String> {
    let path = obtener_ruta_archivo();

    // Verificar si el archivo existe
    if !path.exists() {
        return Err("No hay archivo JSON guardado".to_string());
    }

    // Leer el contenido del JSON
    let contenido = match fs::read_to_string(&path) {
        Ok(data) => data,
        Err(e) => return Err(format!("Error leyendo archivo: {}", e)),
    };

    // Parsear JSON a Vec<Socio>
    let socios: Vec<Socio> = match serde_json::from_str(&contenido) {
        Ok(socios) => socios,
        Err(e) => return Err(format!("Error parseando JSON: {}", e)),
    };

    println!("📂 Datos cargados: {:?}", socios);
    Ok(socios)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![guardar_json, cargar_json])
        .run(tauri::generate_context!())
        .expect("❌ Error al ejecutar la aplicación Tauri");
}
