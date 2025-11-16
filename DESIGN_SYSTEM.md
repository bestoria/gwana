# WebZero Design System

## Overview
This document defines the design system for WebZero Interface. All components should use these design tokens to maintain visual consistency.

## Color System

### CSS Variables (Defined in index.html)
All colors are defined as CSS variables in the `<style>` section of `index.html`:

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0a1a;
  --bg-secondary: #1a1a2e;
  
  /* Accent Colors - Use these for branding! */
  --accent-cyan: #00ffff;
  --accent-magenta: #ff00ff;
  --accent-green: #00ff00;
  --accent-amber: #ffc800;
  
  /* Text Colors */
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0c0;
  
  /* Border */
  --border-color: rgba(0, 255, 255, 0.3);
}
```

## Usage Guidelines

### ✅ DO: Use CSS Variables
```tsx
// Correct - Uses design system
<div style={{ backgroundColor: 'var(--bg-primary)' }}>
  <p style={{ color: 'var(--text-primary)' }}>Text</p>
  <button style={{ borderColor: 'var(--accent-cyan)' }}>Button</button>
</div>
```

### ❌ DON'T: Use Hardcoded Colors
```tsx
// Wrong - Hardcoded colors break consistency
<div className="bg-purple-500">
  <p className="text-green-400">Text</p>
  <button className="border-cyan-600">Button</button>
</div>
```

## Component Library

### Cyberpunk Components
Use these pre-built components for consistency:

1. **HolographicPanel** - Container with holographic effects
   - Props: `glowColor: 'cyan' | 'magenta' | 'green' | 'amber'`
   - Uses design system automatically

2. **HolographicText** - Text with glow effects
   - Props: `glowColor`, `flickerEffect`, `glitchEffect`

3. **NeonButton** - Buttons with neon effects
   - Props: `color: 'cyan' | 'magenta' | 'green' | 'amber'`
   - Props: `fullWidth`, `size: 'large' | 'lg' | 'md' | 'sm'`

4. **FrequencyVisualizer** - Audio visualization
   - Props: `color: 'cyan' | 'magenta' | 'green' | 'amber'`

### Color Mapping
- **Cyan (Primary)** - Main interactive elements, links
- **Magenta (Secondary)** - Important features, creative tools
- **Green (Success)** - Code, development, positive states
- **Amber (Warning)** - Alerts, important notices

## Fixed Components
The following components have been updated to use the design system:

✅ AIWritingAssistant - Layout fixed, uses design tokens
✅ CodeHelper - Layout fixed, uses design tokens  
✅ NeonButton - Updated to support all required props
✅ HolographicPanel - Already consistent
✅ HolographicText - Already consistent

## Components Needing Updates
The following components still have hardcoded colors:

⚠️ AdminDashboard - Uses hardcoded green/red/yellow
⚠️ AgentPresence - Uses hardcoded green/red
⚠️ BudgetPlannerDisplay - Uses hardcoded green/red
⚠️ CallApp - Uses hardcoded green/purple
⚠️ Footer - Uses hardcoded purple
⚠️ JobListingDisplay - Uses hardcoded green/purple
⚠️ SettingsScreen - Uses hardcoded green
⚠️ SubscriptionModal - Uses hardcoded colors

## Status Colors
For success/error/warning states, use semantic colors:

```tsx
// Success states
style={{ color: 'var(--accent-green)' }}

// Error/Danger states  
style={{ color: '#ff0055' }} // Use sparingly

// Warning states
style={{ color: 'var(--accent-amber)' }}
```

## Typography
Fonts are loaded via Google Fonts in index.html:
- **Orbitron** - Headers, titles
- **Rajdhani** - Body text
- **Share Tech Mono** - Code, monospace

## Layout Best Practices

### Spacing
- Use consistent padding: `p-4`, `p-6` for panels
- Use `space-y-3` or `space-y-4` for vertical spacing
- Use `gap-2` or `gap-3` for flex/grid gaps

### Panels
Always wrap content in HolographicPanel for consistency:
```tsx
<HolographicPanel glowColor="cyan" withGrid withCorners>
  <div className="p-4">
    {/* Content */}
  </div>
</HolographicPanel>
```

### Backgrounds
- Use `backgroundColor: 'var(--bg-primary)'` for main backgrounds
- Use `backgroundColor: 'var(--bg-secondary)'` for nested elements
- Use `rgba(0, 0, 0, 0.4)` for glass-morphism effects

## Maintaining Consistency

1. **Before adding colors**: Check if a CSS variable exists
2. **Before creating new components**: Check if a cyberpunk component exists
3. **When in doubt**: Use cyan as the default accent color
4. **Never use**: Tailwind color classes like `bg-purple-500`, `text-green-400`

## Future Improvements
- Convert remaining components to use design tokens
- Create theme variants (high-contrast, minimal)
- Add dark mode toggle support
- Create component playground for testing
