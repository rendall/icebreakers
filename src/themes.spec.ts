import { readFileSync } from "fs";
import fetch from "node-fetch";

describe("THEMES.md", () => {
  const themesFile = readFileSync("THEMES.md", "utf8");
  const themes = themesFile.split("\n").filter((line) => line.startsWith("* "));
  const themeRegExp = new RegExp(
    /^\* _([\w \d]*)_ ([\w#]*) ([\w#]*) ([\w#]*) _("?[\w \d]*"?)_$/
  );
  const hexColorRegExp = /^#[\dA-F]{3}$|^#[\dA-F]{6}$/i;
  const getThemeName = (theme: string) => /\* _([\s\w\d]*)_/.exec(theme)?.[1];
  const themeNames = themes.map(getThemeName);

  it("should exist", () => {
    expect(themesFile).toBeDefined();
  });

  it("should have at least one theme", () => {
    expect(themes.length).toBeGreaterThan(0);
  });

  describe("Theme list", () => {
    describe.each(themes)("%s", (theme) => {
      const themeName = getThemeName(theme);
      const themeExp = themeRegExp.exec(theme);

      it("should be properly formatted", () => {
        expect(theme.match(themeRegExp)).toBeTruthy();
      });

      it("should have a valid name", () => {
        expect(themeName).toBeDefined();
      });

      it(`theme name '${themeName}' should be unique`, () => {
        expect(themeNames.filter((name) => name === themeName).length).toBe(1);
      });

      it(`should have a background color`, () => {
        // Background color should be a properly-formatted hex color code
        const backgroundColor = themeExp?.[2];
        expect(backgroundColor).toBeDefined();
        expect(backgroundColor).toMatch(hexColorRegExp);
      });

      it(`should have a foreground color`, () => {
        // Foreground color should be a properly-formatted hex color code
        const foregroundColor = themeExp?.[3];
        expect(foregroundColor).toBeDefined();
        expect(foregroundColor).toMatch(hexColorRegExp);
      });

      it(`should have a highlight color`, () => {
        // highlight color should be a properly-formatted hex color code
        const highlightColor = themeExp?.[4];
        expect(highlightColor).toBeDefined();
        expect(highlightColor).toMatch(hexColorRegExp);
      });

      describe(`theme font`, () => {
        const font = themeExp?.[5];
        it(`'${font}' should be defined`, () => {
          expect(font).toBeDefined();
        });
        it(`'${font}' url should response 200`, async () => {
          const fontName = font.replace(/\s/g, "+").replace(/\"/g, "");
          const response = await fetch(
            `https://fonts.googleapis.com/css?family=${fontName}`
          );
          expect(response.status).toBe(200);
        });
      });
    });
  });
});
