FROM node:24.22-alpine

WORKDIR /app

COPY dist dist
COPY node_modules node_modules

CMD ["node", "dist/main"]
