FROM python:3.12-slim

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      bash \
      ca-certificates \
      curl \
      dnsutils \
      git \
      iproute2 \
      jq \
      nmap \
      openssl \
      procps \
      unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

ENV PYTHONUNBUFFERED=1
ENV VERITY_SCOPE=/workspace/harness/policies/scope.allowlist.example

CMD ["bash"]
