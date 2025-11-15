# Coding Interview Platform - Frontend

A modern, live coding interview platform built with Next.js, TypeScript, and shadcn UI, featuring Monaco Editor for a professional coding experience.

## Features

- **Split-Pane Layout**: Resizable panels with problem description on the left and code editor on the right
- **Monaco Editor**: Professional code editor with syntax highlighting and IntelliSense
- **Multi-Language Support**: JavaScript, TypeScript, Python, Java, and C++
- **Modern UI**: Beautiful interface built with shadcn UI components
- **Dark Mode Support**: Automatically adapts to system theme preferences
- **Live Session Indicator**: Shows active coding session status

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx          # Main application page with split layout
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles and theme configuration
├── components/
│   ├── CodeEditor.tsx    # Monaco editor component with run/reset functionality
│   ├── ProblemViewer.tsx # Problem description viewer
│   └── ui/               # shadcn UI components (button, card, tabs)
├── lib/
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn UI**: High-quality, accessible UI components
- **Monaco Editor**: VS Code's editor for the web
- **react-resizable-panels**: Resizable panel layout

## Features Overview

### Problem Viewer
- Clean, organized problem description
- Color-coded difficulty levels (Easy, Medium, Hard)
- Multiple examples with input/output
- Constraint listing
- Follow-up questions section

### Code Editor
- Language selection dropdown
- Full-featured Monaco editor with:
  - Syntax highlighting
  - Line numbers
  - Auto-completion
  - Code folding
- Run Code button (simulated execution)
- Reset button to restore default code
- Tabbed interface (Code/Output)
- Output panel for execution results

### Layout
- Responsive split-pane design
- Draggable resize handle between panels
- Minimum panel sizes to prevent collapse
- Professional header with branding
- Live session indicator

## Customization

### Adding New Problems

Edit the `problem` object in `app/page.tsx`:

```typescript
const problem = {
  title: "Your Problem Title",
  difficulty: "Easy", // or "Medium" or "Hard"
  description: "Problem description here...",
  examples: [
    {
      input: "input here",
      output: "output here",
      explanation: "optional explanation"
    }
  ],
  constraints: [
    "constraint 1",
    "constraint 2"
  ],
  followUp: "Optional follow-up question"
};
```

### Changing Code Editor Theme

In `components/CodeEditor.tsx`, modify the `theme` prop:

```typescript
<Editor
  theme="vs-dark"  // or "light" or "hc-black"
  // ...
/>
```

### Adding More Languages

Add options to the language selector in `components/CodeEditor.tsx`:

```typescript
<option value="go">Go</option>
<option value="rust">Rust</option>
// etc.
```

## Build for Production

```bash
npm run build
npm start
```

## License

MIT
