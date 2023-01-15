## Third Party Patches

### abseil-copy-ctor.patch

> This is probably not the "correct" solution.

Quick workaround for non-const copy ctor. See https://bugs.chromium.org/p/webrtc/issues/detail?id=14468#c10

### abseil-str-cast.patch

Add explicit cast so MSVC doesn't complain.
