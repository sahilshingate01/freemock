import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Freemock";
const host = import.meta.env.VITE_PUBLIC_HOSTNAME;
const ogImage = host
  ? `https://${host}/og.jpg`
  : undefined;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Freemock — Turn product screens into premium visuals" },
      {
        name: "description",
        content:
          "Create premium, highly customizable videos, visuals and 3D mockups that showcase UI designs, websites and apps – for free!",
      },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "theme-color", content: "#e0e0e0" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Freemock — Turn product screens into premium visuals" },
      {
        property: "og:description",
        content:
          "Create premium, highly customizable videos, visuals and 3D mockups that showcase UI designs, websites and apps – for free!",
      },
      { property: "og:type", content: "website" },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
          ]
        : []),
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/icon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "preload",
        href: "/models/v1/iphone-17-p-sim.glb",
        as: "fetch",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/basis/basis_transcoder.wasm",
        as: "fetch",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
