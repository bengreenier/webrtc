#!/usr/bin/env zx
import "zx/globals";
import { getLatestRTC } from "./platform.mjs";

// no logging
$.verbose = false;

const { webrtc_branch } = await getLatestRTC();

process.stdout.write(webrtc_branch);
process.stdout.write("\n");
process.stdout.end();
