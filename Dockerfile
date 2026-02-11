FROM node:24-alpine
USER root
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir /pnpm
RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm --activate 

COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile && pnpm add -g typescript
COPY src/ ./src/
COPY tsconfig.json ./
COPY example.config.json ./
RUN pnpm run build

EXPOSE 3000
ENV PORT 3000
LABEL org.opencontainers.image.source="https://github.com/aelithron/novabot-slack"
CMD ["node", "dist/index.js"]