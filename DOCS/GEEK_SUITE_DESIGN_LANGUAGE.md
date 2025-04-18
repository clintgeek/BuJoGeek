# GeekSuite Design Language

## Overview
This document outlines the design language used across the GeekSuite applications, ensuring consistency in user experience and visual identity. The design system is built on Material-UI (MUI) with custom theming and components.

## Color Palette

### Primary Colors
- **Primary Blue**: `#6098CC` (main)
  - Light: `#81B1D9`
  - Dark: `#4B7AA3`
  - Contrast Text: `#FFFFFF`

### Secondary Colors
- **Secondary Blue**: `#1976D2` (main)
  - Light: `#2196F3`
  - Dark: `#1565C0`
  - Contrast Text: `#FFFFFF`

### Background Colors
- Default: `#F5F5F5`
- Paper: `#FFFFFF`
- Code Editor: `#f5f5f5` (light mode)
- Mind Map: `#f8f9fa`

### Semantic Colors
- **Error**: `#B00020`
- **Success**: `#4CAF50`
- **Warning**: `#FFC107`
- **Info**: `#2196F3`

### Text Colors
- Primary: `#212121`
- Secondary: `#757575`
- Disabled: `#BDBDBD`
- Placeholder: Secondary with 70% opacity

## Typography

### Font Family
- Primary: `"Roboto", "Helvetica", "Arial", sans-serif`
- Monospace: `"Roboto Mono", monospace` (for code)

### Font Sizes
- H1: `2rem` (28px)
- H2: `1.5rem` (24px)
- H3: `1.25rem` (20px)
- H4: `1.125rem` (18px)
- H5: `1rem` (16px)
- H6: `0.875rem` (14px)
- Body 1: `0.875rem` (14px)
- Body 2: `0.75rem` (12px)
- Code: `0.9rem` (14.4px)

### Font Weights
- Regular: 400
- Medium: 500
- Bold: 700

## Spacing
- Base Unit: 8px
- Spacing Scale: Multiples of 8px
- Container Padding: 16px (2 units)
- Component Spacing: 16px (2 units)
- Grid Gutter: 24px (3 units)
- Mobile Padding: 8px (1 unit)
- Desktop Padding: 16px (2 units)

## Components

### App Bar
- Height: 60px
- Background: Primary Blue (`#6098CC`)
- Text Color: White
- Shadow: `0px 2px 4px rgba(0, 0, 0, 0.2)`
- Mobile Padding: 8px
- Desktop Padding: 16px

### Buttons
- Border Radius: 8px
- Text Transform: None
- Font Weight: 500
- Hover State: 4% opacity of primary color
- Disabled State: 38% opacity
- Loading State: Circular progress indicator
- Touch Target: 44px × 44px minimum

### Cards/Papers
- Border Radius: 8px
- Shadow: `0px 2px 4px -1px rgba(0,0,0,0.1), 0px 4px 5px 0px rgba(0,0,0,0.07), 0px 1px 10px 0px rgba(0,0,0,0.06)`
- Background: Paper color (`#FFFFFF`)
- Hover State: Elevation increase
- Active State: Elevation decrease

### Input Fields
- Border Radius: 8px
- Focus State: Primary color outline
- Placeholder Color: Secondary text color with 70% opacity
- Disabled State: 38% opacity
- Error State: Red outline and helper text

### Drawer
- Width: 220px
- Background: Paper color (`#FFFFFF`)
- Border: 1px solid divider color
- Shadow: None
- Mobile: Temporary drawer
- Desktop: Persistent drawer

### Mind Map Components
- Node:
  - Root Node: `#e3f2fd` background
  - Regular Node: White background
  - Selected: 2px solid primary color
  - Hover: Elevation increase
  - Edit Indicator: Green dot (8px)
- Edge:
  - Color: `#90caf9`
  - Border: 2px solid `#1976d2`
- Background: Dots pattern
- Grid: 15px × 15px snap grid

### Code Editor
- Background: `#f5f5f5` (light mode)
- Font: Roboto Mono
- Font Size: 0.9rem
- Line Height: 1.5
- Padding: 16px
- Border: None
- Placeholder: Secondary text with 70% opacity

### Tags
- Background: `primary.50`
- Text Color: `primary.main`
- Padding: 4px 8px
- Border Radius: 4px
- Margin Right: 8px

## Layout

### Grid System
- Breakpoints:
  - xs: 0px
  - sm: 600px
  - md: 900px
  - lg: 1200px
  - xl: 1536px

### Container
- Max Width: 1200px
- Padding: 16px (2 units)
- Mobile: Full width
- Desktop: Centered with max-width

## Interactive States

### Hover States
- Buttons: 4% opacity of primary color
- Cards: Elevation increase
- Links: Underline on hover
- Icons: Background color change
- Tags: Slight elevation increase

### Focus States
- Outline: 2px solid primary color
- Outline Offset: 2px
- Input Fields: Primary color outline
- Buttons: Primary color outline

### Active States
- Buttons: 12% opacity of primary color
- Cards: Elevation decrease
- Icons: Slight scale down

### Loading States
- Circular Progress: 24px size
- Inherit color from parent
- Full width buttons show progress
- Disabled state during loading

## Accessibility

### Color Contrast
- Text on Primary: 4.5:1 minimum
- Text on Paper: 4.5:1 minimum
- Interactive Elements: 3:1 minimum
- Error States: 4.5:1 minimum

### Focus Indicators
- Visible outline on all interactive elements
- High contrast focus rings
- Keyboard navigation support
- ARIA labels for icons

## Brand Elements

### Logo Treatment
- Primary Font: Roboto Bold
- Secondary Font: Roboto Mono
- Icon: AutoStoriesOutlined (Material-UI)
- Tagline: `</>` (code brackets)
- Size: 20px (primary), 16px (tagline)

### Iconography
- Material-UI Icons
- Size: 24px (default)
- Color: Primary or secondary text color
- Interactive: Hover state with background
- Disabled: 38% opacity

## Responsive Design

### Mobile First
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch targets: minimum 44px × 44px
- Full-width containers on mobile
- Stacked layouts on mobile

### Breakpoint Behavior
- Drawer: Collapses to hamburger menu below sm
- Typography: Scales down on mobile
- Spacing: Reduces on mobile
- Inputs: Full width on mobile
- Buttons: Full width on mobile
- Containers: No max-width on mobile

## Implementation Notes

### Material-UI Integration
- Theme Provider wrapper
- Custom theme overrides
- Component style overrides
- Global styles for consistency
- CSS-in-JS with sx prop

### CSS-in-JS
- Use MUI's `sx` prop for component-specific styles
- Use theme spacing function for consistent spacing
- Use theme color palette for consistent colors
- Use theme breakpoints for responsive design
- Use theme transitions for animations

### Best Practices
1. Always use theme values for colors, spacing, and typography
2. Maintain consistent component hierarchy
3. Follow mobile-first responsive design
4. Ensure proper contrast ratios
5. Use semantic HTML elements
6. Implement proper focus management
7. Test across all breakpoints
8. Use proper ARIA labels
9. Implement loading states
10. Handle disabled states consistently