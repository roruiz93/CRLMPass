import { createRouter, createWebHistory } from 'vue-router'
import SocioSearch from '../components/SocioSearch.vue'
import ListarIngresos from '../components/ListarIngresos.vue'
import DocumentsIn from '../components/DocumentsIn.vue';
import AdminRules from '../components/AdminRules.vue';
import ExportarArchivos from '../components/ExportarArchivos.vue';
import ConfiguraciocionesApp from '../components/ConfiguraciocionesApp.vue';
import PagoSocio from '../components/PagoSocio.vue';

const routes = [
  {
    path: '/',
    name: 'Inicio',
    component: SocioSearch // 💡 ESTA es la vista inicial
  },
  {
    path: '/ingresos',
    name: 'ListarIngresos',
    component: ListarIngresos
  },
  {
    path: '/valores',
    name: 'Valores',
    component: AdminRules
  },
  {
    path: '/exportar',
    name: 'Exportar',
    component: ExportarArchivos
  },
  {
    path: '/pagos',
    name: 'Pagos',
    component: PagoSocio
  },
  {
    path: '/configuraciones',
    name: 'Configuraciones',
    component: ConfiguraciocionesApp
  },
  {
    path: '/archivos',
    name: 'Archivos',
    component: DocumentsIn
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
