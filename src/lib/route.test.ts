import { describe, expect, it } from "vitest";
import { parseHash, routeHref, type Route } from "./route.ts";

describe("routes", () => {
  it("round-trips every screen through the URL hash", () => {
    const routes: Route[] = [
      { name: "home" },
      { name: "checklist" },
      { name: "rooms" },
      { name: "room", roomId: "bedroom-2" },
      { name: "report" },
      { name: "land" },
      { name: "landResult" },
    ];
    for (const route of routes)
      expect(parseHash(routeHref(route))).toEqual(route);
  });

  it("opens the home screen for an empty or unknown hash", () => {
    expect(parseHash("")).toEqual({ name: "home" });
    expect(parseHash("#/nowhere")).toEqual({ name: "home" });
  });
});
