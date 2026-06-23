import type { SandboxProvider } from "smithers-orchestrator/sandbox";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const imageName = "zurich-verity-smithers-codex:latest";
const hostCodexHome = process.env.CODEX_HOST_HOME ?? "/home/ralf/.codex";
const hostCacheRoot =
  process.env.SMITHERS_DOCKER_CACHE_ROOT ??
  "/home/ralf/.cache/zurich-verity-smithers";
const sharedSmithersNodeModules =
  process.env.SMITHERS_SHARED_NODE_MODULES ??
  "/home/ralf/prj/exploration/zurich-verity-demo/.smithers/node_modules";

function ensureCacheDir(name: string) {
  const dir = join(hostCacheRoot, name);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function prepareCodexConfig() {
  const dir = mkdtempSync(join(tmpdir(), "verity-codex-home-"));
  const authPath = join(hostCodexHome, "auth.json");
  const configPath = join(hostCodexHome, "config.toml");

  if (!existsSync(authPath)) {
    throw new Error(`Codex auth file does not exist at ${authPath}`);
  }

  copyFileSync(authPath, join(dir, "auth.json"));

  if (existsSync(configPath)) {
    copyFileSync(configPath, join(dir, "config.toml"));
  }

  chmodSync(dir, 0o700);
  return dir;
}

function createDockerCodexProvider(
  id: string,
  workflowName: string,
): SandboxProvider {
  return {
    id,
    async run(request) {
      const ioDir = mkdtempSync(join(tmpdir(), "verity-smithers-docker-"));
      const codexConfigDir = prepareCodexConfig();
      const inputPath = join(ioDir, "input.json");
      const outputPath = join(ioDir, "output.json");
      const logPath = join(ioDir, "run.log");
      const runIdPath = join(ioDir, "run-id.txt");
      const npmCacheDir = ensureCacheDir("npm");
      const hostUid = process.getuid?.() ?? 1000;
      const hostGid = process.getgid?.() ?? 1000;

      await Bun.write(inputPath, JSON.stringify(request.input ?? {}));

      try {
        const sharedMountArgs = existsSync(sharedSmithersNodeModules)
          ? ["-v", `${sharedSmithersNodeModules}:/repo/.smithers/node_modules:ro`]
          : [];

        await Bun.$`docker run --rm --memory 4g --cpus 2 --env GITHUB_TOKEN --env REVIEW_GITHUB_TOKEN --env GH_TOKEN --env SMITHERS_CHILD_WORKFLOW=${workflowName} --env HOST_UID=${hostUid} --env HOST_GID=${hostGid} --env npm_config_cache=/root/.npm -v ${codexConfigDir}:/codex-home-source:ro -v ${process.cwd()}:/repo -v ${ioDir}:/sandbox-io -v ${npmCacheDir}:/root/.npm ${sharedMountArgs} ${imageName} /bin/sh /repo/docker/smithers-codex/run-child.sh`;

        const output = JSON.parse(await Bun.file(outputPath).text());
        const runId = (await Bun.file(runIdPath).text()).trim();

        return {
          status: "finished",
          runId,
          output,
        };
      } catch (error) {
        const log = await Bun.file(logPath)
          .text()
          .catch(() => "Docker child log was not written.");
        const rawOutput = await Bun.file(outputPath)
          .text()
          .catch(() => "Docker child output was not written.");

        throw new Error(
          `Docker Codex sandbox failed: ${String(error)}\n\nChild log:\n${log}\n\nChild output:\n${rawOutput}`,
          { cause: error },
        );
      } finally {
        rmSync(ioDir, { recursive: true, force: true });
        rmSync(codexConfigDir, { recursive: true, force: true });
      }
    },
  };
}

export const dockerCodexSecurityReviewProvider = createDockerCodexProvider(
  "local-docker-codex-security-review",
  "sandboxed-security-review",
);
