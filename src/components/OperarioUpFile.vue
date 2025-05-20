<template>
    <div>
      <h2>Subir y Guardar Empleados desde Excel</h2>
      <input type="file" @change="handleFileChange" />
      <button @click="convertExcelToJson" :disabled="!file">Convertir y Guardar JSON</button>
  
      <div v-if="excelJson.length">
        <h3>Se cargo con exito</h3>
       <!--<pre>{{ excelJson }}</pre>--> 
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import * as XLSX from "xlsx";
  
  const DB_NAME = "CRLMPassDB";
  const DB_VERSION = 3;
  const file = ref(null);
  const excelJson = ref([]);
  
  // Capturar archivo Excel
  function handleFileChange(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      file.value = selectedFile;
    }
  }
  
  // Convertir Excel a JSON y guardarlo en IndexedDB
  async function convertExcelToJson() {
    if (!file.value) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "array" });
  
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
  
      excelJson.value = jsonData;
      console.log("📄 JSON generado:", jsonData);
  
      // Guardar JSON en IndexedDB
      saveJsonToIndexedDB(jsonData);
    };
  
    reader.readAsArrayBuffer(file.value);
  }
  
  // Guardar JSON en IndexedDB
  function saveJsonToIndexedDB(jsonData) {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("empleados")) {
      db.createObjectStore("empleados", { keyPath: "codigo" });
    }
  };

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction("empleados", "readwrite");
    const store = transaction.objectStore("empleados");

    jsonData.forEach((Empleados) => {
        if (Empleados.codigo) {
          store.put(Empleados); // Guarda cada socio  usando "Socio" como clave
        }
      });

    console.log("✅ JSON guardado en IndexedDB");
  };

  request.onerror = function (event) {
    console.error("❌ Error al guardar en IndexedDB", event.target.error);
  };
}
  </script>
  