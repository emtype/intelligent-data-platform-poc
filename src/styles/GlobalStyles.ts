import styled, { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f5f5f5;
    color: #333;
  }

  #root {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .canvas-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background: 
      radial-gradient(circle at 1px 1px, rgba(0,0,0,.15) 1px, transparent 0);
    background-size: 20px 20px;
    background-color: #fafafa;
  }

  .node {
    position: absolute;
    background: white;
    border: 2px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
    cursor: move;
    user-select: none;
    min-width: 200px;
    min-height: 120px;
  }

  .node:hover {
    border-color: #4a90e2;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .node.selected {
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }

  .node.running {
    border-color: #f39c12;
    animation: pulse 2s infinite;
  }

  .node.success {
    border-color: #27ae60;
  }

  .node.error {
    border-color: #e74c3c;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(243, 156, 18, 0); }
    100% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0); }
  }

  .connection-line {
    position: absolute;
    pointer-events: none;
    z-index: 1;
  }

  .connection-line path {
    fill: none;
    stroke: #4a90e2;
    stroke-width: 2;
    stroke-dasharray: 0;
    transition: stroke-dasharray 0.3s ease;
  }

  .connection-line.active path {
    stroke-dasharray: 5, 5;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to { stroke-dashoffset: -10; }
  }
`

export const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
`

export const Sidebar = styled.div`
  width: 300px;
  background: white;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
  z-index: 10;
`

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

export const Toolbar = styled.div`
  height: 60px;
  background: white;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 10;
`

export const CanvasArea = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`