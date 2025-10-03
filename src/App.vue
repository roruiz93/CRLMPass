<template>
  <q-layout view="lHh Lpr lFf">
    <div id="q-app" style="min-height: 1vh;">
      <div class="q-pa-md row items-center justify-between">
        <!-- Menú principal -->
        <q-btn-dropdown
          split
          color="red"
          text-color="black"
          push
          glossy
          no-caps
          icon="reorder"
          @click="onMainClick"
        >
          <q-list>
            <!-- Solo visible para admin -->
            <q-item clickable v-close-popup to="/configuraciones" v-if="rol === 'admin'">
              <q-item-section avatar>
                <q-avatar icon="settings" color="red" text-color="black" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Configuraciones</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Solo visible para admin -->
            <q-item clickable v-close-popup to="/archivos">
              <q-item-section avatar>
                <q-avatar icon="unarchive" color="red" text-color="black" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Archivos</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Solo visible para admin -->
            <q-item clickable v-close-popup to="/valores" v-if="rol === 'admin'">
              <q-item-section avatar>
                <q-avatar icon="attach_money" color="red" text-color="black" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Valores</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Visible para todos -->
            <q-item clickable v-close-popup to="/pagos">
              <q-item-section avatar>
                <q-avatar icon="attach_money" color="red" text-color="black" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Pagos</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Visible para todos -->
            <q-item clickable v-close-popup to="/ingresos">
              <q-item-section avatar>
                <q-avatar icon="assignment" color="red" text-color="black" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Ingresos</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Solo admin con contraseña -->
            <q-item clickable v-close-popup @click="validarAccesoExportar" v-if="rol === 'admin'">
              <q-item-section avatar>
                <q-avatar icon="cloud_upload" color="red" text-color="black" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Exportar Archivos</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Cambiar usuario -->
            <q-item clickable v-close-popup @click="cambiarRol">
              <q-item-section avatar>
                <q-avatar icon="swap_horiz" color="red" text-color="black" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Cambiar Usuario</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Botón logout -->
            <q-btn v-if="usuario" flat dense icon="logout" color="red" @click="logout" />
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- Contenido principal -->
    <q-page-container>
      <router-view class="flex flex-center" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()

const rol = ref('')        // rol actual
const usuario = ref(null)  // puedes usarlo si tenés datos del usuario

// Función para mostrar el diálogo de selección de usuario
function seleccionarRol() {
  $q.dialog({
    title: 'Seleccioná usuario',
    options: {
      type: 'radio',
      model: rol.value || '',
      items: [
        { label: 'Admin', value: 'admin' },
        { label: 'Usuario', value: 'usuario' }
      ]
    },
    cancel: true,
    persistent: true
  }).onOk(seleccion => {
    if (seleccion) rol.value = seleccion
  })
}

// Pregunta al inicio
onMounted(() => {
  seleccionarRol()
})

// Función para cambiar rol desde el menú
function cambiarRol() {
  seleccionarRol()
}

// Función para validar acceso a exportar archivos
function validarAccesoExportar() {
  $q.dialog({
    title: 'Contraseña requerida',
    message: 'Ingresá la contraseña para acceder a Exportar Archivos:',
    prompt: {
      model: '',
      type: 'password'
    },
    cancel: true,
    persistent: true
  }).onOk(pass => {
    if (pass === '1234') {
      router.push('/exportar')
    } else {
      $q.notify({
        type: 'negative',
        message: 'Contraseña incorrecta',
        position: 'top'
      })
    }
  })
}

const leftDrawerOpen = ref(false)

function onMainClick() {
  router.push('/')
}

function logout() {
  usuario.value = null
  rol.value = ''
  seleccionarRol()
}
</script>

<style>
/* Asegura que el contenido (como SocioSearch) quede centrado */
.q-page-container {
  min-height: 100vh;
}
.tittle-Menu {
  background-color: red;
}
.q-pa-md {
  display: flex;
  padding: 1vh;
}
.q-dialog__inner {
  color: black;
}
.q-list {
  color: black;
}
</style>
