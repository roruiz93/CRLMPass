<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Informe de Ingresos</div>

        <div class="q-mt-md q-gutter-md">
          <q-input v-model="filtro.fecha" type="date" label="Fecha específica" outlined dense />
          <q-input v-model="filtro.desde" type="date" label="Desde" outlined dense />
          <q-input v-model="filtro.hasta" type="date" label="Hasta" outlined dense />

          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Tipo de Ingreso</div>
            <q-btn-group outline class="q-mt-sm">
              <q-btn
                v-for="tipo in tipos"
                :key="tipo.value"
                :label="tipo.label"
                :color="filtro.tipo === tipo.value ? 'primary' : 'grey'"
                @click="filtro.tipo = filtro.tipo === tipo.value ? '' : tipo.value"
              />
            </q-btn-group>
          </div>
        </div>

        <div class="q-mt-md">
          <q-btn color="primary" label="Filtrar" @click="filtrarIngresos" />
          <q-btn color="secondary" label="Limpiar Filtros" flat @click="limpiarFiltros" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="ingresosFiltrados"
          :columns="columnas"
          row-key="id"
          flat
          bordered
        />

        <div class="q-mt-md text-right">
          <strong>Total: ${{ total }}</strong>
        </div>

        <div class="q-mt-md q-gutter-sm">
          <q-btn color="green" label="Exportar Excel" @click="exportarExcel" />
          <q-btn color="red" label="Exportar PDF" @click="exportarPDF" />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { exportToExcel, exportToPDF } from '@/utils/exportUtils'
import { getAllFromStore, openDatabase } from '../utils/indexedDB'

const filtro = ref({
  fecha: '',
  desde: '',
  hasta: '',
  tipo: ''
})

const tipos = [
  { label: 'Socio', value: 'socio' },
  { label: 'Empleado', value: 'empleado' },
  { label: 'Socio FEB', value: 'socio-feb' },
  { label: 'Invitado', value: 'invitado' },
  { label: 'Invitado FEB', value: 'invitado-feb' }
]

const ingresosFiltrados = ref([])
const total = ref(0)

const columnas = [
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    format: val => new Date(val).toLocaleDateString()
  },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' },
  {
    name: 'monto',
    label: 'Monto',
    field: 'monto',
    align: 'right',
    format: val => `$${val}`
  }
]

const cargarIngresos = async () => {
  const datos = await getAllFromStore('ingresos')
  ingresosFiltrados.value = datos.map(i => ({
    fecha: i.date,
    nombre: i.name,
    tipo: i.type,
    monto: i.price
  }))
  calcularTotal()
}

const filtrarIngresos = async () => {
  try {
    const db = await openDatabase()
    const transaction = db.transaction('ingresos', 'readonly')
    const store = transaction.objectStore('ingresos')

    const request = store.getAll()

    request.onsuccess = () => {
      const ingresos = request.result

      function resetHora(fecha) {
        const nuevaFecha = new Date(fecha)
        nuevaFecha.setHours(0, 0, 0, 0)
        return nuevaFecha
      }

      let ingresosFiltradosResultado = ingresos.filter(i => {
        const fechaIngresoOriginal = new Date(i.date)
        const fechaIngreso = resetHora(fechaIngresoOriginal)

        const fechaFiltro = filtro.value.fecha ? resetHora(new Date(filtro.value.fecha)) : null
        const desde = filtro.value.desde ? resetHora(new Date(filtro.value.desde)) : null
        const hasta = filtro.value.hasta ? resetHora(new Date(filtro.value.hasta)) : null

        if (isNaN(fechaIngresoOriginal) || (fechaFiltro && isNaN(fechaFiltro)) || (desde && isNaN(desde)) || (hasta && isNaN(hasta))) {
          return false
        }

        return (
          (!fechaFiltro || fechaIngreso.getTime() === fechaFiltro.getTime()) &&
          (!desde || fechaIngreso >= desde) &&
          (!hasta || fechaIngreso <= hasta)
        )
      })

      if (filtro.value.tipo) {
        ingresosFiltradosResultado = ingresosFiltradosResultado.filter(i => i.type === filtro.value.tipo)
      }

      ingresosFiltrados.value = ingresosFiltradosResultado.map(i => ({
        fecha: i.date,
        nombre: i.name,
        tipo: i.type,
        monto: i.price
      }))

      calcularTotal()
    }

    request.onerror = () => {
      console.error('Error al obtener los ingresos desde IndexedDB')
    }
  } catch (error) {
    console.error('Error al abrir la base de datos:', error)
  }
}

const calcularTotal = () => {
  total.value = ingresosFiltrados.value.reduce((sum, i) => sum + (i.monto || 0), 0)
}

const exportarExcel = async () => {
  try {
    await exportToExcel(ingresosFiltrados.value, 'Informe_de_Ingresos')
    alert('Exportación a Excel completada con éxito!')
  } catch (error) {
    alert('Error al exportar a Excel')
  }
}

const exportarPDF = async () => {
  try {
    await exportToPDF(ingresosFiltrados.value, 'Informe_de_Ingresos')
    alert('Exportación a PDF completada con éxito!')
  } catch (error) {
    alert('Error al exportar a PDF')
  }
}

const limpiarFiltros = () => {
  filtro.value.fecha = ''
  filtro.value.desde = ''
  filtro.value.hasta = ''
  filtro.value.tipo = ''
  cargarIngresos()
}

cargarIngresos()
</script>


