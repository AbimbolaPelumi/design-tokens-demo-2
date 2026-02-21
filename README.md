# Kuda Design Tokens

A comprehensive design token system for Kuda, built with Style Dictionary v4 and following the Design Tokens Community Group (DTCG) format. This system provides a single source of truth for design decisions across all platforms.

## 🎨 Features

- **Multi-variant Support**: Separate tokens for different brands (Retail, Business) and themes (Light, Dark)
- **DTCG Format**: Uses the industry-standard Design Tokens Community Group format
- **CSS Custom Properties**: Generates CSS variables with `k-` prefix for easy integration
- **Accessibility First**: Uses rem units for sizing, unitless line-height, and em for letter-spacing
- **Automated Build**: Style Dictionary transforms tokens into platform-specific formats
- **Zeroheight Integration**: Supports automated sync from Zeroheight design token management

## 📦 Installation

```bash
npm install
```

## 🚀 Usage

### Build Tokens

Generate CSS files from token JSON files:

```bash
npm run build-tokens
```

This will generate CSS files in the `build/web/` directory:
- `token_Primitives_Default.css` - Base design tokens (colors, typography, spacing, etc.)
- `token_Theme_Light.css` - Light theme tokens
- `token_Theme_Dark.css` - Dark theme tokens
- `token_Brand_Retail.css` - Retail brand tokens
- `token_Brand_Business.css` - Business brand tokens

### Watch Mode

Rebuild tokens automatically when source files change:

```bash
npm run build-tokens:watch
```

### Clean Build

Remove all generated files:

```bash
npm run clean
```

## 📁 Project Structure

```
design-tokens-demo-2/
├── tokens/
│   ├── config.js                    # Style Dictionary configuration
│   ├── token_Primitives_Default.json # Base design tokens
│   ├── token_Theme_Light.json        # Light theme tokens
│   ├── token_Theme_Dark.json         # Dark theme tokens
│   ├── token_Brand_Retail.json       # Retail brand tokens
│   └── token_Brand_Business.json     # Business brand tokens
├── build/
│   └── web/                         # Generated CSS files
├── demos/
│   └── web/
│       └── index.html                # Interactive demo page
└── package.json
```

## 🎯 Token Organization

### Primitives (`token_Primitives_Default.json`)
Base design tokens that don't change between themes or brands:
- **Palette**: Color swatches (grays, blues, greens, purples, etc.)
- **Font**: Typography (family, size, weight, line-height, letter-spacing)
- **Spacing**: Consistent spacing scale
- **Radius**: Border radius values
- **Container**: Container width breakpoints
- **Opacity**: Opacity values

### Themes (`token_Theme_Light.json`, `token_Theme_Dark.json`)
Semantic color tokens that adapt to light/dark modes:
- Background colors (`color.bg.*`)
- Text colors (`color.text.*`)
- Border colors (`color.border.*`)
- Component-specific tokens (buttons, inputs, links, icons, etc.)

### Brands (`token_Brand_Retail.json`, `token_Brand_Business.json`)
Brand-specific color tokens:
- `brand-base` - Primary brand color
- `brand-light`, `brand-lighter`, `brand-lightest` - Lighter variants
- `brand-dark`, `brand-darker` - Darker variants
- `on-brand-dark` - Text color for dark brand backgrounds

## 🎨 Using Tokens in CSS

All tokens are prefixed with `k-` to differentiate them from other design systems:

```css
.my-component {
  font-family: var(--k-font-family-sans);
  font-size: var(--k-font-size-base);
  color: var(--k-color-text-primary);
  background: var(--k-color-bg-surface);
  padding: var(--k-spacing-4);
  border-radius: var(--k-radius-md);
}
```

### Theme Switching

Load the appropriate theme CSS file:

```html
<!-- Light theme -->
<link rel="stylesheet" href="token_Theme_Light.css">

<!-- Dark theme -->
<link rel="stylesheet" href="token_Theme_Dark.css">
```

### Brand Selection

Load the appropriate brand CSS file:

```html
<!-- Retail brand -->
<link rel="stylesheet" href="token_Brand_Retail.css">

<!-- Business brand -->
<link rel="stylesheet" href="token_Brand_Business.css">
```

## 🔧 Build Configuration

The build process uses Style Dictionary v4 with custom transforms:

- **Name Transform**: Adds `k-` prefix to all token names
- **Size Transform**: Converts px to rem (16px base)
- **Font Family Transform**: Adds fallback font stacks
- **Letter Spacing Transform**: Converts px to em
- **Line Height Transform**: Converts to unitless values
- **Opacity Transform**: Converts percentage to decimal (0-1)

### Build Process

1. **Primitives**: Built from `token_Primitives_Default.json` only
2. **Themes**: Built from Primitives + Brand (Retail) + Theme file
3. **Brands**: Built from Primitives + Brand file

This ensures each variant has the correct token references resolved.

## 🎭 Demo

View the interactive demo to see all tokens in action:

```bash
# Open demos/web/index.html in your browser
```

The demo includes:
- Live theme switching (Light/Dark)
- Brand switching (Retail/Business)
- Color palette visualization
- Typography showcase
- Spacing scale visualization
- Component examples

## 📝 Token Naming Convention

All CSS custom properties follow this pattern:

```
--k-{category}-{property}-{variant}
```

Examples:
- `--k-font-size-base`
- `--k-color-bg-primary`
- `--k-spacing-4`
- `--k-radius-md`
- `--k-brand-base`

## 🔄 Development Workflow

1. **Update Token Files**: Edit JSON files in `tokens/` directory
2. **Build**: Run `npm run build-tokens` to generate CSS
3. **Test**: View changes in `demos/web/index.html`
4. **Commit**: Commit both source JSON files and generated CSS (if not ignored)

### Zeroheight Integration

This project supports automated token updates from Zeroheight. When tokens are updated in Zeroheight, they can be synced via pull requests.

## 🛠️ Technologies

- **Style Dictionary v4**: Token transformation engine
- **DTCG Format**: Design Tokens Community Group standard
- **CSS Custom Properties**: Modern CSS variable system

## 📄 License

UNLICENSED - Private project

## 👥 Authors

Kuda Design Team

---

For questions or issues, please contact the Kuda Design Team.