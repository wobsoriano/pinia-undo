import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import pkg from './package.json'

module.exports = defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PiniaUndo',
      fileName: format => `${pkg.name}.${format}.js`  
    }
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      compilerOptions: {
        noEmit: false,
        declaration: true
      }
    })
  ],
  optimizeDeps: {
    exclude: ['vue-demi']
  }
});