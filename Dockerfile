FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:ui

EXPOSE 3000
CMD ["npm", "start"]
