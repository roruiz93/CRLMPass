<template>
    <div>
      <h2>Administración de Reglas de Acceso</h2>
  
      <!-- Botón para modificar el precio de los invitados -->
      <div>
        <button @click="mostrarModificarPrecioInvitado = !mostrarModificarPrecioInvitado">
          Modificar Precio de Invitados
        </button>
        <div v-if="mostrarModificarPrecioInvitado">
          <label for="precioInvitado">Nuevo Precio de Invitados:</label>
          <input v-model="precioInvitado" type="number" placeholder="Precio de invitados" />
          <button @click="modificarPrecioInvitado">Modificar Precio</button>
        </div>
      </div>
  
      <!-- Registro de pagos -->
      <div>
        <button @click="mostrarRegistrarPago = !mostrarRegistrarPago">
          Registrar Pago
        </button>
        <div v-if="mostrarRegistrarPago">
          <label for="numeroSocio">Número de Socio:</label>
          <input v-model="numeroSocio" placeholder="Ingrese número de socio o invitado" />
  
          <label for="montoPago">Monto de Pago:</label>
          <input v-model="montoPago" type="number" placeholder="Monto" />
  
          <button @click="registrarPago">Registrar Pago</button>
        </div>
      </div>
  
      <!-- Información de empleados -->
      <div>
        <h3>Horarios de Ingreso y Egreso de Empleados</h3>
        <table>
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Ingreso</th>
              <th>Egreso</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="empleado in empleados" :key="empleado.id">
              <td>{{ empleado.nombre }}</td>
              <td>{{ empleado.ingreso }}</td>
              <td>{{ empleado.egreso }}</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Botón para mostrar cantidad de ingresos por invitados -->
      <div>
        <button @click="mostrarCantidadIngresos">Mostrar Ingresos de Invitados</button>
        <p v-if="ingresosPorInvitados.total > 0">
          Total de ingresos de invitados: ${{ ingresosPorInvitados.total }} (debería haber en cuenta: ${{ ingresosPorInvitados.debeEnCuenta }})
        </p>
      </div>
  
      <!-- Mostrar información del pago registrado -->
      <div v-if="pagoRegistrado">
        <h3>Pago Registrado:</h3>
        <p><strong>Socio o Invitado:</strong> {{ pagoRegistrado.nombre }}</p>
        <p><strong>Monto:</strong> {{ pagoRegistrado.monto }}</p>
        <p><strong>Fecha:</strong> {{ pagoRegistrado.fecha }}</p>
        <p v-if="pagoRegistrado.invitadorSocio">
          <strong>Invitador:</strong> {{ pagoRegistrado.invitadorSocio }}
        </p>
      </div>
  
      <!-- Mostrar errores -->
      <p v-if="error">{{ error }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  
  // Variables de entrada
  const numeroSocio = ref("");
  const montoPago = ref(0);
  const precioInvitado = ref(0); // Precio de los invitados
  const tipoAcceso = ref("socio"); // Puede ser 'socio' o 'invitado'
  const numeroSocioInvitador = ref("");
  const pagoRegistrado = ref(null);
  const error = ref(null);
  const empleados = ref([
    { id: 1, nombre: "Juan Pérez", ingreso: "08:00 AM", egreso: "05:00 PM" },
    { id: 2, nombre: "Ana Gómez", ingreso: "09:00 AM", egreso: "06:00 PM" },
    // Aquí deberías cargar los empleados desde tu base de datos
  ]);
  
  // Información sobre ingresos de invitados
  const ingresosPorInvitados = ref({
    total: 0,
    debeEnCuenta: 0,
  });
  
  // Estado para mostrar/ocultar formularios
  const mostrarModificarPrecioInvitado = ref(false);
  const mostrarRegistrarPago = ref(false);
  
  // Modificar el precio de los invitados
  function modificarPrecioInvitado() {
    error.value = null;
  
    if (precioInvitado.value <= 0) {
      error.value = "El precio debe ser un valor mayor a 0.";
      return;
    }
  
    // Aquí deberías actualizar el precio en tu base de datos (IndexedDB, API, etc.)
    console.log("Precio de invitado modificado a: $" + precioInvitado.value);
    mostrarModificarPrecioInvitado.value = false; // Ocultar formulario después de modificar
  }
  
  // Función para registrar el pago
  function registrarPago() {
    error.value = null;
  
    const numeroSocioLimpiado = numeroSocio.value.trim();
    const monto = parseFloat(montoPago.value);
  
    if (!numeroSocioLimpiado) {
      error.value = "Por favor ingrese un número de socio o invitado.";
      return;
    }
  
    if (isNaN(monto) || monto <= 0) {
      error.value = "El monto debe ser un número válido y mayor a 0.";
      return;
    }
  
    if (tipoAcceso.value === "invitado" && !numeroSocioInvitador.value.trim()) {
      error.value = "El número de socio que invitó es obligatorio para los invitados.";
      return;
    }
  
    // Registrar el pago en la base de datos (IndexedDB, API o cualquier método que uses)
    const request = indexedDB.open("CRLMPassDB", 1);
  
    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction("pagos", "readwrite");
      const pagosStore = transaction.objectStore("pagos");
  
      const nuevoPago = {
        Socio: numeroSocioLimpiado,
        Nombre: tipoAcceso.value === "invitado" ? "Invitado" : "Socio",
        Fecha: new Date().toISOString(),
        Monto: monto,
        InvitadorSocio: tipoAcceso.value === "invitado" ? numeroSocioInvitador.value.trim() : null, // Solo si es invitado
      };
  
      pagosStore.add(nuevoPago);
  
      pagoRegistrado.value = {
        nombre: tipoAcceso.value === "invitado" ? "Invitado" : "Socio",
        monto: monto,
        fecha: nuevoPago.Fecha,
        invitadorSocio: nuevoPago.InvitadorSocio,
      };
  
      // Si es un invitado, sumar el monto para calcular ingresos
      if (tipoAcceso.value === "invitado") {
        ingresosPorInvitados.value.total += monto;
        ingresosPorInvitados.value.debeEnCuenta = ingresosPorInvitados.value.total * precioInvitado.value;
      }
  
      numeroSocio.value = "";
      montoPago.value = 0;
      numeroSocioInvitador.value = "";
      tipoAcceso.value = "socio";
      mostrarRegistrarPago.value = false; // Ocultar formulario después de registrar pago
    };
  
    request.onerror = function (event) {
      error.value = "Error al registrar el pago: " + event.target.error;
    };
  }
  
  // Función para mostrar la cantidad de ingresos
  function mostrarCantidadIngresos() {
    if (ingresosPorInvitados.value.total === 0) {
      error.value = "No hay ingresos registrados para los invitados.";
    }
  }
  </script>
  
  <style scoped>
  input {
    margin: 10px 0;
    padding: 5px;
  }
  
  button {
    padding: 10px;
    font-size: 16px;
    cursor: pointer;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  select {
    padding: 5px;
  }
  
  table {
    width: 100%;
    margin-top: 20px;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: center;
  }
  
  p {
    font-size: 16px;
  }
  
  h3 {
    font-size: 18px;
    color: green;
  }
  </style>
  