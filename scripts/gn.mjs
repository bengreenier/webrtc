#!/usr/bin/env zx
import "zx/globals";
import { setupPlatform } from "./platform.mjs";

await setupPlatform();

cd("src");

const command = ["gn", ...process.argv.slice(2)];

await $`${command}`;