#!/usr/bin/env zx
import "zx/globals";
import { createWriteStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import extract from "extract-zip";
import { maybeSpinner, setupPlatform } from "./platform.mjs";

const streamPipeline = promisify(pipeline);
const cwd = await setupPlatform();

const doForce = argv["force"] ?? false;
if (doForce) {
  echo(
    chalk.yellow(
      `[WARN] Forcing re-install of depot_tools because --force was given`
    )
  );
}

const hasDepotTools = await fs.pathExists(`depot_tools`);

// obtain depot_tools if needed
if (!hasDepotTools || doForce) {
  if (process.platform === "win32") {
    await maybeSpinner("Downloading depot_tools...", async () => {
      const res = await fetch(
        "https://storage.googleapis.com/chrome-infra/depot_tools.zip"
      );

      const zipPath = `depot_tools.zip`;
      await streamPipeline(res.body, createWriteStream(`${zipPath}`));
      await extract(zipPath, {
        dir: path.resolve(`./depot_tools`),
      });
      await fs.rm(zipPath);
    });
    echo("depot_tools downloaded.");
  } else {
    // TODO(bengreenier): handle windows version from zip
    await maybeSpinner(
      "Cloning depot_tools...",
      () =>
        $`git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git depot_tools`
    );
    echo("depot_tools cloned.");
  }
}

const hasGit = await fs.pathExists(`depot_tools/.git`);

// pull latest if we've got git and are forcing
if (hasGit && doForce) {
  await maybeSpinner("Updating depot_tools...", async () => {
    cd("depot_tools");
    await $`git pull origin main`;
    cd("../");
  });
  echo("depot_tools updated.");
}
