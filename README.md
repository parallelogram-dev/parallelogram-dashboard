# Parallelogram Dashboard

A BEM-style CSS component library for building beautiful dashboards. Inspired by [shadcn/ui](https://ui.shadcn.com/).

## Features

- **BEM Methodology** - Clean, predictable class naming (`.btn`, `.btn__icon`, `.btn--primary`)
- **Dark Mode** - Built-in theme switching via `data-theme="dark"`
- **CSS Custom Properties** - Easily customizable design tokens
- **Dashboard Layout** - Dual-sidebar navigation pattern (icon rail + expanded sub-nav)
- **20+ Components** - Buttons, cards, tables, modals, tabs, and more
- **Tabler Icons** - 5000+ icons included via `@tabler/icons-webfont`

## Installation

```bash
npm install
```

## Usage

```bash
# Build CSS
npm run build

# Build minified
npm run build:min

# Watch for changes
npm run dev
```

## Components

### Core
- Button (`.btn`)
- Input (`.input`, `.textarea`, `.select`, `.checkbox`, `.switch`)
- Card (`.card`)
- Badge (`.badge`)
- Alert (`.alert`)
- Table (`.table`)

### Dashboard
- Sidebar (`.sidebar`)
- Navbar (`.navbar`)
- Dropdown (`.dropdown`)
- Modal (`.modal`, `.sheet`)
- Tabs (`.tabs`)
- Breadcrumb (`.breadcrumb`)
- Dashboard Layout (`.dashboard`, `.main-nav`, `.sub-nav`)

### Additional
- Avatar (`.avatar`)
- Tooltip (`.tooltip`)
- Progress (`.progress`)
- Skeleton (`.skeleton`)
- Stat Card (`.stat`)
- Separator (`.separator`)
- Command Palette (`.command`)

## Dark Mode

Toggle dark mode by setting the `data-theme` attribute on the `<html>` element:

```js
document.documentElement.dataset.theme = 'dark';
```

## Icons

This library uses [Tabler Icons](https://tabler.io/icons):

```html
<i class="ti ti-home"></i>
<i class="ti ti-settings"></i>
<i class="ti ti-plus btn__icon"></i>
```

## Demo

Open `demo/index.html` for the component showcase, or `demo/dashboard.html` for the full dashboard layout.

## Credits

Design system inspired by [shadcn/ui](https://ui.shadcn.com/) - a beautifully designed component library by [shadcn](https://twitter.com/shadcn).

## License

MIT
