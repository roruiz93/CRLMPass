#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{command, window};
use lazy_static::lazy_static;
use std::sync::Mutex;
use std::sync::Arc;
#[macro_use] extern crate rocket;
use rocket::{get, post, routes};
use rocket::serde::json::Json;

lazy_static! {
    static ref PAGO_INVITADO: Arc<Mutex<i32>> = Arc::new(Mutex::new(50)); // Valor inicial 50
    static ref PAGO_INVITADOFEB: Arc<Mutex<i32>> = Arc::new(Mutex::new(100)); // Valor inicial 100
}

#[derive(Serialize, Deserialize)]
struct Configuracion {
    invitados: i32,
    invitados_feb: i32,
}

// Obtener configuración de precios
#[get("/get_configuracion")]
fn get_configuracion() -> Json<Configuracion> {
    let invitados = PAGO_INVITADO.lock().unwrap();
    let invitados_feb = PAGO_INVITADOFEB.lock().unwrap();
    Json(Configuracion {
        invitados: *invitados,
        invitados_feb: *invitados_feb,
    })
}

// Modificar la configuración de precios
#[post("/set_configuracion", format = "json", data = "<nueva_config>")]
fn set_configuracion(nueva_config: Json<Configuracion>) {
  

    let mut invitados = PAGO_INVITADO.lock().unwrap();
    let mut invitados_feb = PAGO_INVITADOFEB.lock().unwrap();
    *invitados = nueva_config.invitados;
    *invitados_feb = nueva_config.invitados_feb;
}



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
    relacion: String,    
}

fn obtener_ruta_archivo() -> PathBuf {
    let mut path = std::env::current_dir().unwrap();
    path.push("socios.json");
    path
}

#[command]
fn guardar_json(socios: Vec<Socio>) -> Result<String, String> {
    let path = obtener_ruta_archivo();
    let json = match serde_json::to_string_pretty(&socios) {
        Ok(json) => json,
        Err(e) => return Err(format!("Error serializando JSON: {}", e)),
    };

    if let Err(e) = fs::write(&path, json) {
        return Err(format!("Error escribiendo archivo: {}", e));
    }

    println!("✅ Datos guardados en {:?}", path);
    Ok("JSON guardado correctamente".to_string())
}

#[command]
fn cargar_json() -> Result<Vec<Socio>, String> {
    let path = obtener_ruta_archivo();

    if !path.exists() {
        return Err("No hay archivo JSON guardado".to_string());
    }

    let contenido = match fs::read_to_string(&path) {
        Ok(data) => data,
        Err(e) => return Err(format!("Error leyendo archivo: {}", e)),
    };

    let socios: Vec<Socio> = match serde_json::from_str(&contenido) {
        Ok(socios) => socios,
        Err(e) => return Err(format!("Error parseando JSON: {}", e)),
    };

    println!("📂 Datos cargados: {:?}", socios);
    Ok(socios)
}

fn main() {
    // Inicia el servidor Rocket en otro hilo
    std::thread::spawn(|| {
        rocket::build()
            .mount("/", routes![get_configuracion, set_configuracion])
            .launch();
    });

    // Inicia Tauri (el frontend)
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![guardar_json, cargar_json])
        .run(tauri::generate_context!())
        .expect("❌ Error al ejecutar la aplicación Tauri");
}
