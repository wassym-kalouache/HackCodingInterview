# Component Architecture

## Overview

This application consists of three main custom components and several shadcn UI components working together to create a seamless coding interview experience.

## Custom Components

### 1. ProblemViewer Component

**Location**: `components/ProblemViewer.tsx`

**Purpose**: Displays coding problem details in an organized, easy-to-read format.

**Props**:
```typescript
interface ProblemViewerProps {
  problem: {
    title: string;
    difficulty: string;
    description: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    constraints: string[];
    followUp?: string;
  };
}
```

**Features**:
- Color-coded difficulty badges (Easy/Medium/Hard)
- Structured sections using Card components
- Scrollable content area
- Syntax highlighting for code examples
- Follow-up section with distinct styling

---

### 2. CodeEditor Component

**Location**: `components/CodeEditor.tsx`

**Purpose**: Provides an interactive code editor with execution simulation.

**State Management**:
```typescript
- code: string              // Current code content
- language: string          // Selected programming language
- output: string            // Execution output
- isRunning: boolean        // Execution state
```

**Features**:
- Monaco Editor integration (VS Code editor)
- Language selector (JavaScript, TypeScript, Python, Java, C++)
- Run Code button with loading state
- Reset functionality
- Tabbed interface (Code/Output)
- Dark theme by default
- Line numbers and syntax highlighting

**Methods**:
- `handleEditorChange`: Updates code state
- `handleRunCode`: Simulates code execution
- `handleReset`: Restores default code template

---

### 3. Main Page Component

**Location**: `app/page.tsx`

**Purpose**: Orchestrates the split-pane layout and manages application state.

**Features**:
- Resizable panel groups (horizontal split)
- Problem data management
- Header with branding and live session indicator
- Responsive layout

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│         Header (Logo + Status)          │
├──────────────────┬──────────────────────┤
│                  │                      │
│  Problem Viewer  │    Code Editor       │
│  (Left Panel)    │    (Right Panel)     │
│                  │                      │
│                  │                      │
└──────────────────┴──────────────────────┘
```

---

## shadcn UI Components Used

### Button Component
**Location**: `components/ui/button.tsx`

**Usage**: Run Code, Reset buttons in CodeEditor

**Variants**: 
- `default`: Primary actions
- `outline`: Secondary actions

---

### Card Component
**Location**: `components/ui/card.tsx`

**Usage**: 
- Problem description sections
- Output display area

**Sub-components**:
- `Card`: Container
- `CardHeader`: Section headers
- `CardTitle`: Section titles
- `CardDescription`: Optional descriptions
- `CardContent`: Main content area

---

### Tabs Component
**Location**: `components/ui/tabs.tsx`

**Usage**: Code/Output view switcher in CodeEditor

**Sub-components**:
- `Tabs`: Container
- `TabsList`: Tab navigation
- `TabsTrigger`: Individual tab buttons
- `TabsContent`: Tab content panels

---

## Third-Party Components

### Panel Group (react-resizable-panels)

**Components**:
- `PanelGroup`: Container for resizable panels
- `Panel`: Individual resizable panel
- `PanelResizeHandle`: Draggable divider between panels

**Configuration**:
```typescript
<PanelGroup direction="horizontal">
  <Panel defaultSize={45} minSize={30}>
    {/* Left content */}
  </Panel>
  <PanelResizeHandle />
  <Panel defaultSize={55} minSize={30}>
    {/* Right content */}
  </Panel>
</PanelGroup>
```

---

### Monaco Editor (@monaco-editor/react)

**Configuration**:
```typescript
<Editor
  height="100%"
  language={language}
  value={code}
  onChange={handleEditorChange}
  theme="vs-dark"
  options={{
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
  }}
/>
```

---

## Styling Architecture

### Global Styles
**Location**: `app/globals.css`

**Features**:
- Tailwind CSS v4 integration
- CSS variables for theming
- Light/dark mode support
- Color scheme definitions

### Theme Colors

**Light Mode**:
- Background: White
- Foreground: Dark gray
- Primary: Black
- Secondary: Light gray

**Dark Mode**:
- Background: Dark gray
- Foreground: White
- Primary: Light gray
- Secondary: Medium gray

---

## Data Flow

```
User Interaction
      ↓
CodeEditor/ProblemViewer Component
      ↓
React State Updates
      ↓
UI Re-renders
      ↓
Monaco Editor/Display Updates
```

---

## Future Enhancement Ideas

1. **Real Code Execution**
   - Integrate with a code execution API
   - Add test case validation
   - Display execution time and memory usage

2. **Multiple Problems**
   - Problem selection dropdown
   - Problem navigation
   - Save progress

3. **Collaborative Features**
   - WebSocket integration
   - Real-time code sharing
   - Video/audio chat integration

4. **Advanced Editor Features**
   - Code snippets
   - Auto-formatting
   - Vim/Emacs keybindings
   - Custom themes

5. **Analytics**
   - Time tracking
   - Code metrics
   - Solution comparison

---

## Performance Considerations

1. **Monaco Editor**: Loaded on demand, not server-side rendered
2. **React Resizable Panels**: Lightweight, performant resizing
3. **shadcn Components**: Tree-shakeable, minimal bundle size
4. **Next.js App Router**: Optimal loading and routing performance

