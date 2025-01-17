# Example Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json .
COPY schema.gql .
COPY src ./src

ENV NODE_ENV=production

RUN npm run build
EXPOSE 4000
CMD ["node", "dist/main.js"]