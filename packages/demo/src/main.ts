import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import PiniaPluginUndo from 'pinia-undo'

const app = createApp(App);
const pinia = createPinia();

// @ts-ignore
pinia.use(PiniaPluginUndo)

app.use(pinia);

app.mount('#app');
