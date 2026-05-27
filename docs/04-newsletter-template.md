# Newsletter template — beehiiv Style panel configuration

This document maps the Field Journal design system to beehiiv's Style panel settings. Configure these values in the Post Builder under **Style → Basic** and **Style → Advanced**.

> **Why light mode?** Email clients handle dark mode inconsistently — many invert or override colors. The blog's light-mode variant (`#F4EDD9` cream paper) carries the same warm Melbourne aesthetic and renders reliably across all clients.

---

## Template name

| Template | Purpose |
|---|---|
| **Field Journal — Standard** | Default editorial format (long-form essays, deep dives) |
| **Field Notes — Digest** | Shorter roundup format (future use) |

Rename the existing "New template" to "Field Journal — Standard" via the 3-dot menu → Rename template.

---

## Basic tab

### Colors

| Field | Value | Notes |
|---|---|---|
| Outside Background | `#F4EDD9` | Cream paper — wraps the email frame |
| Post Background | `#FAF6E8` | bg-soft, slightly lighter cream for the content area |
| Text on Background | `#1A1815` | Warm soot |
| Primary | `#1A1815` | Used for footer bg, buttons, blockquotes |
| Text on Primary | `#F4EFE6` | Cream — text sitting on soot |
| Secondary | `#C9C0B0` | Steel-warm-300 — dividers, blockquote borders |
| Links | `#C46A4A` | Clay accent (slightly darker for AA contrast on cream) |

### Typography

| Field | Value |
|---|---|
| Heading font family | Source Serif 4 |
| Heading font weight | SemiBold (600) |
| Paragraph text font family | Source Serif 4 |
| Paragraph text font weight | Regular (400) |

### Spacing

| Field | Value |
|---|---|
| Margin | 0px |
| Padding | 32px top/bottom, 40px left/right |

### Borders

| Field | Value | Notes |
|---|---|---|
| Corner radius | 0px | Editorial sharpness — restraint reads as confidence |
| Border thickness | 0px | |

---

## Advanced tab

### Body

| Element | Size | Weight | Line Height | Color |
|---|---|---|---|---|
| Body text | 17px | 400 | 1.7 | `#1A1815` |
| H1 | 44px | 600 | 1.05 | `#1A1815` |
| H2 | 28px | 600 | 1.15 | `#1A1815` |
| H3 | 20px | 600 | 1.30 | `#1A1815` |
| H4–H6 | 17px | 600 | 1.40 | `#4D4538` |

### Widgets → Buttons

| Field | Value |
|---|---|
| Font family | Geist (fallback: Inter) |
| Font weight | Medium (500) |
| Font size | 14px |
| Font color | `#F4EFE6` |
| Background color | `#C46A4A` |
| Border color | `#C46A4A` |
| Corner radius | 4px |
| Border thickness | 1px |
| Padding | 12px top/bottom, 24px left/right |

### Widgets → Breaks

| Field | Value |
|---|---|
| Color | `#E8DFC9` |
| Style | Solid |
| Thickness | 1px |
| Width | 100% |

### Widgets → Quotes

| Field | Value |
|---|---|
| Background color | `#ECE2C6` |
| Border color | `#C46A4A` |
| Border thickness | 3px left, 0px all other sides |
| Corner radius | 2px |
| Font color | `#4D4538` |

### Email Footer

| Field | Value |
|---|---|
| Background color | `#1A1815` |
| Text color | `#C9C0B0` |
| Border top thickness | 1px |
| Border top color | `#C46A4A` |
| Link color | `#DA8665` |
| Social icon color | `#C9C0B0` |
| Social icon background | `#232019` |
| Alignment | Left |

---

## Email Header → Code (custom CSS)

Paste the following into **Advanced → Email Header → Code** to enforce the Field Journal typographic treatment:

```css
/* Kochie Engineering newsletter — field-journal theme */
.post-title {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 40px;
  font-weight: 600;
  line-height: 1.08;
  color: #1A1815;
  letter-spacing: -0.02em;
}
.post-subtitle {
  font-family: 'Source Serif 4', Georgia, serif;
  font-style: italic;
  font-size: 19px;
  font-weight: 400;
  line-height: 1.45;
  color: #4D4538;
}
```

---

## Deferred decisions

- **Newsletter name**: "Field Notes" vs "Working Out Shown" vs another — see `01-brand-foundation.md` §10
- **Email header layout**: Hero image slot by default, or title-only open
