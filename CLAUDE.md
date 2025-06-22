# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Intelligent Data Platform Proof of Concept built with React, TypeScript, and Vite. It provides a visual workflow builder interface for creating data processing pipelines using MCP (Model Context Protocol) nodes. The application features a drag-and-drop canvas where users can connect different types of nodes (MySQL, Claude, OpenAI, FDC, custom) to build data workflows.

## Development Commands

### Essential Commands
- `yarn dev` - Start development server on port 13132 with localdev mode
- `yarn build` - Build for production (runs TypeScript compiler first, then Vite build)
- `yarn build:development` - Build with development configuration
- `yarn build:production` - Build with production configuration
- `yarn type-check` - Run TypeScript type checking without emitting files
- `yarn lint` - Run ESLint with TypeScript support
- `yarn lint:fix` - Run ESLint and automatically fix issues
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check code formatting without making changes
- `yarn clean` - Remove dist directory
- `yarn preview` - Preview production build

### Package Manager
Uses Yarn 1.22.22 as the package manager.

## Architecture Overview

### Core Components Structure
The application follows a component-based architecture with clear separation of concerns:

**Main Application Flow:**
- `App.tsx` → `WorkflowBuilder.tsx` → `WorkflowCanvas.tsx` + `MCPSidebar.tsx` + `WorkflowToolbar.tsx`

**Key Component Relationships:**
- `WorkflowBuilder` acts as the main orchestrator, managing workflow state and coordinating between sidebar, canvas, and toolbar
- `WorkflowCanvas` handles the visual canvas, node positioning, connections, and viewport management (zoom/pan)
- `MCPNodeComponent` represents individual workflow nodes with drag/drop, connection ports, and visual states
- `MCPSidebar` provides the node palette for adding new nodes to workflows

### State Management Pattern
The application uses React's useState with callback patterns for state management:
- Main workflow state in `WorkflowBuilder` includes nodes, connections, and viewport
- State updates flow through callback props from parent to child components
- Node updates are handled via `handleNodeUpdate` callback pattern
- Connection creation uses a two-phase process (start/end) for drag-and-drop UX

### TypeScript Type System
Core types defined in `src/types/index.ts`:
- `MCPNode` - Represents workflow nodes with position, ports, config, and status
- `MCPConnection` - Defines connections between node ports
- `WorkflowCanvas` - Contains nodes, connections, and viewport state
- `MCPProvider` - Defines available node types and their configuration schemas

### Styling Architecture
Uses styled-components for styling:
- `GlobalStyles.ts` contains global styles and reusable styled components
- Component-specific styles are co-located within component files
- Consistent design system with defined colors, spacing, and animations
- CSS-in-JS approach with props-based dynamic styling

### Canvas and Interaction System
The workflow canvas implements:
- SVG-based connection rendering with Bezier curves
- Viewport management (pan/zoom) with mouse and wheel events
- Drag-and-drop for both nodes and connection creation
- Port-based connection system with visual feedback
- Real-time connection preview during drag operations

## Development Patterns

### Component Props Pattern
Components use specific callback prop patterns:
- `onNodeUpdate(nodeId, updates)` for node modifications
- `onConnectionCreate(connection)` for new connections
- `onViewportChange(viewport)` for canvas navigation

### Node Connection Workflow
1. User drags from output port (`onConnectionStart`)
2. Visual connection line follows mouse movement
3. User drops on compatible input port (`onConnectionEnd`)
4. Connection object created and added to workflow state

### Status Management
Nodes have status states: `idle`, `running`, `error`, `success` with corresponding visual indicators and animations.