<template>
    <div>
      <h2>Resumen de Ingresos</h2>
  
      <div>
        <label>Desde:</label>
        <input type="date" v-model="filtroDesde" />
        <label>Hasta:</label>
        <input type="date" v-model="filtroHasta" />
        <button @click="filtrarIngresos">Filtrar</button>
      </div>
  
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Total (solo invitados)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, tipo) in resumen" :key="tipo">
            <td>{{ tipo }}</td>
            <td>{{ item.cantidad }}</td>
            <td v-if="item.total !== null">{{ item.total }}</td>
            <td v-else>-</td>
          </tr>
          <tr>
            <th>Total General</th>
            <th>{{ totalCantidad }}</th>
            <th>{{ totalImporte }}</th>
          </tr>
        </tbody>
      </table>
  
      <div style="margin-top: 1rem;">
        <button @click="exportarExcel">Exportar a Excel</button>
        <button @click="exportarPDF">Exportar a PDF</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from "vue";
  import { getIngresos } from "../utils/indexedDB.js";
  
  const ingresos = ref([]);
  const filtroDesde = ref('');
  const filtroHasta = ref('');
  const ingresosFiltrados = ref([]);
  
  onMounted(async () => {
    ingresos.value = await getIngresos();
    filtrarIngresos();
  });
  
  function filtrarIngresos() {
    const desde = filtroDesde.value ? new Date(filtroDesde.value) : null;
    const hasta = filtroHasta.value ? new Date(filtroHasta.value + 'T23:59:59') : null;
  
    ingresosFiltrados.value = ingresos.value.filter((ing) => {
      const fecha = new Date(ing.date);
      return (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
    });
  }
  
  const resumen = computed(() => {
    const datos = {};
  
    ingresosFiltrados.value.forEach(ing => {
      if (!datos[ing.type]) {
        datos[ing.type] = { cantidad: 0, total: ['invitado', 'invitadoFEB'].includes(ing.type) ? 0 : null };
      }
  
      datos[ing.type].cantidad += 1;
      if (datos[ing.type].total !== null) {
        datos[ing.type].total += ing.price || 0;
      }
    });
  
    return datos;
  });
  
  const totalCantidad = computed(() =>
    Object.values(resumen.value).reduce((acc, val) => acc + val.cantidad, 0)
  );
  
  const totalImporte = computed(() =>
    Object.values(resumen.value).reduce((acc, val) => acc + (val.total || 0), 0)
  );
  
  // 🟢 Exportación a Excel y PDF (placeholder, se puede mejorar con xlsx y jsPDF)
  function exportarExcel() {
    alert("Exportar a Excel aún no implementado (puedo ayudarte con eso también 😉)");
  }
  
  function exportarPDF() {
    alert("Exportar a PDF aún no implementado (también puedo ayudarte con eso!)");
  }
  </script>
  
  <style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  
  th, td {
    border: 1px solid #ccc;
    padding: 0.5rem;
    text-align: left;
  }
  </style>
  