<template>
  <div>
    <h2>Subir y Convertir Excel a JSON</h2>
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
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { BaseDirectory } from "@tauri-apps/api/path";

const file = ref(null);
const excelJson = ref([]);


function handleFileChange(event) {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    file.value = selectedFile;
  }
}

// Convertir Excel a JSON 
async function convertExcelToJson() {
  if (!file.value) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    excelJson.value = jsonData;
    console.log("📄 JSON generado:", jsonData);

    try {
      // Guarda el JSON  en el app
      console.log("entre al try");
      await writeTextFile("ClubRegatas_datos.json", JSON.stringify(jsonData), {   
        dir: BaseDirectory.AppData,
      });
      console.log("sali del try");
      console.log("✅ Archivo JSON guardado en la app");
    } catch (error) {     
      console.error("❌ Error al guardar JSON:", error);
    }
  };

  reader.readAsArrayBuffer(file.value);
}
</script>

<style scoped>
pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  max-height: 200px;
  overflow: auto;
}
button {
  margin: 10px;
  padding: 8px;
  font-size: 16px;
  cursor: pointer;
}
</style>
