<template>
  <q-page class="q-pa-md column items-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <div class="text-h6">Buscar Socio</div>
      </q-card-section>

      <!-- Input número de socio -->
      <q-card-section>
        <q-input
          v-model="numeroSocio"
          label="Número de socio"
          type="number"
          @keyup.enter="buscarSocio"
          clearable
        >
          <template v-slot:append>
            <q-btn flat icon="search" @click="buscarSocio" />
          </template>
        </q-input>
      </q-card-section>

      <!-- Datos del socio -->
      <q-card-section v-if="socioEncontrado">
        <q-list bordered>
          <q-item>
            <q-item-section>Nombre:</q-item-section>
            <q-item-section>{{ socio.nombre }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Apellido:</q-item-section>
            <q-item-section>{{ socio.apellido }}</q-item-section>
          </q-item>
        
          <q-item>
            <q-item-section>Relacion:</q-item-section>
            <q-item-section>
              <q-chip 
                :color="socio.Relacion === 'Vigente' ? 'green' : 'red'" 
                text-color="white"
              >
                {{ socio.Relacion }}
              </q-chip>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <!-- Botón Pago -->
      <q-card-actions align="right" v-if="socioEncontrado">
        <q-btn
          :color="socio.Relacion === 'Vigente' ? 'green' : 'red'"
          label="Pago"
          :disable="socio.Relacion === 'Vigente'"
          @click="realizarPago"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { openDatabase } from '../utils/indexedDB.js'
import { buscarSocioEnDB } from '../utils/indexedDB.js'

const $q = useQuasar()
const numeroSocio = ref('')
const socio = ref(null)
const socioEncontrado = ref(false)

// Buscar socio
async function buscarSocio() {
  if (!numeroSocio.value) return

  try {
    const resultado = await buscarSocioEnDB(numeroSocio.value)
    if (resultado) {
      socio.value = resultado
      socioEncontrado.value = true
    } else {
      $q.notify({ type: 'negative', message: 'Socio no encontrado' })
      socio.value = null
      socioEncontrado.value = false
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al buscar socio' })
  }
}

// Marcar pago y resetear input
async function realizarPago() {
  if (!socio.value) return

  try {
    const db = await openDatabase()
    const tx = db.transaction('socios', 'readwrite')
    const store = tx.objectStore('socios')

    const actualizado = { ...socio.value, Relacion: 'Vigente' }

    const request = store.put(actualizado)

    request.onsuccess = () => {
      $q.notify({ type: 'positive', message: 'Pago registrado y Relacion actualizada' })
      
      // Resetear input y ocultar datos
      numeroSocio.value = ''
      socio.value = null
      socioEncontrado.value = false
    }

    request.onerror = () => {
      $q.notify({ type: 'negative', message: 'Error al actualizar socio' })
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.toString() })
  }
}
</script>
