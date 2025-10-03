<template>
  <div class="contenedor">
    <!-- Input -->
    <div class="input-section">
      <input
        v-model="codigoIngreso"
        placeholder="Ingrese código"
        @keyup.enter="() => buscarUsuario(codigoIngreso)"
      />
    </div>

    <!-- Contenedor principal: Datos + Cámara -->
    <div class="principal">
      <!-- Datos usuario -->
      <div class="datos">
        <div 
          v-if="usuario"  
          :style="{ 
            backgroundColor: usuario.color,
            width:'100%', 
            height:'98%', 
            borderRadius: '5px', 
            color: 'white', 
            fontFamily:'Georgia', 
            fontSize:'22px',
            padding:'20px',
            display:'flex',
            flexDirection:'column',
            justifyContent:'center',
            alignItems:'center'
          }"
        >
          <template v-if="usuario.Relacion === 'socio'">
            <p><strong>Código:</strong> {{ usuario.Socio }}</p>
            <p><strong>Nombre:</strong> {{ usuario.Nombre }}</p>
            <p><strong>Relación:</strong> Socio</p>
          </template>

          <template v-else-if="usuario.Relacion === 'empleado'">
            <p><strong>Nombre:</strong> {{ usuario.nombre }}</p>
            <p><strong>Relación:</strong> Empleado</p>
          </template>

          <template v-else-if="usuario.Relacion === 'socio-feb'">
            <p><strong>Código:</strong> {{ usuario.idCodigo }}</p>
            <p><strong>Nombre:</strong> {{ usuario.Nombre }}</p>
            <p><strong>Relación:</strong> Socio FEB</p>
          </template>

          <template v-else-if="usuario.Relacion === 'invitado'">
            <p><strong>Invitado</strong></p>
          </template>

          <template v-else-if="usuario.Relacion === 'invitado-feb'">
            <p><strong>Invitado FEB</strong></p>
          </template>

          <template v-else>
            <p><strong>Desconocido</strong></p>
          </template>
        </div>
      </div>

      <!-- Cámara -->
      <div class="camara">
        <video ref="videoElement" v-show="escaneando" autoplay></video>
        <canvas ref="canvasElement" style="display: none;"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { buscarSocioEnDB, buscarEmpleadoEnDB, buscarSocioFebEnDB, getConfiguracion, addGuestEntry, addIngresoComun } from "../utils/indexedDB.js";
import jsQR from "jsqr";

export default {
  setup() {
    const codigoIngreso = ref("");
    const usuario = ref(null);
    const escaneando = ref(false);
    const videoElement = ref(null);
    const canvasElement = ref(null);
    let stream = null;

    // Función para asignar color según tipo y relación
    function colorSegunRelacion(relacion, tipo) {
      if (tipo === "socio") {
        switch (relacion?.toLowerCase()) {
          case "deudores": return "#8B0000"; // rojo oscuro
          case "licencia": return "#90EE90"; // verde claro
          case "vigente": return "green";    // verde
          case "no paga": return "orange";   // naranja
          default: return "orange";
        }
      }
      const colores = {
        "Empleado": "purple",
        "Invitado": "blue",
        "socio-feb": "teal",
        "invitado-feb": "darkblue",
        "Desconocido": "gray"
      };
      return colores[tipo] || "gray";
    }

    // === Buscar Usuario ===
    function buscarUsuario(codigoParam) {
      const codigo = String(codigoParam || codigoIngreso.value).trim();

      // Casos especiales: invitados
      if (codigo.toLowerCase() === "invitado" || codigo.toLowerCase() === "invitadofeb") {
        getConfiguracion()
          .then(config => {
            const tipo = codigo.toLowerCase() === "invitado" ? "invitado" : "invitado-feb";
            const configInv = config.find(c => c.id === tipo);
            usuario.value = {
              codigo: tipo === "invitado" ? "Invitado" : "Invitado FEB",
              nombre: configInv?.nombre || (tipo === "invitado" ? "Invitado" : "Invitado FEB"),
              Relacion: tipo,
              color: colorSegunRelacion(null, tipo)
            };
            addGuestEntry(tipo, usuario.value.nombre);
          })
          .catch(() => {
            usuario.value = {
              codigo,
              nombre: "Error",
              Relacion: "Desconocido",
              color: colorSegunRelacion(null, "Desconocido")
            };
          });
        return;
      }

      // Validación por formato
      const esEmpleado = /^[a-zA-Z]{3}\d{3}$/.test(codigo);
      const esSocioFeb = /^SF\d{4}$/.test(codigo);
      const esSocio = /^\d+$/.test(codigo);

      const promesaBusqueda = esSocio
        ? buscarSocioEnDB(codigo)
        : esEmpleado
        ? buscarEmpleadoEnDB(codigo)
        : esSocioFeb
        ? buscarSocioFebEnDB(codigo)
        : Promise.resolve(null);

      promesaBusqueda
        .then(data => {
          if (data?.Socio) {
            usuario.value = {
              ...data,
              Relacion: "socio",
              color: colorSegunRelacion(data.Relacion, "socio")
            };
            addIngresoComun("socio", data.Nombre, data.Socio);
          } else if (data?.codigo) {
            usuario.value = { ...data, Relacion: "empleado", color: colorSegunRelacion(null, "Empleado") };
            addIngresoComun("empleado", data.nombre, data.codigo);
          } else if (data?.idCodigo) {
            usuario.value = { ...data, Relacion: "socio-feb", color: colorSegunRelacion(null, "socio-feb") };
            addIngresoComun("socio-feb", data.Nombre || data.idCodigo, data.idCodigo);
          } else {
            usuario.value = {
              codigo,
              nombre: "No encontrado",
              Relacion: "Desconocido",
              color: colorSegunRelacion(null, "Desconocido")
            };
          }
        })
        .catch(() => {
          usuario.value = {
            codigo,
            nombre: "Error",
            Relacion: "Error",
            color: colorSegunRelacion(null, "Desconocido")
          };
        });
    }

    // === Cámara ===
    function iniciarScanner() {
      escaneando.value = true;
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(videoStream => {
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
        if (codigo !== codigoIngreso.value) {
          codigoIngreso.value = codigo;
          buscarUsuario(codigo);
          setTimeout(() => {
            codigoIngreso.value = "";
            requestAnimationFrame(escanearQR);
          }, 3000);
        } else {
          setTimeout(() => requestAnimationFrame(escanearQR), 500);
        }
      } else {
        requestAnimationFrame(escanearQR);
      }
    }

    function detenerScanner() {
      escaneando.value = false;
      if (stream) stream.getTracks().forEach(track => track.stop());
    }

    onMounted(() => iniciarScanner());
    onUnmounted(() => detenerScanner());

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
.contenedor {
  padding: 20px;
  max-width: 1000px;
  margin: auto;
}

.input-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.input-section input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
}

.principal {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: stretch;
  flex-wrap: wrap;
}

.datos {
  flex:1;
  display: flex;
  border-radius: 8px;
}

.camara {
  flex:1;
  border-radius: 8px;
}

video {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
  object-fit: cover;
}
</style>
