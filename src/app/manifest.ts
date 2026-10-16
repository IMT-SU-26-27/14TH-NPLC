import type { MetadataRoute } from "next";

// Needed for web push on iOS, where only a site added to the Home Screen may receive notifications.
// The manifest format only takes literal colours: these match --background in globals.css.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "14th NPLC",
    short_name: "NPLC",
    description: "Registration and online competitive programming contest for the 14th NPLC.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#fafafa",
  };
}
