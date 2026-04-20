FROM node:22-alpine

WORKDIR /app

# Copiar el package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar todo el código fuente
COPY . .

ENV PORT=8080

# Exponer el puerto 8080
EXPOSE 8080
# ---------- Start App ----------
CMD ["node", "server.js"]