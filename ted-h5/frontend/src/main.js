import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/notify/style'

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.mount('#app')