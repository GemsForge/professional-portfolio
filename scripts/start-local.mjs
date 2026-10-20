import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readLocalPort } from "./local-runtime-config.mjs";

const wrangler = fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url));
const child = spawn(process.execPath, [
  "--import", fileURLToPath(new URL("./sites-env.mjs", import.meta.url)),
  wrangler, "dev", "--config", "dist/server/wrangler.json", "--local",
  "--persist-to", ".wrangler/state", "--ip", "127.0.0.1", "--port",
  String(readLocalPort()), "--inspector-port", "0",
], { stdio: "inherit" });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  process.exitCode = signal ? 1 : (code ?? 1);
});
