import { createRouter, createWebHistory } from 'vue-router'
import SocioSearch from '../components/SocioSearch.vue'
import ListarIngresos from '../components/ListarIngresos.vue'
import DocumentsIn from '../components/DocumentsIn.vue';
import AdminRules from '../components/AdminRules.vue';

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
