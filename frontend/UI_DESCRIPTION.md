# UI Layout Description

## Visual Overview

The application features a clean, modern interface with a split-screen layout optimized for coding interviews.

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  [🔷 CI] Coding Interview              Live Session [🟢]            │ ← Header
├─────────────────────────────────┬───────────────────────────────────┤
│                                 │                                   │
│   Two Sum [Easy]                │  [JavaScript ▼] [Reset] [▶ Run]  │ ← Controls
│                                 │                                   │
│   ┌─────────────────────────┐  │  [Code] [Output]                  │ ← Editor Tabs
│   │ Problem Description     │  │                                   │
│   │                         │  │   1  function twoSum(nums, target) │
│   │ Given an array of...    │  │   2  {                            │
│   └─────────────────────────┘  │   3    // Write your code here    │
│                                 │   4                               │
│   ┌─────────────────────────┐  │   5  }                            │
│   │ Examples                │  │   6                               │
│   │                         │  │                                   │
│   │ Example 1:              │  │                                   │
│   │ Input: nums = [2,7...   │  │                                   │
│   │ Output: [0,1]           │  │                                   │
│   └─────────────────────────┘  │                                   │
│                                 │                                   │
│   ┌─────────────────────────┐  │                                   │
│   │ Constraints             │  │                                   │
│   │ • 2 <= nums.length...   │  │                                   │
│   └─────────────────────────┘  │                                   │
│                                 │                                   │
│   ┌─────────────────────────┐  │                                   │
│   │ Follow-up              │  │                                   │
│   │ Can you come up with... │  │                                   │
│   └─────────────────────────┘  │                                   │
│                                 │                                   │
└─────────────────────────────────┴───────────────────────────────────┘
     Problem Viewer (45%)      │     Code Editor (55%)
                            Resize Handle
```

## Component Breakdown

### 1. Header (Top Bar)
- **Height**: ~64px
- **Background**: White (light mode) / Dark gray (dark mode)
- **Border**: Bottom border for separation

#### Left Side:
- **Logo**: Blue-purple gradient square with "CI" text
- **Title**: "Coding Interview" in bold text

#### Right Side:
- **Status Text**: "Live Session" in muted gray
- **Indicator**: Green pulsing dot showing active session

### 2. Left Panel - Problem Viewer

**Default Width**: 45% of screen (resizable to 30-70%)

#### Problem Title Section:
- Large heading with problem name
- Difficulty badge (color-coded):
  - Easy: Green background
  - Medium: Yellow background
  - Hard: Red background

#### Problem Description Card:
- White card with subtle border
- Section title: "Problem Description"
- Body text in readable gray
- Proper line spacing and padding

#### Examples Card:
- Each example in a light gray box
- Numbered (Example 1, 2, 3...)
- Shows Input, Output, and optional Explanation
- Monospace font for code-like content

#### Constraints Card:
- Bulleted list format
- Each constraint on separate line
- Mathematical notation preserved (e.g., ≤, ⁹)

#### Follow-up Card:
- Blue-tinted border for emphasis
- Blue title text
- Stands out as bonus question

### 3. Resize Handle (Middle Divider)

- **Width**: 1-2px
- **Color**: Light gray (default)
- **Hover State**: Blue highlight
- **Cursor**: Column resize icon (↔)
- **Behavior**: Draggable left/right

### 4. Right Panel - Code Editor

**Default Width**: 55% of screen (resizable to 30-70%)

#### Top Control Bar:
- **Height**: ~60px
- **Border**: Bottom border

##### Left Side:
- **Language Selector**: Dropdown menu
  - Options: JavaScript, TypeScript, Python, Java, C++
  - Default: JavaScript
  - Bordered, rounded corners

##### Right Side:
- **Reset Button**: Outlined style, gray
- **Run Code Button**: Green background, white text
  - Shows "Running..." when executing
  - Disabled state during execution

#### Tab Navigation:
- Two tabs: "Code" and "Output"
- Underline indicator on active tab
- Smooth transition animations

#### Code Tab (Monaco Editor):
- **Background**: Dark theme (VS Code dark)
- **Features**:
  - Line numbers on left (gray)
  - Syntax highlighting (colored keywords)
  - Current line highlight
  - Cursor blinking
  - Code suggestions/IntelliSense
  - Scroll bars when needed
  - Professional monospace font

#### Output Tab:
- Light gray card background
- Monospace font for output
- Placeholder text when empty
- Pre-formatted text display
- Scrollable for long output

## Color Palette

### Light Mode:
- **Background**: White (#FFFFFF)
- **Text**: Dark gray (#1A1A1A)
- **Muted Text**: Medium gray (#888888)
- **Borders**: Light gray (#E5E5E5)
- **Cards**: White with subtle shadow

### Dark Mode (Editor):
- **Background**: Dark gray (#1E1E1E)
- **Text**: Light gray (#D4D4D4)
- **Line Numbers**: Medium gray (#858585)
- **Selection**: Blue highlight
- **Keywords**: Various (blue, purple, yellow)

### Accent Colors:
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

## Typography

### Fonts:
- **Sans-serif**: Geist (modern, clean)
- **Monospace**: Geist Mono (code editor)

### Sizes:
- **Title**: 24px, bold
- **Section Headings**: 18px, semi-bold
- **Body Text**: 14px, regular
- **Code**: 14px, monospace
- **Small Text**: 12px

## Responsive Behavior

### Desktop (1920px+):
- Full split layout
- Generous padding and spacing
- Default panel sizes (45/55)

### Laptop (1280px-1919px):
- Optimized split layout
- Slightly reduced padding
- Panel sizes remain resizable

### Tablet (768px-1279px):
- Narrower panels
- Smaller font sizes
- Adjusted padding

### Mobile (<768px):
- Consider stacking panels vertically
- Full-width components
- Touch-friendly controls

## Interactions

### Hover States:
- **Buttons**: Slight darkening, smooth transition
- **Resize Handle**: Blue highlight, cursor change
- **Tabs**: Subtle background change

### Focus States:
- **Input/Dropdowns**: Blue outline ring
- **Buttons**: Visible focus indicator

### Active States:
- **Tabs**: Underline, different background
- **Buttons**: Pressed appearance

### Loading States:
- **Run Button**: "Running..." text, disabled
- **Output**: "Running code..." message

## Accessibility

- **Keyboard Navigation**: Full support
- **Focus Indicators**: Visible outlines
- **Color Contrast**: WCAG AA compliant
- **Screen Reader**: Semantic HTML structure
- **Alt Text**: For all icons and images

## Animation & Transitions

- **Duration**: 150-300ms
- **Easing**: Smooth, natural curves
- **Elements**:
  - Button hover/press
  - Tab switching
  - Panel resizing
  - Pulse animation (live indicator)
  - Color transitions

## Visual Hierarchy

1. **Header**: Establishes context
2. **Problem Title**: Draws attention first
3. **Problem Cards**: Clear sections
4. **Code Editor**: Primary workspace
5. **Control Buttons**: Action-oriented
6. **Output**: Result feedback

## Professional Polish

- Consistent spacing (8px grid system)
- Rounded corners (8-10px radius)
- Subtle shadows on cards
- Clean, minimal borders
- Professional color scheme
- Smooth, purposeful animations
- Clear visual feedback
- Modern, flat design aesthetic

