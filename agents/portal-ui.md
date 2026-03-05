# Portal UI Design System

## Design Philosophy

**Portal ≠ Marketing Site**

| Marketing Site | Portal Dashboard |
|----------------|------------------|
| Visual impact | Information density |
| Scroll narratives | Quick scanning |
| Emotional engagement | Task efficiency |
| Heavy animations | Functional motion only |
| Large whitespace | Compact layouts |

**Core Principles:**
1. **Scanability first** — Users find information in <3 seconds
2. **Action clarity** — Primary actions are obvious and accessible
3. **State visibility** — Loading, error, success states are explicit
4. **Keyboard native** — All interactions work without mouse
5. **Motion restraint** — Animations serve function, not decoration

---

## Layout & Spacing

### Grid System
- **Container**: Max 1440px (dashboard), 100% with 24px padding (mobile)
- **Columns**: 12-column grid, 24px gutters (desktop), 16px (mobile)
- **Portal Shell**:
  - Header: 64px height (sticky, 1px bottom border)
  - Sidebar: 280px width (collapsible to 72px)
  - Content padding: 32px (desktop), 16px (mobile)

### Spacing Scale
Base unit: **4px**

| Token | Value | Use Case |
|-------|-------|----------|
| `--space-1` | 4px | Tight gaps (icon-label) |
| `--space-2` | 8px | Internal padding (chips, badges) |
| `--space-3` | 12px | Form field spacing |
| `--space-4` | 16px | Card padding, button internal |
| `--space-5` | 20px | Section gaps |
| `--space-6` | 24px | Component margins |
| `--space-8` | 32px | Section padding |
| `--space-10` | 40px | Page headers |
| `--space-12` | 48px | Major sections |

### Border Radius
- **Buttons/Inputs**: 6px
- **Cards/Panels**: 8px
- **Modals/Dialogs**: 12px
- **Badges/Chips**: 999px (pill)

---

## Typography

### Font Stack
```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace; /* For codes, amounts */
```

### Type Scale (Portal-Optimized)

| Element | Size | Weight | Line Height | Use Case |
|---------|------|--------|-------------|----------|
| Page Title | 24px | 600 | 1.3 | Page headers |
| Section Header | 18px | 600 | 1.4 | Card titles, sections |
| Body | 14px | 400 | 1.5 | Primary content |
| Small | 12px | 400 | 1.4 | Labels, metadata |
| Mono | 13px | 400 | 1.6 | Codes (WO-20250101-001) |
| Numeric | 16px | 500 | 1.4 | Amounts, counts |

### Text Hierarchy
- **Primary**: `--portal-text` (#0a0a0a light / #fafafa dark)
- **Secondary**: `--portal-muted` (#737373 light / #a3a3a3 dark)
- **Disabled**: `--portal-faint` (#a3a3a3 light / #525252 dark)
- **Links**: `--primary` with underline on hover only

### Density Modes
```css
/* Comfortable (default) */
--row-height: 56px;
--cell-padding: 12px 16px;

/* Compact (user preference) */
--row-height: 40px;
--cell-padding: 8px 12px;
```

---

## Color System

### Portal Semantic Colors

| Token | Light | Dark | Use Case |
|-------|-------|------|----------|
| `--portal-success` | #16a34a | #22c55e | Paid, completed, active |
| `--portal-warning` | #d97706 | #f59e0b | Pending, review needed |
| `--portal-error` | #dc2626 | #ef4444 | Overdue, failed, declined |
| `--portal-info` | #2563eb | #3b82f6 | Info, neutral status |

### Status Badge Combinations
```css
.status-paid { bg: #dcfce7; color: #166534; }
.status-pending { bg: #fef3c7; color: #92400e; }
.status-overdue { bg: #fee2e2; color: #991b1b; }
.status-draft { bg: #f3f4f6; color: #374151; }
```

---

## Components

### Navigation (Portal Header)

**Desktop:**
- Height: 64px, sticky with 1px bottom border (`--portal-border`)
- Logo: 40px height, no animation on scroll
- Portal switcher: Dropdown with icon + name
- User menu: Avatar + name + role badge
- Notifications: Bell icon with unread count badge

**Mobile:**
- Height: 56px
- Hamburger menu: Slide-in from left (280px)
- Portal switcher in menu, not header

**NO marketing animations** — No pulsing, no scale effects, no parallax.

### Sidebar Navigation

**Structure:**
```
├── Dashboard (icon + label)
├── [Portal-specific sections]
│   ├── Sales: Leads, Deals, Projects, Reports
│   ├── Vendor: Surveys, Work Orders, Claims
│   ├── Finance: Ledger, Invoices, Payments, Reports
│   └── Support: Tickets, Maintenance, Escalations
├── Settings (admin only)
└── Audit Logs (admin only)
```

**Behavior:**
- Active state: Background fill (`--portal-inner`) + left border (3px `--primary`)
- Hover state: Background (`--portal-overlay`)
- Collapsed: Icons only, tooltips on hover
- Width: 280px expanded, 72px collapsed

### Buttons

| Variant | Padding | Border | Hover | Use Case |
|---------|---------|--------|-------|----------|
| Primary | 10px 20px | None | Background +5% brightness | Create, Save, Submit |
| Secondary | 10px 20px | 1.5px solid | Border color +10% | Cancel, Back, Filter |
| Ghost | 8px 16px | None | Background fill | Inline actions, menu items |
| Icon | 8px | None | Background fill | Toolbars, table actions |
| Danger | 10px 20px | None | Background #b91c1c | Delete, Revoke, Decline |

**Loading State:**
- Spinner: 16px diameter, 2px stroke
- Text remains visible (not replaced)
- Button disabled during loading

**NO scale animations on hover** — Only color/background changes for stability.

### Cards & Panels

**Base Card:**
```css
.card {
  background: var(--portal-surface);
  border: 1px solid var(--portal-border);
  border-radius: 8px;
  padding: 24px;
  /* NO shadow by default - use for elevation layers only */
}
```

**Card Variants:**
- **Default**: As above
- **Elevated**: Add `box-shadow: 0 2px 8px var(--portal-shadow)`
- **Selected**: Border color = `--primary`, 2px width
- **Interactive**: Hover border color +10% (NO translateY)

**NO hover lift animations** — Cards stay static for visual stability.

### Data Tables

**Structure:**
```
┌────────────────────────────────────────────────────┐
│ [Header: Title]           [Filters] [Export] [+]  │
├────────────────────────────────────────────────────┤
│ [Checkbox] │ Column │ Column │ Column │ [Actions] │
│ [Checkbox] │ Cell   │ Cell   │ Cell   │ [Actions] │
├────────────────────────────────────────────────────┤
│ [Pagination: 1-50 of 234]  [< 1 2 3 ... 12 >]     │
└────────────────────────────────────────────────────┘
```

**Row Specifications:**
- Height: 56px (comfortable), 40px (compact)
- Border: 1px bottom (`--portal-border`)
- Hover: Background `--portal-overlay`
- Selected: Background `--portal-inner` + left border
- Striped: Alternate rows `--portal-bg` (optional)

**Cell Specifications:**
- Padding: 12px 16px
- Text: 14px, truncate with ellipsis after 2 lines
- Numeric: Right-aligned, monospace font
- Status: Badge component (see below)
- Actions: Icon buttons, reveal on row hover

### Status Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  gap: 6px;
}

.badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
```

| Status | Background | Text | Dot |
|--------|------------|------|-----|
| Active/Paid | #dcfce7 | #166534 | #22c55e |
| Pending | #fef3c7 | #92400e | #f59e0b |
| Overdue/Error | #fee2e2 | #991b1b | #ef4444 |
| Draft/Inactive | #f3f4f6 | #374151 | #9ca3af |

### Forms & Inputs

**Text Inputs:**
- Height: 40px (default), 48px (large)
- Border: 1px `--portal-border`
- Focus: Border 2px `--primary`, no width animation
- Error: Border `--portal-error`, shake animation disabled
- Placeholder: `--portal-faint`, fades on focus

**Validation:**
- Error message: Below input, 12px, `--portal-error`
- Success indicator: Right icon, green checkmark
- **NO shake animations** — Use color + icon only

**Select Dropdowns:**
- Same height as text inputs
- Chevron icon right-aligned
- Options: 40px height, hover background fill

**Checkboxes/Radios:**
- Size: 18px
- Border: 1.5px `--portal-border`
- Checked: Background `--primary`, white checkmark
- Label: 14px, 8px gap from input

### Modals & Dialogs

**Structure:**
```
┌─────────────────────────────────────┐
│ [Icon] Title                        │
│                                      │
│ Body content (scrollable if needed) │
│                                      │
│              [Cancel] [Confirm]     │
└─────────────────────────────────────┘
```

**Specifications:**
- Width: 480px (default), 640px (wide), 320px (compact)
- Max height: 80vh (scrollable overflow)
- Border radius: 12px
- Backdrop: `--portal-overlay` with 16px blur
- Animation: Fade + scale 0.98→1 (150ms)
- Close: ESC key or click outside

**NO complex animations** — Simple fade/scale only.

---

## Motion & Animation

### Philosophy
**Functional motion only.** Animations must:
1. Communicate state change (loading, success, error)
2. Provide spatial context (modal open/close, navigation)
3. Guide attention (new item highlight, error focus)

**Never animate for decoration.**

### Timing Functions
```css
--ease-standard: cubic-bezier(0.16, 1, 0.3, 1); /* Most transitions */
--ease-in: cubic-bezier(0.4, 0, 1, 1); /* Progress bars */
--ease-out: cubic-bezier(0, 0, 0.2, 1); /* Reveals */
```

### Duration Scale
| Duration | Use Case |
|----------|----------|
| 80ms | Micro-interactions (hover, focus) |
| 150ms | Button states, toggle switches |
| 200ms | Modal open/close, dropdowns |
| 300ms | Page transitions, sidebar collapse |
| 500ms | Loading skeletons, progress bars |

### Allowed Animations

| Animation | Properties | Duration | Use Case |
|-----------|------------|----------|----------|
| Fade | opacity 0→1 | 150ms | Content reveal |
| Slide | translateY 8px→0 | 200ms | Dropdown, menu |
| Scale | scale 0.98→1 | 150ms | Modal, dialog |
| Spinner | rotate 0→360° | 800ms linear | Loading state |
| Progress | width 0→100% | Variable | Upload, submit |
| Skeleton | opacity 0.5→1 pulse | 1500ms | Data loading |

### PROHIBITED Animations (Marketing-only)
- ❌ Character-by-character text reveal
- ❌ Parallax scrolling effects
- ❌ Floating/bobbing elements
- ❌ Pulse animations (except loading)
- ❌ Bounce/spring physics
- ❌ Gradient wipes/fills
- ❌ Rotate animations (except spinners, close icons)
- ❌ Staggered grid reveals (>3 items)

---

## Accessibility

### Keyboard Navigation
- **Tab order**: Logical flow (header → sidebar → content → footer)
- **Focus visible**: 2px outline, `--primary` color, 2px offset
- **Skip links**: "Skip to content" as first tab stop
- **Escape**: Close modals, dropdowns, mobile menu

### Screen Reader
- **Icons**: `aria-label` for icon-only buttons
- **Status changes**: `aria-live="polite"` for dynamic content
- **Form errors**: `aria-describedby` linking to error message
- **Tables**: `scope` attributes on headers, caption for context

### Color Contrast
- **Normal text**: Minimum 4.5:1 ratio
- **Large text (18px+)**: Minimum 3:1 ratio
- **UI components**: Minimum 3:1 ratio against adjacent colors

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Portal-Specific Patterns

### Page Header Pattern
```
┌─────────────────────────────────────────────────────┐
│ [Breadcrumbs]                                       │
│ Page Title                          [Primary Action]│
│ Optional subtitle/description                       │
└─────────────────────────────────────────────────────┘
```

### Filter Bar Pattern
```
┌─────────────────────────────────────────────────────┐
│ [Search input]  [Dropdown] [Dropdown] [Date Range]  │
│ [Active filters: X] [Clear all]                     │
└─────────────────────────────────────────────────────┘
```

### Empty State Pattern
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              [Illustration/Icon]                    │
│              "No items yet"                         │
│              Brief description                      │
│              [Primary CTA]                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Detail View Pattern
```
┌─────────────────────────────────────────────────────┐
│ [← Back]  Title                    [Edit] [More]   │
├─────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ │   Meta      │ │   Meta      │ │   Meta      │   │
│ │   Card      │ │   Card      │ │   Card      │   │
│ └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────┤
│ Main Content Area (tabs if needed)                  │
└─────────────────────────────────────────────────────┘
```