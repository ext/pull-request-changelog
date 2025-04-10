# pull-request-changelog

Generate changelog from conventional changelog for using in a pull request comment.

## Usage with Github Actions (recommended)

Create a workflow with steps (make sure `fetch-depth` is set to enough history):

```yaml
- name: Checkout
  uses: actions/checkout@v4
  with:
    ref: "${{ github.head_ref }}"
    fetch-depth: 100
- name: Pull Requst Changelog
  uses: ext/pull-request-changelog@master
```

Create `.github/changelog.mjs`:

```ts
import conventionalcommits from "conventional-changelog-conventionalcommits";
import { pullRequestChangelog } from "pull-request-changelog";

const [from, to] = process.argv.slice(2);

const output = await pullRequestChangelog({
  config: await conventionalcommits(),
  git: { from, to },
});

console.log(output);
```

See [usage with API](#usage-with-api) below for instruction on how to customize.

## Usage with CLI

```bash
npx pull-request-changelog \
  --preset conventional-changelog-conventionalcommits \
  --from origin/main \
  --to HEAD
```

Do note that the full name of the preset must be specified, this is different to how `conventional-changelog-cli` handles `-p`.

If you need to customize the configuration for the conventional-changelog preset create a new file default exporting a function wrapping the preset and use `--config` instead:

```ts
import conventionalChangelogConventionalcommits from "conventionallchangelog-conventionalcommits";

export default () => {
  return conventionalChangelogConventionalcommits({
    /* preset configuration */
  });
};
```

```diff
 npx pull-request-changelog \
-  --preset conventional-changelog-conventionalcommits \
+  --config my-config.mjs \
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
