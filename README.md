# THE DIGITAL NEWS — Monochrome Generator

A Jekyll-powered take on the original monochrome generator demo. The landing page still serves up randomized palettes, GSAP-driven animations, and jittery SVG faces, but the site is now structured for GitHub Pages, complete with blog layouts, reusable includes, and a starter post.

## Project structure

```
.
├── _config.yml             # Jekyll configuration with GH Pages plugins
├── _includes/              # Shared head, header, footer, and script partials
├── _layouts/               # Base, page, and post layouts
├── _posts/                 # Blog posts (Markdown)
├── assets/
│   ├── css/monochrome.css  # Site styles migrated from the static build
│   └── js/monochrome.js    # Palette generator + animation logic
├── about/                  # Static page example
├── blog/                   # Blog index page
├── index.html              # Landing page using the default layout
├── Gemfile                 # Uses github-pages for local development parity
└── README.md
```

## Local development

1. Install Ruby (3.1+ recommended) and Bundler if they’re not already available.
2. Install dependencies:

   ```bash
   bundle install
   ```

3. Start the development server:

   ```bash
   bundle exec jekyll serve
   ```

4. Open <http://127.0.0.1:4000> to explore the generator and blog. Updates to layouts, pages, posts, CSS, or JS will hot-reload.

> **Tip:** If you’re running Ruby 3.0+, the bundled `webrick` gem in the `Gemfile` keeps `jekyll serve` happy.

## Deploying to GitHub Pages

- Commit the site to your repository and enable GitHub Pages under repository settings.
- Select the branch (commonly `main`) and the root directory (`/`) as the publishing source.
- GitHub Pages will build using the `github-pages` gem listed in the `Gemfile`, so the site builds remotely the same way it does locally.

## Adding content

- **New post:** create a Markdown file under `_posts/` with the filename pattern `YYYY-MM-DD-title.md` and front matter like:

  ```yaml
  ---
  title: "Brewed Palette #1"
  layout: post
  excerpt: "A deep dive into grayscale gradients."
  ---
  ```

  Markdown content goes below the front matter. Posts automatically appear on the home page and the `/blog/` index.

- **New page:** add a Markdown or HTML file in a folder (for clean URLs) with `layout: page` in the front matter. The About page under `about/` shows the pattern.

- **Navigation:** the header links live in `_includes/site-header.html`. Update or expand them as the site grows.

## Customising the generator

- The palette logic lives in `assets/js/monochrome.js`. It now guards all DOM queries so the scripts only run on pages that include the generator markup.
- Global styles, including the new blog card and navigation treatments, are in `assets/css/monochrome.css`. Because the palette updates CSS custom properties on `<body>`, most elements inherit the new colours automatically.

Enjoy publishing with a splash (or at least a monochrome wash) of style.
