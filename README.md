# pull-request-changelog

Generate changelog from conventional changelog for using in a pull request comment.

## Usage with CLI (recommended)

```bash
npx pull-request-changelog \
  --preset conventional-changelog-conventionalcommits \
  --from origin/main \
  --to HEAD
```

Do note that the full name of the preset must be specified, this is different to how `conventional-changelog-cli` handles `-p`.

If you need to customize the configuration for the conventional-changelog preset create a new file default exporting a function wrapping the preset:

```ts
import conventionalChangelogConventionalcommits from "conventionallchangelog-conventionalcommits";

export default function () {
  return conventionalChangelogConventionalcommits({
    /* preset configuration */
  });
}
```

```diff
 npx pull-request-changelog \
-  --preset conventional-changelog-conventionalcommits \
+  --preset ./my-config.mjs \
   --from origin/main \
   --to HEAD
```

## Usage with API

```ts
import { pullRequestChangelog } from "pull-request-changelog";
import conventionalChangelogConventionalcommits from "conventionallchangelog-conventionalcommits";

const markdown = await pullRequestChangelog({
  config: conventionalChangelogConventionalcommits({
    /* preset configuration */
  }),
  git: {
    from: "origin/main",
    to: "HEAD",
  },
});
```
