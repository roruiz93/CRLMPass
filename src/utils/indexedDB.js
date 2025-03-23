export function saveJsonToIndexedDB(storeName, jsonData) {
    const request = indexedDB.open("CRLMPassDB", 1);
  
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
  
      if (!db.objectStoreNames.contains("operarios")) {
        db.createObjectStore("operarios", { keyPath: "codigo" });
      }
  
      if (!db.objectStoreNames.contains("socios")) {
        db.createObjectStore("socios", { keyPath: "numero_socio" });
      }
    };
  
    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction([storeName], "readwrite");
      const objectStore = transaction.objectStore(storeName);
  
      jsonData.forEach((item, index) => {
        let key = storeName === "operarios" ? index + 1 : item.numero_socio;
  
        // ⚠️ Verificar si la clave existe antes de guardar
        if (!key) {
          console.error(`❌ Error: Objeto inválido en ${storeName}`, item);
          return;
        }
  
        objectStore.put({ ...item, id: key });
      });
  
      console.log(`✅ JSON guardado en IndexedDB en la tienda '${storeName}'`);
    };
  
    request.onerror = function (event) {
      console.error(`❌ Error al guardar en IndexedDB (${storeName})`, event.target.error);
    };
  }
  