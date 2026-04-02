FROM oven/bun:latest
WORKDIR /app

COPY . /app
RUN bun install && bun run build

EXPOSE 5173
CMD ["bun", "run", "dev", "--host"]