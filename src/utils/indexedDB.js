const DB_NAME = "CRLMPassDB";
const DB_VERSION = 3;
const STORE_KEYS = {
  socios: "Socio",
  empleados: "codigo",
  socioFeb: "idCodigo",
  configuracion: "id",
  ingresos: "id"
};

// --- Apertura y creación de base de datos ---
export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      Object.entries(STORE_KEYS).forEach(([storeName, keyPath]) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath, autoIncrement: false });
        }
      });

      // Crear valores por defecto en configuración si no existen
      const configuracionStore = event.target.transaction.objectStore("configuracion");
      configuracionStore.put({ id: "invitado", value: 100 });
      configuracionStore.put({ id: "invitadoFEB", value: 50 });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- Agregar empleado ---
export function addEmployeeEntry(employeeData) {
  openDatabase().then((db) => {
    const transaction = db.transaction("empleados", "readwrite");
    const store = transaction.objectStore("empleados");
    store.put(employeeData);
  }).catch(console.error);
}

// --- Agregar entrada de invitado en "ingresos" usando precio de configuración ---
export function addGuestEntry(guestType, guestName) {
  openDatabase().then((db) => {
    const configTx = db.transaction("configuracion", "readonly");
    const configStore = configTx.objectStore("configuracion");
    const configRequest = configStore.get(guestType);

    configRequest.onsuccess = () => {
      const price = configRequest.result?.value || 0;

      registrarIngreso({
        name: guestName,
        type: guestType,
        price
      });
    };
  }).catch(console.error);
}

// ---ingreso comun para socios,socios de FEB y empleados
export function addIngresoComun(tipo, nombre) {
  openDatabase().then((db) => {
    const ingresosTx = db.transaction("ingresos", "readwrite");
    const ingresosStore = ingresosTx.objectStore("ingresos");

    ingresosStore.put({
      id: `${tipo}-${Date.now()}`,
      name: nombre,
      type: tipo,
      price: 0,
      date: new Date().toISOString()
    });
  }).catch(console.error);
}

// --- Obtener toda la configuración ---
export function getConfiguracion() {
  return new Promise((resolve, reject) => {
    openDatabase().then((db) => {
      const tx = db.transaction("configuracion", "readonly");
      const store = tx.objectStore("configuracion");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch(reject);
  });
}

// --- Modificar valores de configuración ---
export function setConfiguracion(id, value) {
  return new Promise((resolve, reject) => {
    openDatabase().then((db) => {
      const tx = db.transaction("configuracion", "readwrite");
      const store = tx.objectStore("configuracion");
      
      // 🔥 Este objeto debe tener `id` válido
      const configObj = { id, value };

      const request = store.put(configObj);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    }).catch(reject);
  });
}


// --- Buscar socio por número ---
export function buscarSocioEnDB(numero) {
  return new Promise((resolve, reject) => {
    openDatabase().then((db) => {
      const tx = db.transaction("socios", "readonly");
      const store = tx.objectStore("socios");
    
      const request = store.get(Number(numero));

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject("Error al leer socio");
    }).catch(reject);
  });
}

// --- Buscar empleado por código ---
export function buscarEmpleadoEnDB(codigo) {
  return new Promise((resolve, reject) => {
    openDatabase().then((db) => {
      const tx = db.transaction("empleados", "readonly");
      const store = tx.objectStore("empleados");
      const request = store.get(String(codigo));

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject("Error al leer empleado");
    }).catch(reject);
  });
}

// --- Buscar socioFEB por idCodigo ---
export function buscarSocioFebEnDB(idCodigo) {
  return new Promise((resolve, reject) => {
    openDatabase().then((db) => {
      const tx = db.transaction("socioFeb", "readonly");
      const store = tx.objectStore("socioFeb");
      const request = store.get(idCodigo);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject("Error al leer socioFEB");
    }).catch(reject);
  });
}
//---REgistrar ingresos---
export function registrarIngreso({ id, name, type = "desconocido", price = 0 }) {
  return openDatabase().then((db) => {
    const ingresosTx = db.transaction("ingresos", "readwrite");
    const ingresosStore = ingresosTx.objectStore("ingresos");

    return ingresosStore.put({
      id: id || `${type}-${Date.now()}`,
      name,
      type,
      price,
      date: new Date().toISOString()
    });
  });
}

//---devuelve los ingresos---
export function getIngresos() {
  return new Promise((resolve, reject) => {
    openDatabase().then((db) => {
      const tx = db.transaction("ingresos", "readonly");
      const store = tx.objectStore("ingresos");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject("Error al obtener ingresos");
    }).catch(reject);
  });
}

export async function getAllFromStore(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject('Error al abrir la base de datos')

    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction(storeName, "readonly")
      const store = tx.objectStore(storeName)
      const all = store.getAll()

      all.onsuccess = () => resolve(all.result)
      all.onerror = () => reject('Error al leer los datos')
    }
  })
}