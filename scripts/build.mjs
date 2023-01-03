#!/usr/bin/env zx
import "zx/globals";
import { createTriplet, setupPlatform, parseTarget } from "./platform.mjs";

const cwd = await setupPlatform();
const target = parseTarget();

echo(`Beginning build for target: ${target}`);

cd("src");

const args = `is_debug=${target === "debug"}`;
const triplet = createTriplet(target);
const [target_os, target_cpu] = triplet;

await $`gn gen out/${triplet} --args=${args} --target_cpu=${target_cpu} --target_os=${target_os}`;
await $`autoninja -C out/${triplet}`;

echo(chalk.green("Build complete."));
