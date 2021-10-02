import { readFileSync } from "fs";
describe("THEMES.md", () => {
  const themesFile = readFileSync("THEMES.md", "utf8");
  const themes = themesFile.split("\n").filter((line) => line.startsWith("* "));

  it("should exist", () => {
    expect(themesFile).toBeDefined();
  });

  describe("should only contain properly formatted themes", () => {
    themes.forEach((theme) => {
      const themeExp = new RegExp(
        /^\* _([\w \d]*)_ ([\w#]*) ([\w#]*) ([\w#]*)$/
      ).exec(theme);
      const themeName = themeExp?.[1];
      it(`'${themeName}' should have a name`, () => {
        // Theme name should be a string between two underscores: _Name Example_
        expect(themeName).toBeDefined();
      });

      it(`'${themeName}' should have a background color`, () => {
        // Background color should be a properly-formatted hex color code
        const backgroundColor = themeExp?.[2];
        expect(backgroundColor).toBeDefined();
        expect(backgroundColor).toMatch(/^#[\dA-F]{3,6}$/i);
      });
      it(`'${themeName}' should have a foreground color`, () => {
        // Foreground color should be a properly-formatted hex color code
        const foregroundColor = themeExp?.[3];
        expect(foregroundColor).toBeDefined();
        expect(foregroundColor).toMatch(/^#[\dA-F]{3,6}$/i);
      });
      it(`'${themeName}' should have a highlight color`, () => {
        // highlight color should be a properly-formatted hex color code
        const highlightColor = themeExp?.[4];
        expect(highlightColor).toBeDefined();
        expect(highlightColor).toMatch(/^#[\dA-F]{3,6}$/i);
      });
    });
  });
});
