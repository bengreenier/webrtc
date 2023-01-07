#!/usr/bin/env zx
import "zx/globals";
import { setupPlatform, getLatestRTC, maybeSpinner } from "./platform.mjs";

const cwd = await setupPlatform();

// try to read the desired version from `--version <value>`
let version = argv["version"];

// obtain the latest version
if (!version) {
  await maybeSpinner("Obtaining latest version...", async () => {
    const { milestone, webrtc_branch } = await getLatestRTC();

    version = webrtc_branch;
    echo(`Using ${version} (from chromium ${milestone})`);
  });
}

// ensure a gclient file for webrtc is present
await fs.writeFile(
  `.gclient`,
  `solutions = [
      {
        "url": "https://webrtc.googlesource.com/src.git",
        "managed": False,
        "name": "src",
        "deps_file": "DEPS",
        "custom_deps": {},
      },
    ]`,
  { encoding: "utf-8" }
);

const hasSrc = await fs.pathExists(`src`);

// checkout webrtc as-needed
if (!hasSrc) {
  await $`git clone https://webrtc.googlesource.com/src src`;
  cd(`src`);
  await $`git config --local core.filemode false`;
  await $`git config --local core.autocrlf false`;
  await $`git config --local branch.autosetuprebase always`;
  await $`git config --local core.longpaths true`;
  cd("../");
}

// ensure correct webrtc version is checked out
cd(`src`);

// relative to vendor/webrtc/src
const patchesPrefix = "../../../patches";

await maybeSpinner(`Checking out ${version}`, async () => {
  await $`git checkout main`;
  await $`git fetch origin +refs/branch-heads/${version}:refs/heads/branch-heads/${version}`;
  await $`git checkout -f branch-heads/${version}`;
});

if (!hasSrc) {
  echo(chalk.yellow(`Initial sync will take a while`));
}

// if we have an enlistment already, undo any patches
if (hasSrc) {
  await maybeSpinner("Ensuring no patches are applied...", async () => {
    const patches = await globby(`${patchesPrefix}/**/*.patch`);
    const repos = patches.map((p) =>
      path.dirname(p.substring(patchesPrefix.length))
    );

    cd("../");
    for (let i = 0; i < repos.length; i++) {
      const repo = repos[i];
      await $`cd .${repo}; git checkout -- .`;
    }
    cd("./src");
  });
  echo("Unapplied any patches.");
}

await maybeSpinner("Synchronizing...", () => $`gclient sync`);

echo(chalk.green("Enlistment updated."));

// apply patches (currently only needed on windows to support msvc)
if (process.platform === "win32") {
  await maybeSpinner("Applying patches...", async () => {
    let patches = await globby(`${patchesPrefix}/**/*.patch`);
    patches = patches.map((p) => ({
      path: path.resolve(p),
      repo: path.dirname(p.substring(patchesPrefix.length)),
    }));

    // move up a dir so that the `repo` values align to `cd` commands
    cd("../");

    // this is obtuse, i'm aware. here's what the command looks like:
    // cd ./src; git apply /real/path/to/patches/src/fullscreen-win-application-include.patch
    await Promise.all(
      patches.map(
        (patch) =>
          $`cd .${patch.repo}; git apply --verbose --whitespace=fix ${patch.path}`
      )
    );
  });

  echo(chalk.green("Patches applied updated."));
}

fs.writeFile("../VERSION.txt", version, { encoding: "utf-8" });
