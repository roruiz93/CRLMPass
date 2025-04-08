<template>
  <q-layout view="lHh Lpr lFf">
    <div id="q-app" style="min-height: 1vh;">
<div class="q-pa-md">
    <q-btn-dropdown
      split
      color="red"
      push
      glossy
      no-caps
      icon="reorder"
      @click="onMainClick"
     
    >
    <q-list>
  <q-item clickable v-close-popup to="/configuraciones">
    <q-item-section avatar>
      <q-avatar icon="settings" color="red" text-color="white"></q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label>Configuraciones</q-item-label>
    </q-item-section>
  </q-item>

  <q-item clickable v-close-popup to="/archivos">
    <q-item-section avatar>
      <q-avatar icon="unarchive" color="red" text-color="white"></q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label>Archivos</q-item-label>
    </q-item-section>
  </q-item>

  <q-item clickable v-close-popup to="/valores">
    <q-item-section avatar>
      <q-avatar icon="attach_money" color="red" text-color="white"></q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label>Valores</q-item-label>
    </q-item-section>
  </q-item>

  <q-item clickable v-close-popup to="/ingresos">
    <q-item-section avatar>
      <q-avatar icon="assignment" color="red" text-color="white"></q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label>Ingresos</q-item-label>
    </q-item-section>
  </q-item>

  <q-item clickable v-close-popup to="/exportar">
    <q-item-section avatar>
      <q-avatar icon="cloud_upload" color="red" text-color="white"></q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label>Exportar Archivos</q-item-label>
    </q-item-section>
  </q-item>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const leftDrawerOpen = ref(false)
const router = useRouter()
function onMainClick () {
  router.push('/') // o la ruta donde está SocioSearch.vue
}
</script>

<style>
/* Asegura que el contenido (como SocioSearch) quede centrado */
.q-page-container {
  min-height: 100vh;
}
.tittle-Menu{
  background-color: red ;
}
.q-pa-md{
  display: flex;
  padding: 1vh;
}
</style>
