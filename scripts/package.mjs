#!/usr/bin/env zx
import "zx/globals";
import {
  createTriplet,
  maybeSpinner,
  parseArch,
  parseTarget,
  setupPlatform,
  vswhere,
} from "./platform.mjs";

const cwd = await setupPlatform();

const target = parseTarget();
const arch = parseArch();
const triplet = createTriplet(target, arch);

echo(`Cleaning up ${chalk.green(path.join("out", triplet))}...`);
await fs.remove(path.join("out", triplet));
echo(`Cleaned up.`);

if (process.platform === "win32") {
  await maybeSpinner("Copying windows build output...", async () => {
    // TODO(bengreenier): is this enough? look at ninja output to see what obj files are a part of this lib
    const mainLib = path.join("src", "out", triplet, "obj", "webrtc.lib");
    await fs.copy(mainLib, path.join("out", triplet, "webrtc.lib"));

    const extras = await globby([
      `src/out/${triplet}/*.exe`,
      `src/out/${triplet}/*.pdb`,
      `src/out/${triplet}/*.dll`,
      `src/out/${triplet}/*.lib`,
    ]);

    // TODO(bengreenier): this is too slow
    await Promise.all(
      extras.map((extra) =>
        fs.copy(
          extra,
          path.join("out", triplet, "extras", path.basename(extra))
        )
      )
    );
  });
} else if (process.platform === "linux" || process.platform === "darwin") {
  // TODO(bengreenier): is this enough? look at ninja output to see what obj files are a part of this lib
  const mainLib = path.join("src", "out", triplet, "obj", "libwebrtc.a");
  await fs.copy(mainLib, path.join("out", triplet, "libwebrtc.a"));

  const extras = await globby([
    `src/out/${triplet}/*.so`,
    `src/out/${triplet}/*.a`,
  ]);

  // TODO(bengreenier): this is too slow
  await Promise.all(
    extras.map((extra) =>
      fs.copy(extra, path.join("out", triplet, "extras", path.basename(extra)))
    )
  );

  // binaries need to be detected by +x permission
  const allOutput = await fs.readdir(`src/out/${triplet}`);
  const allOutputWithStats = await Promise.all(
    allOutput.map((o) =>
      fs.stat(`src/out/${triplet}/${o}`).then((stats) => {
        if (stats.isDirectory()) {
          return { path: o, executable: false };
        } else {
          return fs.access(`src/out/${triplet}/${o}`, fs.constants.X_OK).then(
            () => ({ path: o, executable: true }),
            (e) => ({ path: o, executable: false })
          );
        }
      })
    )
  );

  const binaries = allOutputWithStats
    .filter((e) => e.executable)
    .map((e) => `src/out/${triplet}/${e.path}`);

  console.log(binaries);

  await Promise.all(
    binaries.map((extra) =>
      fs.copy(extra, path.join("out", triplet, "extras", path.basename(extra)))
    )
  );
} else {
  throw new Error(`Unsupported platform ${process.platform}`);
}

// headers (cross-platform)
const excludeList = [
  ".git",
  "tools",
  "test",
  "example",
  "docs",
  "buildtools",
  "build",
  "build_overrides",
  "out",
];
await fs.copy("src/", path.join("out", triplet, "include"), {
  filter: async (src, dst) => {
    const dir = path.dirname(src);
    const ext = path.extname(src);
    const stat = await fs.stat(src);
    const isDirectory = stat.isDirectory();

    return (
      !excludeList.some((excluded) => dir.includes(excluded)) &&
      (isDirectory || ext === ".h")
    );
  },
});

// args (cross platform)
await fs.copy(
  `src/out/${triplet}/args.gn`,
  path.join("out", triplet, "/", "args.gn")
);

echo(chalk.green(`Packaged successfully.`));
