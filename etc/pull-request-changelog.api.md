## API Report File for "pull-request-changelog"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { Commit } from 'conventional-commits-parser';
import { Options } from 'conventional-changelog-writer';
import { ParserStreamOptions } from 'conventional-commits-parser';

// @public
export function pullRequestChangelog(options: PullRequestChangelogOptions): Promise<string>;

// @public (undocumented)
export interface PullRequestChangelogOptions {
    // (undocumented)
    config: {
        parserOpts?: ParserStreamOptions;
        writerOpts?: Options;
        whatBump(this: void, commits: Commit[]): {
            level: 0 | 1 | 2;
        };
    };
    // (undocumented)
    git: {
        from: string;
        to: string;
    };
    // (undocumented)
    template?: {
        message?: string;
        header?: string;
        footer?: string;
    } | undefined;
    // (undocumented)
    title?: string;
}

// (No @packageDocumentation comment for this package)

```
