<template>
  <div>
    <h2>Buscar Socio, Empleado o Invitado</h2>

    <!-- Input manual -->
    <input v-model="numeroSocio" placeholder="Ingrese número de socio, empleado o invitado" />
    <button @click="identificarTipo">Buscar</button>

    <!-- Botón para escanear QR -->
    <button @click="activarEscaneo">{{ escaneando ? "Detener Escaneo" : "Escanear QR" }}</button>

    <!-- Video de cámara para escaneo -->
    <video id="video" width="100%" height="100%" autoplay v-show="escaneando"></video>

    <!-- Mostrar datos -->
    <div v-if="datosBusqueda" :style="fondoSocio" class="datos-socio">
      <!-- Socio -->
      <div v-if="esSocio">
        <p class="label">Número</p>
        <p class="value">{{ datosBusqueda["Socio"] }}</p>
        <p class="label">Nombre</p>
        <p class="value">{{ datosBusqueda["Nombre"] }}</p>
        
      </div>

      <!-- Empleado -->
      <div v-if="esEmpleado">
        <p class="label">Nombre</p>
        <p class="value">{{ datosBusqueda["nombre"] }}</p>
      </div>

      <!-- Invitado -->
      <div v-if="esInvitado">
       
        <p class="value">Invitado</p>
      </div>
    </div>

    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { BrowserMultiFormatReader } from "@zxing/library";

const numeroSocio = ref("");
const datosBusqueda = ref(null);
const error = ref(null);
const escaneando = ref(false);
const esSocio = ref(false);
const esEmpleado = ref(false);
const esInvitado = ref(false);
const qrSocio = ref(""); // QR del socio para asociar al invitado
const socioAsociado = ref(null); // Nombre del socio asociado
const mostrarInputSocio = ref(false); // Flag para mostrar el campo de asociación

let codeReader = new BrowserMultiFormatReader();
let videoElement = null;

// 📌 Función para identificar el tipo y buscar el socio o empleado
async function identificarTipo() {
  // 1️⃣ Limpiar pantalla antes de cada búsqueda
  error.value = null;
  datosBusqueda.value = null;
  mostrarInputSocio.value = false;
  esSocio.value = false;
  esEmpleado.value = false;
  esInvitado.value = false;
  

  // 2️⃣ Identificar tipo de código ingresado
  if (numeroSocio.value.match(/^\d+$/)) {
    esSocio.value = true;  
  } else if (numeroSocio.value.match(/^[a-zA-Z]{3}[0-9]{3}$/)) {
    esEmpleado.value = true;
  } else if (numeroSocio.value.match(/^[a-zA-Z]+$/)) {
    esInvitado.value = true;
    mostrarInputSocio.value = true;
    guardarEnPagos(numeroSocio.value);
  }

  // 3️⃣ Buscar en la base de datos según el tipo identificado
  if (esSocio.value) {
    datosBusqueda.value = await buscarSocio(numeroSocio.value);
  } else if (esEmpleado.value) {
    datosBusqueda.value = await buscarEmpleado(numeroSocio.value);
  } else if (esInvitado.value) {
    datosBusqueda.value = numeroSocio.value;
  } else {
    error.value = "Número no válido";
  }

  // 4️⃣ Limpiar input después de buscar
  numeroSocio.value = "";
}

// Función para guardar en la base de datos de pagos dependiendo del tipo
async function guardarEnPagos(tipo) {
  if (tipo === "invitado") {
    await agregarPago("invitado", 50);
  } else if (tipo === "invitadoFeb") {
    await agregarPago("invitadoFeb", 40);
  }
}

// Función para agregar el pago en la base de datos de pagos
async function agregarPago(tipo, monto) {
  const pago = {
    tipo: tipo,
    monto: monto,
    fecha: new Date().toLocaleString(),
  };
  console.log("Pago guardado:", pago);
}

// Función para asociar un socio a un invitado
/* async function asociarSocio() {
  if (!numeroSocioAsociado.value) {
    error.value = "Por favor ingrese el número de socio a asociar.";
    return;
  }
} */
// 📌 Buscar socio por número en la base de datos de socios
async function buscarSocio(numero) {
  const request = indexedDB.open("CRLMPassDB", 2);
  return new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction("socios", "readonly");
      const store = transaction.objectStore("socios");
      const getRequest = store.get(1); // Obtener todos los socios

      getRequest.onsuccess = function () {
        const socios = getRequest.result.data;
        const socioEncontrado = socios.find(
          (socio) => String(socio["Socio"]) === numero
        );
        resolve(socioEncontrado);
      };

      getRequest.onerror = function () {
        reject("Error al leer datos de IndexedDB");
      };
    };
    request.onerror = function (event) {
      reject("Error al abrir IndexedDB: " + event.target.error);
    };
  });
}

// 📌 Buscar empleado por código alfanumérico en la base de datos de operarios
async function buscarEmpleado(codigo) {
  const request = indexedDB.open("CRLMPassDB", 2);
  return new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction("operarios", "readonly");
      const store = transaction.objectStore("operarios");
      const getRequest = store.get(1); // Obtener todos los operarios

      getRequest.onsuccess = function () {
        const operarios = getRequest.result.data;
        const empleadoEncontrado = operarios.find(
          (empleado) => String(empleado["codigo"]) === codigo
        );
        resolve(empleadoEncontrado);
      };

      getRequest.onerror = function () {
        reject("Error al leer datos de IndexedDB");
      };
    };
    request.onerror = function (event) {
      reject("Error al abrir IndexedDB: " + event.target.error);
    };
  });
}

// 📌 Asociar socio con invitado
/* const asociarSocio = () => {
  if (!qrSocio.value.trim()) {
    error.value = "Por favor, escanee el QR del socio.";
    return;
  } 

  // Buscar al socio que corresponde al QR escaneado
  const socioEncontrado = buscarSocioByQR(qrSocio.value);

  if (socioEncontrado) {
    socioAsociado.value = socioEncontrado.Nombre;
    console.log(`Invitado asociado con socio ${socioEncontrado.Nombre}`);
    // Aquí registrarías el pago del invitado en la base de datos
    registrarPagoInvitado(socioEncontrado);
  } else {
    error.value = "Socio no encontrado. No se puede asociar al invitado.";
  }
};*/

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
  if (!datosBusqueda.value) return { backgroundColor: "white" };

  const tipoRelacion = datosBusqueda.value["Relacion"] || "Invitado";
  console.log("Tipo de relación detectado:", tipoRelacion);
  if(tipoRelacion)
  switch (tipoRelacion) {
    case "vigente":
      return { backgroundColor: "green", color: "white" };
    case "Licencia":
      return { backgroundColor: "lightblue", color: "black" };
    case "Deudor":
      return { backgroundColor: "red", color: "white" };
    case "Invitado":
      return { backgroundColor: "purple", color: "white" };
    case "No paga":
      return { backgroundColor: "green", color: "white" };
    case "empleado":
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
  font-size: 18px;
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
.Vigente {
  background-color: green;
  color: white;
}
.Licencia {
  background-color: lightblue;
  color: black;
}
.Deudor {
  background-color: red;
  color: white;
}
.Invitado {
  background-color: purple;
  color: white;
}
.No-paga {
  background-color: green;
  color: white;
}
.empleado {
  background-color: rgb(10, 89, 10);
  color: white;
}
.default {
  background-color:aqua;
  color: white;
}

</style>
