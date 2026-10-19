import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// configuração que faz o papel do nginx só que rodando local para desenvolvimento
// Why? nginx só serve a arquivos como /dist, enquanto o Vite compila apenas o arquivo alterado
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
