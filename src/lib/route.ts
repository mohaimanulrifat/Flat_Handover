import { useEffect, useState } from "react";

/**
 * Screens are kept in the URL hash (#/rooms, #/room/kitchen, ...) so the
 * phone's back button moves between screens instead of closing the app.
 */
export type Route =
  | { name: "start" }
  | { name: "rooms" }
  | { name: "room"; roomId: string }
  | { name: "report" };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "rooms") return { name: "rooms" };
  if (parts[0] === "report") return { name: "report" };
  if (parts[0] === "room" && parts[1]) {
    return { name: "room", roomId: decodeURIComponent(parts[1]) };
  }
  return { name: "start" };
}

export function routeHref(route: Route): string {
  switch (route.name) {
    case "start":
      return "#/";
    case "rooms":
      return "#/rooms";
    case "report":
      return "#/report";
    case "room":
      return `#/room/${encodeURIComponent(route.roomId)}`;
  }
}

export function navigate(route: Route, replace = false): void {
  const href = routeHref(route);
  if (replace) {
    history.replaceState(null, "", href);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    location.hash = href;
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
