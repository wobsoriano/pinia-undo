import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { PiniaUndo } from 'pinia-undo'

const app = createApp(App);
const pinia = createPinia();


pinia.use(PiniaUndo)

app.use(pinia);

app.mount('#app');
