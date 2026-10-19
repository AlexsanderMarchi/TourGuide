# Dockerfile descreve como construir uma imagem
# cada "from" é uma etapa nova

# Etapa 1 (build) que usa a imagem do node para instalar as dependencias
# e compilar o projeto. No final é gerado uma pasta /dist
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2 (nginx) que usa a imagem com nginx, um servidor web que entrega
# os arquivos do site para o navegador. Ele tambem copia a /dist da etapa anterior
# e tbm a config do arquivo "nginx.conf". 
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080

# Para Rodar:
# 1. Construir a imagem (o "." diz para usar a pasta atual)
# docker build -t tourguide .

# 2. Rodar o container
# docker run -d -p 3000:8080 --name tourguide tourguide
