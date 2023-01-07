#!/usr/bin/env zx
import { spinner } from "zx/experimental";
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

export async function getLatestRTC() {
  const res = await fetch(
    `https://chromiumdash.appspot.com/fetch_milestones?only_branched=true`
  );
  const json = await res.json();

  const data = json.sort((a, b) => {
    b.milestone - a.milestone;
  });

  const stable = data.find(
    (milestone) =>
      milestone["schedule_active"] === true &&
      milestone["schedule_phase"] === "stable"
  );
  const { milestone, webrtc_branch } = stable;

  return { milestone, webrtc_branch };
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

export function createTriplet(target, arch) {
  const target_os =
    process.platform === "win32"
      ? "win"
      : process.platform === "darwin"
      ? "mac"
      : "linux";
  const target_cpu =
    arch === "arm64" ? "arm64" : arch === "x64" ? "x64" : "x86";

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

export function parseArch() {
  // try to read the desired arch from `--arch <value>`
  let arch = argv["arch"] ?? os.arch();

  if (!["x64", "x86", "arm64"].includes(arch)) {
    throw new Error(`Invalid arch: ${arch}`);
  }

  return arch;
}

export async function maybeSpinner(title, action) {
  if (typeof process.env["CI"] !== "undefined") {
    echo(title);
    await action();
  } else {
    await spinner(title, action);
  }
}
