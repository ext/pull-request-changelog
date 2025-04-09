const defaultHeaderTemplate = "## {{ title }}";
const defaultFooterTemplate = "";
const defaultMessageTemplate = `{{> header }}


{{#if changelog}}
Based on commits in this Pull Request this will create a **{{ bump }}** release and the following entries will be added to the changelog:",

---
{{ changelog }}
---

If this is not correct you can amend the commit message(s).

{{else}}
No commits contributing to a release was found, no changelog entries will be added for this Pull Request.


If this PR should be included in a release amend the commit message(s) to use:

- \`fix:\` for a patch version or
- \`feat:\` for minor version.

{{/if}}
{{>footer}}
`;

/**
 * @internal
 */
export const defaultTemplates = {
	message: defaultMessageTemplate,
	header: defaultHeaderTemplate,
	footer: defaultFooterTemplate,
} as const;
