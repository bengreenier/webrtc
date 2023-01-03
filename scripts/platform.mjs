#!/usr/bin/env zx
import "zx/globals";

/**
 * Sets up zx for the given platform,
 * ensures the webrtc vendor directories exist,
 * and sources depot_tools if present.
 * @returns - current working directory
 */
export async function setupPlatform() {
  // on windows, use powershell
  // see https://github.com/google/zx/blob/main/src/core.ts#L77
  if (process.platform === "win32") {
    $.shell = which.sync("powershell.exe");
    $.quote = quotePowerShell;
    $.prefix = "";
    $.env["DEPOT_TOOLS_WIN_TOOLCHAIN"] = "0";
  }

  $.env["NINJA_SUMMARIZE_BUILD"] = "1";

  // ensure that the vendor webrtc directory exists
  const webrtcDirectory = "vendor/webrtc";
  await fs.mkdirp(webrtcDirectory);
  cd(webrtcDirectory);

  const hasDepotTools = await fs.pathExists("depot_tools");

  if (hasDepotTools) {
    const enlistment_dir = path.join(process.cwd(), "./depot_tools");
    $.env["PATH"] = `${enlistment_dir}${path.delimiter}${$.env["PATH"]}`;
  }

  return webrtcDirectory;
}

/**
 * Run vswhere to determine the path to vs tools.
 * @returns - the tools bin directory path
 */
export async function vswhere() {
  if (process.platform !== "win32") {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }

  const previousVerbosity = $.verbose;
  $.verbose = false;

  const output =
    await $`. "$([Environment]::GetEnvironmentVariable("ProgramFiles(x86)"))\\Microsoft Visual Studio\\Installer\\vswhere.exe" -latest -property installationPath`;

  $.verbose = previousVerbosity;

  const installationPath = output.stdout.trim();
  const hostPath = process.arch === "x64" ? "Hostx64\\x64" : "Hostx86\\x86";
  const toolsPath = path.join(installationPath, "VC", "Tools", "MSVC");
  const toolVersions = await fs.readdir(toolsPath, { encoding: "utf-8" });

  toolVersions.sort((a, b) =>
    b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" })
  );

  const latestTool = toolVersions[0];

  return path.join(toolsPath, latestTool, "bin", hostPath);
}

export function createTriplet(target) {
  const target_os =
    process.platform === "win32"
      ? "win"
      : process.platform === "darwin"
      ? "mac"
      : "linux";
  const target_cpu =
    os.arch() === "arm64" ? "arm64" : os.arch() === "x64" ? "x64" : "x86";

  return `${target_os}_${target_cpu}_${target}`;
}

export function parseTarget() {
  // try to read the desired target from `--target <value>`
  let target = argv["target"] ?? "debug";

  if (!["debug", "release"].includes(target)) {
    throw new Error(`Invalid target: ${target}`);
  }

  return target;
}
