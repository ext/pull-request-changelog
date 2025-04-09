import handlebars from "handlebars";

/**
 * @internal
 */
export interface Templates {
	message: string;
	header: string;
	footer: string;
}

/**
 * @internal
 */
export interface TemplateData {
	/** changelog entries or `false` if no commits yielding changelog entries was found */
	changelog: string | false;
	/** configured title */
	title: string;
	/** what version bump this would generate for the next release */
	bump: "major" | "minor" | "patch";
}

/**
 * Render handlebar templates.
 *
 * @internal
 */
export function renderTemplate(template: Templates, data: TemplateData): string {
	const fn = handlebars.compile(template.message);
	handlebars.registerPartial("header", template.header);
	handlebars.registerPartial("footer", template.footer);
	return fn(data);
}
