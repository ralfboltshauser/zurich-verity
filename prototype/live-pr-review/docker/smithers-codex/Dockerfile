FROM oven/bun:1

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    curl \
    git \
    jq \
    nodejs \
    python3 \
    ripgrep \
  && rm -rf /var/lib/apt/lists/*

RUN bun install -g @openai/codex smithers-orchestrator

ENV PATH="/root/.bun/bin:${PATH}"
