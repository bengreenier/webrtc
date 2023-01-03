#!/usr/bin/env zx
import "zx/globals";
import { spinner } from "zx/experimental";
import { setupPlatform } from "./platform.mjs";

const cwd = await setupPlatform();

// try to read the desired version from `--version <value>`
let version = argv["version"];

// obtain the latest version
if (!version) {
  await spinner("Obtaining latest version...", async () => {
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
await spinner(`Checking out ${version}`, async () => {
  await $`git checkout main`;
  await $`git fetch origin +refs/branch-heads/${version}:refs/heads/branch-heads/${version}`;
  await $`git checkout -f branch-heads/${version}`;
});

echo(chalk.yellow(`Initial sync will take a while`));
await spinner("Synchronizing...", () => $`gclient sync`);

echo(chalk.green("Enlistment updated."));
