import { describe, expect, it } from "vitest";
import { fmt, langFromSaved, toAsciiDigits, toBnDigits } from "./lang.ts";

describe("language", () => {
  it("is English unless Bangla was chosen", () => {
    expect(langFromSaved(null)).toBe("en");
    expect(langFromSaved("en")).toBe("en");
    expect(langFromSaved("something else")).toBe("en");
    expect(langFromSaved("bn")).toBe("bn");
  });

  it("writes and reads Bangla digits", () => {
    expect(fmt("bn", 1250)).toBe("১,২৫০");
    expect(fmt("en", 1250)).toBe("1,250");
    expect(toBnDigits("Block 29A")).toBe("Block ২৯A");
    expect(toAsciiDigits("৩.৫")).toBe("3.5");
  });
});
