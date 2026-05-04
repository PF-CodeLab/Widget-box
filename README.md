# SkillBox API

A beautiful skill widget API for GitHub READMEs — like `github-widgetbox`, but powered by **Simple Icons (3000+ brand icons)** instead of a fixed set.

Card-style layout with gradient tiles, themes, optional labels, and configurable icons-per-row.

## Features

- 🎨 **Same polished card layout** as github-widgetbox (gradient tiles, rounded corners, drop shadow)
- 📦 **3000+ icons** from Simple Icons — most likely it has whatever you need
- 🌗 **8 themes**: `default`, `darkmode`, `light`, `nautilus`, `viridescent`, `carbon`, `serika`, `sunset`
- 🏷️ **Optional labels** under each icon (`&includeNames=true`)
- 📐 **Configurable layout** with `&perline=N` (1-50)
- 🗂️ **Categories**: `languages`, `frameworks`, `libraries`, `tools`, `software`, `databases`, `cloud`, `design`, `other`
- ⚡ **Cached at edge** for fast delivery

## Deployment to Vercel

### One-click setup

1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Vercel auto-detects it as a Node.js project — just click **Deploy**.

That's it. Your API will be live at `https://<your-project>.vercel.app/api/skills?...`.

### CLI alternative

```bash
npm install -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

## Usage

### Basic example

```markdown
![My Skills](https://YOUR-PROJECT.vercel.app/api/skills?languages=javascript,typescript&frameworks=react,nextdotjs&theme=darkmode&includeNames=true)
```

### URL parameters

| Param | Description | Example |
|-------|-------------|---------|
| `languages` | Comma-separated icon slugs | `js,ts,python` |
| `frameworks` | Comma-separated icon slugs | `react,vue,nextdotjs` |
| `libraries` | Comma-separated icon slugs | `tensorflow,jquery` |
| `tools` | Comma-separated icon slugs | `git,docker,kubernetes` |
| `software` | Comma-separated icon slugs | `linux,vscode` |
| `databases` | Comma-separated icon slugs | `postgresql,mongodb` |
| `cloud` | Comma-separated icon slugs | `aws,vercel,cloudflare` |
| `design` | Comma-separated icon slugs | `figma,sketch` |
| `other` / `icons` | Anything else | `github,slack` |
| `theme` | One of the themes (see below) | `darkmode` |
| `includeNames` | Show icon labels | `true` |
| `perline` | Icons per row (1-50, default 6) | `8` |

### Icon names

Icons use **Simple Icons slugs**. The slug is the lowercased name with special chars stripped:

- `javascript`, `typescript`, `python`, `go`, `rust`
- `react`, `vuedotjs` (or `vue`), `nextdotjs` (or `next`), `svelte`
- `nodedotjs` (or `node`, `nodejs`), `express`, `nestjs`
- `postgresql`, `mongodb`, `redis`, `mysql`
- `docker`, `kubernetes`, `git`, `github`, `gitlab`
- `aws`, `vercel`, `cloudflare`, `netlify`
- `tailwindcss` (or `tailwind`), `bootstrap`, `materialui`

Common shortcuts are aliased automatically: `js`, `ts`, `py`, `cpp`, `cs`, `next`, `nuxt`, `vue`, `node`, `vscode`, `tailwind`, etc.

Browse the full list at [simpleicons.org](https://simpleicons.org).

### Themes

| Theme | Look |
|-------|------|
| `default` | Light card with brand-colored icons |
| `light` | Cleaner light variant |
| `darkmode` | GitHub-dark style |
| `carbon` | IBM Carbon-inspired dark |
| `nautilus` | Deep ocean blue (monochrome icons) |
| `viridescent` | Forest green (monochrome icons) |
| `serika` | Warm gray/cream |
| `sunset` | Vibrant pink/yellow (monochrome icons) |

## Local development

```bash
npm install
npm run dev   # requires `npm i -g vercel`
```

Or use the included `test.js`:

```bash
node test.js
# generates SVG files in ./test-output/
```

## How it works

The API is a single Vercel serverless function (`api/skills.js`). On every request it:

1. Parses the URL params into category arrays.
2. Resolves each icon name via the `simple-icons` package.
3. Builds an SVG with gradient tiles, the picked theme's colors, and the resolved icon paths.
4. Returns the SVG with edge-caching headers (cached for 24h).

No external image fetches, no database — pure SVG generation in ~50ms.

## License

MIT. Icons are © their respective brand owners and provided via [Simple Icons](https://simpleicons.org).
