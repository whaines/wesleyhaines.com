# wesleyhaines.com

Portfolio site for Wesley Haines, product designer. Plain HTML, CSS and a little JavaScript, hosted on GitHub Pages. No framework and no build step to deploy.

## Pages

| URL | File |
| --- | --- |
| `/` | `index.html`: horizontal project gallery |
| `/vert` | `vert.html`: the same projects as a vertical gallery |
| `/etsy`, `/instagram`, `/duolingo`, `/spotify`, `/nike`, `/capitalone`, `/google`, `/playstation` | case studies |
| `/me` | Read.me |
| `/cv` | CV |

GitHub Pages serves `name.html` at `/name`, so links are written without the extension.

The old dark-mode addresses from the previous site (`/dm`, `/etsy-dm`, …) are small redirect pages. Each one switches the site to dark mode and forwards to the matching page.

## Light and dark mode

A single set of pages supports both themes. The site follows the visitor's system setting, and the sun/moon button switches it. The choice is remembered in `localStorage`. Colors are CSS custom properties defined at the top of `assets/css/site.css`, with one value for light and one for dark. Artwork that changes with the theme ships as two images, classed `.for-light` and `.for-dark`.

## Layout

Breakpoints match the original design: phone below 800px, tablet 800–1279px, desktop 1280–1799px and large desktop from 1800px. The CSS is mobile-first.

## Previewing locally

Any static file server works. For the extensionless URLs to resolve like they do on GitHub Pages, use one that maps `/etsy` to `etsy.html`. For example:

```bash
npx serve .
```

Add `?static` to any URL to turn off entrance animations. This is handy for screenshots.

## Fonts

Inter and Instrument Serif are self-hosted from `assets/fonts`. Both are licensed under the [SIL Open Font License 1.1](https://openfontlicense.org).

## Custom domain

1. In **Settings → Pages**, set the custom domain to `wesleyhaines.com`. This adds a `CNAME` file.
2. At the domain registrar, point the apex domain at GitHub Pages with A records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`. Point `www` at `whaines.github.io` with a CNAME record.
3. Once the certificate is issued, turn on **Enforce HTTPS**.
