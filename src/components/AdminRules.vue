<template>
    <div>
      <h2>Administración de Reglas de Acceso</h2>
  
      <div>
        <button @click="mostrarModificarPrecioInvitado = !mostrarModificarPrecioInvitado">
          Modificar Precio de Invitados
        </button>
        <div v-if="mostrarModificarPrecioInvitado">
          <label>Nuevo Precio de Invitados:</label>
          <input v-model="precioInvitado" type="number" />
          <button @click="modificarPrecioInvitado">Modificar Precio</button>
        </div>
      </div>
  
      <div>
        <button @click="mostrarModificarPrecioInvitadoFeb = !mostrarModificarPrecioInvitadoFeb">
          Modificar Precio de Invitados FEB
        </button>
        <div v-if="mostrarModificarPrecioInvitadoFeb">
          <label>Nuevo Precio de Invitados FEB:</label>
          <input v-model="precioInvitadoFeb" type="number" />
          <button @click="modificarPrecioInvitadoFeb">Modificar Precio</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { getConfiguracion, setConfiguracion } from "../utils/indexedDB.js";
  
  const precioInvitado = ref(0);
  const precioInvitadoFeb = ref(0);
  const mostrarModificarPrecioInvitado = ref(false);
  const mostrarModificarPrecioInvitadoFeb = ref(false);
  
  onMounted(async () => {
    try {
      const config = await getConfiguracion();
      if (config.length > 0) {
        precioInvitado.value = config[0].invitado || 0;
        precioInvitadoFeb.value = config[0].invitadoFEB || 0;
      }
    } catch (err) {
      console.error("Error al cargar configuración", err);
    }
  });
  
  async function modificarPrecioInvitado() {
    try {
      await setConfiguracion({ invitado: precioInvitado.value, invitadoFEB: precioInvitadoFeb.value });
      mostrarModificarPrecioInvitado.value = false;
    } catch (err) {
      console.error("Error al actualizar el precio de invitados:", err);
    }
  }
  
  async function modificarPrecioInvitadoFeb() {
    try {
      await setConfiguracion({ invitado: precioInvitado.value, invitadoFEB: precioInvitadoFeb.value });
      mostrarModificarPrecioInvitadoFeb.value = false;
    } catch (err) {
      console.error("Error al actualizar el precio de invitados FEB:", err);
    }
  }
  </script>
  