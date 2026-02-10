FROM node:24-alpine
USER root
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json ./
COPY pnpm-lock.yml ./
RUN pnpm ci
RUN pnpm add --global typescript
RUN pnpm run build
COPY dist/ ./
COPY example.config.json ./
CMD ["node", "dist/index.js"]