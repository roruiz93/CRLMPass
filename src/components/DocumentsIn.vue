<template>
  <div>
    <h2>Subir y Guardar Excel como JSON</h2>
    <input type="file" @change="handleFileChange" />
    <button @click="convertExcelToJson" :disabled="!file">Convertir y Guardar JSON</button>

    <div v-if="excelJson.length">
      <h3>Datos en JSON:</h3>
      <pre>{{ excelJson }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import * as XLSX from "xlsx";

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
  const request = indexedDB.open("CRLMPassDB", 1);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("socios")) {
      db.createObjectStore("socios", { keyPath: "id" });
    }
  };

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction("socios", "readwrite");
    const store = transaction.objectStore("socios");

    store.put({ id: 1, data: jsonData });

    console.log("✅ JSON guardado en IndexedDB");
  };

  request.onerror = function (event) {
    console.error("❌ Error al guardar en IndexedDB", event.target.error);
  };
}
</script>

<style scoped>
pre {
  background-color: #3c3a3a;
  padding: 10px;
  border-radius: 5px;
  max-height: 200px;
  overflow: auto;
  color: white;
}
button {
  margin: 10px;
  padding: 8px;
  font-size: 16px;
  cursor: pointer;
}
</style>
