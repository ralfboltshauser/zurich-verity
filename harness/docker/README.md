# Docker Runner

Build and enter the runner:

```bash
cd harness/docker
docker compose build
docker compose run --rm verity-runner bash
```

For a proxied validation environment, route traffic through the local proxy from inside Docker:

```bash
export HTTP_PROXY=http://host.docker.internal:8081
export HTTPS_PROXY=http://host.docker.internal:8081
```

Before active testing, inspect the scope file:

```bash
cat "$VERITY_SCOPE"
```

The runner includes common validation tools such as `curl`, `jq`, `git`, `nmap`, `openssl`, and Python.
