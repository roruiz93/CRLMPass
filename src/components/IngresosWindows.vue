<template>
    <table>
  <thead>
    <tr>
      <th>Nombre</th>
      <th>Tipo</th>
      <th>Precio</th>
      <th>Fecha</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="ing in ingresos" :key="ing.id">
      <td>{{ ing.name }}</td>
      <td>{{ ing.type }}</td>
      <td>{{ ing.price }}</td>
      <td>{{ new Date(ing.date).toLocaleString() }}</td>
    </tr>
  </tbody>
</table>

</template>
<script setup>
import { getIngresos } from '../utils/indexedDB.js';
import { ref, onMounted, onUnmounted } from "vue";

const ingresos = ref([]);
let intervalo = null;

const cargarIngresos = async () => {
  const datos = await getIngresos();

  // Ordenar por fecha descendente
  ingresos.value = datos.sort((a, b) => new Date(b.date) - new Date(a.date));
};

onMounted(() => {
  cargarIngresos(); // primera carga

  // refrescar cada 5 segundos
  intervalo = setInterval(() => {
    cargarIngresos();
  }, 5000);
});

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo);
});
</script>
