#!/usr/bin/env zx
import "zx/globals";
import {
  createTriplet,
  setupPlatform,
  parseTarget,
  parseArch,
} from "./platform.mjs";

const cwd = await setupPlatform();
const target = parseTarget();
const arch = parseArch();

echo(`Beginning build for target: ${target}, arch: ${arch}`);

cd("src");

let args = `is_debug=${target === "debug"}`;

// on windows, we need to disable libcxx, so we can use msvc crt as a consumer
if (process.platform === "win32") {
  args += ` use_custom_libcxx=false libcxx_is_shared=true enable_iterator_debugging=false rtc_enable_win_wgc=true`;
}

const triplet = createTriplet(target, arch);
const [target_os, target_cpu] = triplet.split("_");

await $`gn gen out/${triplet} --args=${args} --target_cpu=${target_cpu} --target_os=${target_os}`;
await $`autoninja -C out/${triplet}`;

echo(chalk.green("Build complete."));
