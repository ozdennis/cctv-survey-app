# Component Implementation Guide

## Navigation
- **Desktop**:
  - Sticky header with 1px bottom divider
  - Logo scales to 85% on scroll
  - Menu items: 16px font, 32px horizontal padding
  - Hover effect: Bottom border (2px height) animates width from center
  - CTA button: Pulses gently every 8 seconds (scale 1 → 1.03 → 1)
- **Mobile**:
  - Hamburger icon: 3 bars (2px thick, 20px wide, 4px gap)
  - Menu slide-in: From right, 320px width, backdrop blur
  - Menu items: Full-width touch targets (min-height: 56px)
  - Close button: X icon rotates 90° on interaction

## Buttons
- **Primary**:
  - Padding: 14px 32px (desktop), 12px 28px (mobile)
  - Hover: Scale 1.03 + shadow depth increases by 50%
  - Active: Scale 0.98 + shadow compresses
  - Loading state: Circular spinner (3px stroke) replaces text
- **Secondary**:
  - Border: 1.5px solid
  - Hover: Background fills from center (radial gradient animation)
  - Icon buttons: Rotate icon 15° on hover
- **Grouped Buttons**:
  - Adjacent buttons share borders
  - Active state: Sibling buttons dim by 15%

## Cards
- **Base Styles**:
  - Shadow: Multi-layer (ambient + directional)
  - Transition: All properties 250ms except box-shadow (150ms)
  - Hover: 
    - translateY(-4px)
    - Shadow depth increases 200%
    - Border opacity increases to 100%
- **Content Cards**:
  - Icon container: 64x64px circle, scales to 1.1x on card hover
  - Title: 24px, 8px margin bottom
  - Description: Max 3 lines, fade-out ellipsis
- **Testimonial Cards**:
  - Quote icon: Top-left absolute position
  - Avatar: 48px diameter, pulse animation on reveal
  - Rating stars: Fill animation on scroll into view

## Hero Section
- **Text Column**:
  - Headline: Character-by-character fade-in (stagger 30ms)
  - Subheading: Slide up 20px + fade on load
  - CTA group: Buttons fade sequentially (100ms delay)
- **Mockup**:
  - Floating animation: Gentle translateY ±8px over 8s
  - Device frame: Subtle gradient border (inner glow)
  - Screen content: Parallax effect (30% slower than scroll)
- **Mobile Adaptation**:
  - Mockup moves below text
  - Floating animation disabled
  - Headline reduces to 3 lines max

## Feature Grid
- **Reveal Animation**:
  - Cards fade + slide up 24px on scroll
  - Staggered by row (150ms delay between rows)
- **Icon Behavior**:
  - Default: Line art style
  - On hover: Fills with gradient + subtle bounce
- **Active State** (tabs):
  - Indicator bar slides between items (spring physics)
  - Inactive items: Desaturate to 70%

## Forms
- **Inputs**:
  - Height: 56px (desktop), 48px (mobile)
  - Focus state: Border width animates from 1px → 2px
  - Placeholder: Fades out on focus (not jumps)
- **Validation**:
  - Error: Shake animation (X-axis, 3 cycles) + icon pulse
  - Success: Checkmark draws itself (stroke animation)
- **Newsletter**:
  - Submit button: Width expands to show loading state
  - Success message: Slide down from button position

## Footer
- **Section Behavior**:
  - Links: Border-bottom appears from left on hover (200ms)
  - Social icons: Fill color animates on hover (circular wipe)
- **Copyright Bar**:
  - Separator dots: Fade in sequentially
  - Smooth height transition when expanding legal links

## Scroll Effects
- **Progress Indicator**:
  - Top bar fills linearly (ease-in-out)
  - Disappears after 100px scroll, reappears on up-scroll
- **Section Transitions**:
  - Adjacent sections: Overlap by 80px with negative margin
  - Background shifts: Cross-fade between section backgrounds
- **Back-to-Top**:
  - Appears after 60% scroll
  - Smooth scroll (600ms ease-out)
  - Button rotates 180° when active

## Mobile-Specific Patterns
- **Touch Feedback**:
  - All tappable elements: Ripple effect (center-origin)
  - Minimum touch target: 48x48px
- **Navigation**:
  - Menu slide: Momentum-based physics (like native)
  - Overlay backdrop: Fade + slight scale (0.98x)
- **Content Prioritization**:
  - Hero CTA becomes sticky bar at bottom (after scroll)
  - Feature cards: Horizontal swipe on mobile (<768px)
- **Performance**:
  - Disable heavy animations on `prefers-reduced-motion`
  - Replace parallax with static positioning on mobile
