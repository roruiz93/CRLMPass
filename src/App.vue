<script setup>
import HelloWorld from './components/HelloWorld.vue'
import DocumentsIn from './components/DocumentsIn.vue';
import SocioSearch from './components/SocioSearch.vue';
import { ref } from 'vue';

const isMenuOpen = ref(false); // Estado para controlar la apertura/cierre del menú
</script>
<template>
  <div>
    <!-- Botón para abrir/cerrar el menú -->
    <button @click="isMenuOpen = !isMenuOpen">
      {{ isMenuOpen ? "Cerrar Documentos" : "Abrir Documentos" }}
    </button>

    <!-- Menú expansible -->
    <div v-show="isMenuOpen" class="menu-container">
      <DocumentsIn />
    </div>

    <SocioSearch />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.menu-container {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
