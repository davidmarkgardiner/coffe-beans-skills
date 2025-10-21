Got you. Here’s a quick, copy-paste way to get your Stockbridge Coffee logo onto a Node.js site (works for Express or Next.js), with crisp rendering, dark-mode swap, and overlay-on-photo support.

# 1) Put your assets in `public/`

Create a folder like:

```
public/
  images/
    logo-stockbridge-light.png    # transparent PNG
    logo-stockbridge-dark.png     # same logo tuned for dark bgs
    logo-stockbridge.webp         # optional, smaller
    logo-stockbridge.svg          # if you have vector
```

# 2) Express: serve and use in HTML

**Server**

```js
// app.js
import express from "express";
const app = express();

// Serve the /public folder at /
app.use(express.static("public"));

app.get("/", (_req, res) => res.sendFile(process.cwd() + "/public/index.html"));
app.listen(3000, () => console.log("http://localhost:3000"));
```

**HTML (responsive + dark mode)**

```html
<!-- public/index.html -->
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Stockbridge Coffee</title>
  <style>
    .logo { height: 56px; width: auto; display:inline-block }
    /* Optional: tint if using a monochrome SVG */
    .logo svg { fill: currentColor }
    /* Dark-mode swap when not using <picture> */
    @media (prefers-color-scheme: dark) {
      .page { background:#0b0b0b; color:#eee }
    }
  </style>
</head>
<body class="page">
  <!-- Best: use <picture> so WebP is used when supported -->
  <a href="/" aria-label="Stockbridge Coffee home">
    <picture>
      <!-- Swap to dark version automatically when user prefers dark scheme -->
      <source srcset="/images/logo-stockbridge-dark.webp" media="(prefers-color-scheme: dark)" type="image/webp" />
      <source srcset="/images/logo-stockbridge.webp" type="image/webp" />
      <source srcset="/images/logo-stockbridge-dark.png" media="(prefers-color-scheme: dark)" />
      <img class="logo" src="/images/logo-stockbridge-light.png" alt="Stockbridge Coffee" loading="eager" fetchpriority="high" />
    </picture>
  </a>
</body>
</html>
```

# 3) Next.js (app or pages router)

Put files in `/public/images/…`, then:

```tsx
// app/components/Logo.tsx
import Image from "next/image";

export default function Logo({ size = 56 }: { size?: number }) {
  // Choose different asset for dark mode using CSS class on <html data-theme="dark">
  const isDark = typeof window !== "undefined" && document.documentElement.dataset.theme === "dark";
  const src = isDark ? "/images/logo-stockbridge-dark.png" : "/images/logo-stockbridge-light.png";
  return (
    <Image
      src={src}
      alt="Stockbridge Coffee"
      width={size * 4} height={size} // keep aspect; adjust as needed
      priority
      style={{ height: size, width: "auto" }}
    />
  );
}
```

Or with plain `<img>` + `<picture>` exactly like the Express example (Next.js will still serve from `/public`).

# 4) Overlay the logo on any photo (because it’s transparent)

Add a wrapper with absolute positioning:

```html
<div class="hero">
  <img class="hero-img" src="/images/beans.jpg" alt="">
  <img class="hero-logo" src="/images/logo-stockbridge-light.png" alt="Stockbridge Coffee">
</div>

<style>
.hero { position: relative; display:inline-block }
.hero-img { display:block; width:100%; height:auto }
.hero-logo {
  position:absolute; left:24px; bottom:24px;
  height:48px; width:auto; filter: drop-shadow(0 2px 8px rgba(0,0,0,.35));
}
@media (prefers-color-scheme: dark) {
  .hero-logo { content: url("/images/logo-stockbridge-dark.png"); }
}
</style>
```

# 5) Favicons & social previews (nice polish)

* Convert the logo into square versions (512×512, 180×180) and add:

```html
<link rel="icon" href="/images/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png" sizes="180x180">
<meta property="og:image" content="/images/og-1200x630.png">
<meta name="twitter:card" content="summary_large_image">
```

# 6) Quality tips

* Prefer **SVG** if you have the vector—infinitely crisp and recolorable via CSS (`fill: currentColor;`).
* Export PNGs at **2×** or **3×** for retina; set `height` in CSS so they downscale sharply.
* Provide a **dark** and **light** variant (you already asked for multiple colors) and switch via `<picture>` or CSS `prefers-color-scheme`.

If you want, I can generate a monochrome SVG from your mark so you can recolor it in CSS, and export ready-to-use PNG/WebP stacks (light/dark).
