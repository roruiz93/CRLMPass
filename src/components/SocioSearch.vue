<template>
    <div>
      <input v-model="numeroSocio" placeholder="Ingrese número de socio" />
      <button @click="buscarSocio">Buscar Socio</button>
      <div v-if="datosSocio">
        <h3>Datos del socio:</h3>
        <p>{{ datosSocio }}</p>
      </div>
      <p v-if="error">{{ error }}</p>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { emit } from "@tauri-apps/api/event"; 



  
  export default {
    data() {
      return {
        numeroSocio: "",
        datosSocio: null,
        error: null,
      };
    },
    methods: {
      async buscarSocio() {
        this.error = null;
        this.datosSocio = null;

          try {
            const resultado = await emit("buscar_socio", { numero_socio: this.numeroSocio });

            
            if (resultado.error) {
            this.error = resultado.error;
          } else {
            this.datosSocio = resultado;
          }

            console.log("Datos del socio:", this.datosSocio);
          } catch (error) {
        this.error = "Error al buscar socio: " + error;
        console.error("Error:", error);
       }
      } 
    },
    mounted() {
      
      window.addEventListener('buscar_socio', this.manejarEvento);
    },
    methods: {
      manejarEvento(event) {
        console.log('Evento recibido:', event.detail);
      
      },
      async buscarSocio() {
        this.error = null;
        this.datosSocio = null;
  
        try {
          
          await emit("buscar_socio", { numero_socio: this.numeroSocio });
          console.log("Evento enviado");
        } catch (error) {
          this.error = "Error al enviar evento: " + error;
          console.error("Error:", error);
        }
      }
    }
  };
  </script>
  