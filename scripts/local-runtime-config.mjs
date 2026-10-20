export const DEFAULT_LOCAL_PORT = 5173;

const PORT_ENVIRONMENT_KEYS = ["PORT", "VITE_PORT"];

export function readLocalPort(environment = process.env) {
  const configuredPort = PORT_ENVIRONMENT_KEYS
    .map((key) => environment[key])
    .find((value) => value !== undefined && value !== "");

  if (configuredPort === undefined) return DEFAULT_LOCAL_PORT;

  const port = Number(configuredPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid local port "${configuredPort}". Set PORT to a number between 1 and 65535.`);
  }

  return port;
}
