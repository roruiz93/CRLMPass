
import './style.css'
import { Quasar,Dialog, Notify } from 'quasar';
import quasarLang from 'quasar/lang/es'; // Opcional: para idioma español
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/dist/quasar.css';
import router from './routers';
import App from './App.vue'
import { createApp } from 'vue'


const app = createApp(App)

app.use(router)
app.use(Quasar, {
  plugins: {
    Dialog,
    Notify
  },
  lang: quasarLang
})

app.mount('#app')
