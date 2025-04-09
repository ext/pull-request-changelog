import { defaultTemplates } from "./default-templates";
import { renderTemplate } from "./render-template";

it("should render template with changelog", async () => {
	expect.assertions(1);
	const changelog = [
		"### Features",
		"",
		" * foo",
		" * bar",
		"",
		"### Bug fixes",
		"",
		" * baz",
		"",
	].join("\n");
	const output = await renderTemplate(defaultTemplates, {
		changelog,
		title: "CHANGELOG",
		bump: "minor",
	});
	expect(output).toMatchSnapshot();
});

it("should render template with no changelog", async () => {
	expect.assertions(1);
	const changelog = false;
	const output = await renderTemplate(defaultTemplates, {
		changelog,
		title: "CHANGELOG",
		bump: "minor",
	});
	expect(output).toMatchSnapshot();
});
