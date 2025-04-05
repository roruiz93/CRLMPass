<template>
  <q-layout view="lHh Lpr lFf">

    <!-- Menú lateral -->
    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item clickable v-ripple to="/otra-ruta">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Otro Componente</q-item-label>
          </q-item-section>
        </q-item>
        <!-- podés agregar más ítems acá -->
      </q-list>
    </q-drawer>

    <!-- Barra superior (opcional) -->
    <q-header elevated>
      <q-toolbar class="tittle-Menu">
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title >CLUB REGATAS LA MARINA</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Contenido principal -->
    <q-page-container>
      <router-view class="flex flex-center" />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)
</script>

<style>
/* Asegura que el contenido (como SocioSearch) quede centrado */
.q-page-container {
  min-height: 100vh;
}
.tittle-Menu{
  background-color: red ;
}
</style>
