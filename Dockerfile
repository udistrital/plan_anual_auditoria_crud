FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm@11 \
  && pnpm install --prod --frozen-lockfile \
  && npm uninstall -g pnpm \
  && rm -rf /root/.cache /root/.npm /root/.local/share/pnpm

COPY dist dist

CMD ["node", "dist/main"]
