## Src Patches

### source-tracker-test-nonconstexpr.patch

> As this is test only, didn't investigate much. Just made 'em non-const.

Workaround for abs::optional_data ctor not being detected as const.

### ip-address-test-unused-consts.patch

> As this is test only, didn't investigate much. Just added a compiler directive.

Workaround for unused consts.
