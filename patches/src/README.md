## Src Patches

### fullscreen-win-application-include.patch

Fixes missing STL header. See https://bugs.chromium.org/p/webrtc/issues/detail?id=14009#c6

### source-tracker-test-nonconstexpr.patch

> As this is test only, didn't investigate much. Just made 'em non-const.

Workaround for abs::optional_data ctor not being detected as const.
