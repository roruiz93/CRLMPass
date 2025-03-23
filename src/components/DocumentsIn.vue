<template>
  <div>
    <h1>Documentos de Carga</h1>
    
    <!-- Incluir ambos componentes de carga -->
    <SociosUpFile />
    <OperarioUpFile />
  </div>
</template>

<script setup>
import SociosUpFile from './SocioUpFile.vue';
import OperarioUpFile from './OperarioUpFile.vue';
</script>

<style scoped>
h1 {
  font-size: 24px;
  margin-bottom: 20px;
}
</style>
