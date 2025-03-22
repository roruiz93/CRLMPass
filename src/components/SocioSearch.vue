<template>
  <div>
    <h2>Buscar Socio</h2>

    <!-- Input manual -->
    <input v-model="numeroSocio" placeholder="Ingrese número de socio" />
    <button @click="buscarSocio">Buscar Socio</button>

    <!-- Botón para escanear QR -->
    <button @click="activarEscaneo">{{ escaneando ? "Detener Escaneo" : "Escanear QR" }}</button>

    <!-- Video de cámara para escaneo -->
    <video id="video" width="100%" height="100%" autoplay v-show="escaneando"></video>

    <!-- Mostrar datos del socio -->
    <div v-if="datosSocio" :style="fondoSocio"  class="datos-socio">
      <p class="label">Número de socio</p>
      <p class="value">{{ datosSocio["Socio"] }}</p>
      <p class="label">Socio</p>
      <p class="value">{{datosSocio["Nombre"] }}</p>
    </div>

    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { BrowserMultiFormatReader } from "@zxing/library";

const numeroSocio = ref("");
const datosSocio = ref(null);
const error = ref(null);
const escaneando = ref(false);
let codeReader = new BrowserMultiFormatReader();
let videoElement = null;

// 📌 Función para buscar socio en IndexedDB
async function buscarSocio() {
  error.value = null;
  datosSocio.value = null;

  const request = indexedDB.open("CRLMPassDB", 1);

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction("socios", "readonly");
    const store = transaction.objectStore("socios");

    const getRequest = store.get(1);

    getRequest.onsuccess = function () {
      if (getRequest.result) {
        const socios = getRequest.result.data;
        const socioEncontrado = socios.find(
          (socio) => String(socio["Socio"]) === numeroSocio.value
        );

        if (socioEncontrado) {
          datosSocio.value = socioEncontrado;
        } else {
          error.value = "Número de socio no encontrado";
        }
      } else {
        error.value = "No hay datos guardados";
      }
    };

    getRequest.onerror = function () {
      error.value = "Error al leer datos de IndexedDB";
    };
  };

  request.onerror = function (event) {
    error.value = "Error al abrir IndexedDB: " + event.target.error;
  };
}

// 📌 Iniciar escaneo de QR con @zxing/library
function iniciarEscaneo() {
  videoElement = document.getElementById("video");

  codeReader
    .decodeFromVideoDevice(null, videoElement, (result, err) => {
      if (result) {
        console.log("QR detectado:", result.getText());
        numeroSocio.value = result.getText().trim();
        escaneando.value = false;
        detenerEscaneo(); // 🔹 Detener el escaneo una vez que detecte el QR
        buscarSocio();
      } else if (err && err.name !== "NotFoundException") {
        console.error("Error al escanear QR:", err);
        error.value = "No se pudo leer el código QR. Intenta nuevamente.";
      }
    })
    .catch((error) => {
      console.error("Error al iniciar escaneo:", error);
      error.value = "No se pudo acceder a la cámara.";
    });
}

// 📌 Activar/desactivar el escaneo
function activarEscaneo() {
  escaneando.value = !escaneando.value;
  if (escaneando.value) {
    iniciarEscaneo();
  } else {
    detenerEscaneo();
  }
}

// 📌 Detener el escaneo y liberar recursos
function detenerEscaneo() {
  codeReader.reset();
  console.log("Escaneo detenido");
}

// 📌 Limpiar antes de destruir el componente
onBeforeUnmount(() => {
  detenerEscaneo();
});

// 📌 Computada para determinar el fondo según el estado
const fondoSocio = computed(() => {
  if (!datosSocio.value) return { backgroundColor: "white" };

  const tipoRelacion = datosSocio.value["Relacion"].trim().toLowerCase();
  console.log("Tipo de relación detectado:", tipoRelacion);
  switch (tipoRelacion) {
    case "vigente":
      return { backgroundColor: "green", color: "white" };
    case "licencia":
      return { backgroundColor: "lightblue", color: "black" };
    case "deudor":
      return { backgroundColor: "red", color: "white" };
    case "invitado":
      return { backgroundColor: "purple", color: "white" };
    case "no paga":
      return { backgroundColor: "darkgreen", color: "white" };
    default:
      return { backgroundColor: "gray", color: "white" };
  }
});


</script>

<style scoped>
.datos-socio {
  text-align: center; /* Centra el contenido */
  padding: 20px;
  border-radius: 10px;
  max-width: 400px;
  margin: 20px auto;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

.label {
  font-weight: bold;
  font-size: 24px;
  margin-top: 10px;
}

.value {
  font-size: 22px;
  margin-bottom: 10px;
}
pre {
  
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
.vigente {
  background-color: green;
  color: white;
}
.licencia {
  background-color: lightblue;
  color: black;
}
.deudor {
  background-color: red;
  color: white;
}
.invitado {
  background-color: purple;
  color: white;
}
.no-paga {
  background-color: darkgreen;
  color: white;
}
.default {
  background-color:aqua;
  color: white;
}

</style>
