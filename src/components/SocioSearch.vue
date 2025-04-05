<template>
  <div>
    <input
  v-model="codigoIngreso"
  placeholder="Ingrese código"
  @keyup.enter="() => buscarUsuario(codigoIngreso)"
/>
    
    <button @click="iniciarScanner">Escanear QR</button>

    <div v-if="usuario" :style="{ backgroundColor: usuario.color, padding: '10px', borderRadius: '5px', color: 'white' }">
      
      <!-- Caso: Socio -->
      <template v-if="usuario.Relacion === 'socio'">
        <p><strong>Código:</strong> {{ usuario.Socio }}</p>
        <p><strong>Nombre:</strong> {{ usuario.Nombre }}</p>
        <p><strong>Relación:</strong>{{ usuario.Relacion }}</p>
      </template>

      <!-- Caso: Empleado -->
      <template v-else-if="usuario.Relacion === 'empleado'">
        <!-- <p><strong>Código:</strong> {{ usuario.codigo }}</p> -->
        <p><strong>Nombre:</strong> {{ usuario.nombre }}</p>
     <!--    <p><strong>Relación:</strong> Empleado</p> -->
      </template>

      <!-- Caso: Socio FEB -->
      <template v-else-if="usuario.Relacion === 'socio-feb'">
        <p><strong>Código:</strong> {{ usuario.idCodigo }}</p>
        <p><strong>Nombre:</strong> {{ usuario.Nombre }}</p>
        
      </template>

      <!-- Caso: Invitado común -->
      <template v-else-if="usuario.Relacion === 'invitado'">
        <p><strong>Invitado</strong> </p>
       
      </template>

      <!-- Caso: Invitado FEB -->
      <template v-else-if="usuario.Relacion === 'invitado-feb'">
        <p><strong>Invitado FEB</strong></p>
        
      </template>

      <!-- Fallback por si hay algo no identificado -->
      <template v-else>
        <p><strong>Desconocido</strong> </p>
      </template>

    </div>

    <video ref="videoElement" v-show="escaneando" autoplay></video>
    <canvas ref="canvasElement" style="display: none;"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { buscarSocioEnDB, buscarEmpleadoEnDB,getConfiguracion,addGuestEntry,addIngresoComun} from "../utils/indexedDB.js";
import jsQR from "jsqr";

export default {
  setup() {
    const codigoIngreso = ref("");
    const usuario = ref(null);
    const escaneando = ref(false);
    const videoElement = ref(null);
    const canvasElement = ref(null);
    let stream = null;

    const colores = {
      "Socio": "green",
      "Empleado": "purple",
      "Invitado": "blue",
      "socio-feb": "teal",
      "invitado-feb": "darkblue",
      "Desconocido": "gray",
    };

    function asignarColor(Relacion) {
      return colores[Relacion] || "gray";
    }

    //BUSCAR USUARIO
    function buscarUsuario(codigoParam) {
      const codigo = String(codigoParam || codigoIngreso.value).trim();


  // 🎯 Casos especiales: Invitado común o Invitado FEB
      if (codigo.toLowerCase() === "invitado" || codigo.toLowerCase() === "invitadofeb") {
      getConfiguracion()
      .then((config) => {
        const tipo = codigo.toLowerCase() === "invitado" ? "invitado" : "invitadoFEB";
        const configInv = config.find(c => c.id === tipo);
        if (configInv) {
          usuario.value = {
            codigo: tipo === "invitado" ? "Invitado" : "Invitado FEB",
            nombre: configInv.nombre || (tipo === "invitado" ? "Invitado" : "Invitado FEB"),
            Relacion: tipo === "invitado" ? "invitado" : "invitado-feb",
            color: tipo === "invitado" ? asignarColor("Invitado") : asignarColor("invitado-feb")
           
          };
        } else {
          usuario.value = {
            codigo,
            nombre: "No encontrado",
            Relacion: "Desconocido",
            color: asignarColor("Desconocido")
          };
        }
        addGuestEntry(tipo,usuario.value.nombre);
      })
      .catch((error) => {
        console.error("Error al buscar invitado:", error);
        usuario.value = {
          codigo,
          nombre: "Error",
          Relacion: "Error",
          color: asignarColor("Desconocido")
        };
      });
    return;
  }

  // 🧠 Validación por formato
  const esEmpleado = /^[a-zA-Z]{3}\d{3}$/.test(codigo);
  const esSocioFeb = /^SF\d{4}$/.test(codigo);
  const esSocio = /^\d+$/.test(codigo);

  // 🔄 Búsqueda en el orden correcto
  const promesaBusqueda = esSocio
    ? buscarSocioEnDB(codigo)
    : esEmpleado
    ? buscarEmpleadoEnDB(codigo)
    : esSocioFeb
    ? buscarSocioFebEnDB(codigo)
    : Promise.resolve(null);

  promesaBusqueda
    .then((data) => {
      if (data?.Socio) {
        usuario.value = { ...data, Relacion: "socio", color: asignarColor("Socio") };
        addIngresoComun("socio", data.Nombre, data.Socio);
      } else if (data?.codigo) {
        usuario.value = { ...data, Relacion: "empleado", color: asignarColor("Empleado") };
        addIngresoComun("empleado", data.nombre, data.codigo);
      } else if (data?.idCodigo) {
        usuario.value = { ...data, Relacion: "socio-feb", color: asignarColor("socio-feb") };
        addIngresoComun("socio-feb", data.nombre || data.idCodigo, data.idCodigo);
      } else {
        usuario.value = {
          codigo,
          nombre: "No encontrado",
          Relacion: "Desconocido",
          color: asignarColor("Desconocido")
        };
      }
    })
    .catch((error) => {
      console.error("Error en la búsqueda:", error);
      usuario.value = {
        codigo,
        nombre: "Error",
        Relacion: "Error",
        color: asignarColor("Desconocido")
      };
    });
}


    function iniciarScanner() {
      escaneando.value = true;
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((videoStream) => {
          stream = videoStream;
          videoElement.value.srcObject = stream;
          escanearQR();
        })
        .catch(console.error);
    }

    function escanearQR() {
  if (!escaneando.value) return;

  const ctx = canvasElement.value.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(videoElement.value, 0, 0, canvasElement.value.width, canvasElement.value.height);
  const imageData = ctx.getImageData(0, 0, canvasElement.value.width, canvasElement.value.height);
  const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

  if (qrCode) {
    const codigo = qrCode.data;

    if (codigo !== codigoIngreso.value) { // Evita escaneo repetido
      codigoIngreso.value = codigo;
      buscarUsuario(codigo);
      
      // Espera 3 segundos antes de volver a escanear
      setTimeout(() => {
        codigoIngreso.value = ""; // limpiamos para permitir escanear de nuevo
        requestAnimationFrame(escanearQR);
      }, 3000);
    } else {
      // Si el mismo código sigue presente, esperamos un poco
      setTimeout(() => requestAnimationFrame(escanearQR), 500);
    }
  } else {
    requestAnimationFrame(escanearQR);
  }
}


    function detenerScanner() {
      escaneando.value = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }

    onUnmounted(() => {
      detenerScanner();
    });

    return {
      codigoIngreso,
      usuario,
      escaneando,
      videoElement,
      canvasElement,
      buscarUsuario,
      iniciarScanner,
      detenerScanner,
    };
  }
};
</script>

<style scoped>
div {
  padding: 10px;
}

video {
  width: 100%;
  max-width: 400px;
  border: 1px solid #ccc;
}
</style>
