# webrtc

Prebuilt WebRTC binaries for Windows, Mac, and Linux. 🏗️🪄

[![GitHub Release Date](https://img.shields.io/github/release-date/bengreenier/webrtc?style=flat-square)](https://github.com/bengreenier/webrtc/releases/latest)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/bengreenier/webrtc?style=flat-square)](https://github.com/bengreenier/webrtc/releases/latest)

![WebRTC Logo](./.github/assets/webrtc_logo.png)

I've been working with WebRTC for years; but it's always been a pain to build libraries for various modern desktop platforms.
Previously, [sourcey/webrtc-builds](https://github.com/sourcey/webrtc-builds) was a good place to get these, but it appears they're no longer publishing updated builds.
Anyway, I finally got around to setting this up myself, using CircleCI to produce builds for the following targets:

- Windows, x64
- Mac (Intel), x64
- Mac (Apple Silicon), arm64
- Linux, x64

__Both debug and release artifacts are produced__, and I've also packed up the various WebRTC tools and tests in seperate zips. 

## Getting Started

Our releases are named after the WebRTC branch that we built; To determine the latest (stable, beta, etc) WebRTC branch, see [this Chromium dashboard](https://chromiumdash.appspot.com/branches).

### Windows

> Note: The windows libraries are MSVC compatible, meaning you can build and link with Visual Studio.

- Download [the latest Windows release](https://github.com/bengreenier/webrtc/releases/latest) to `vendor/webrtc`
- For all configurations, ensure your `LanguageStandard` is `stdcpp17`
- For all configurations, add `$(ProjectDir)vendor\webrtc\$(Configuration)` to your project's `LibraryPath`
- For all configurations, add `$(ProjectDir)vendor\webrtc\include;$(ProjectDir)vendor\webrtc\include\third_party\abseil-cpp;` to your project's `IncludePath`
- For your project's Release configuration, define `WEBRTC_WIN`, `NOMINMAX`, and `RTC_ENABLE_WIN_WGC`
- For your project's Debug configuration, define `WEBRTC_WIN`, `NOMINMAX`, `RTC_ENABLE_WIN_WGC`, and `_ITERATOR_DEBUG_LEVEL=0`

### Mac

- Download [the latest Mac release](https://github.com/bengreenier/webrtc/releases/latest) (for your given architecture, e.g. `x64` or `arm64`) to `vendor/webrtc` 
- Add `vendor/webrtc/include` and `vendor/webrtc/include/third_party/abseil-cpp` to your include path
- Define `WEBRTC_MAC`, and `WEBRTC_POSIX`
- Link against `libwebrtc.a` from either `vendor/webrtc/debug` or `vendor/webrtc/release` depending on your desired configuration

### Linux

- Download [the latest Linux release](https://github.com/bengreenier/webrtc/releases/latest) to `vendor/webrtc` 
- Add `vendor/webrtc/include` and `vendor/webrtc/include/third_party/abseil-cpp` to your include path
- Define `WEBRTC_POSIX`
- Link against `libwebrtc.a` from either `vendor/webrtc/debug` or `vendor/webrtc/release` depending on your desired configuration
