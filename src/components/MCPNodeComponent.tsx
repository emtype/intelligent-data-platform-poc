import React, { useState, useRef, useCallback } from 'react'
import styled from 'styled-components'
import { MCPNode } from '../types'

const NodeContainer = styled.div<{ 
  x: number
  y: number
  selected: boolean
  status: string
}>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: 200px;
  min-height: 120px;
  background: white;
  border: 2px solid ${props => {
    if (props.selected) return '#4a90e2'
    switch (props.status) {
      case 'running': return '#f39c12'
      case 'success': return '#27ae60'
      case 'error': return '#e74c3c'
      default: return '#ddd'
    }
  }};
  border-radius: 8px;
  box-shadow: ${props => props.selected ? '0 0 0 2px rgba(74, 144, 226, 0.2)' : '0 2px 8px rgba(0,0,0,0.1)'};
  cursor: move;
  user-select: none;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #4a90e2;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`

const NodeHeader = styled.div`
  padding: 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  border-radius: 6px 6px 0 0;
  position: relative;
`

const NodeTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const NodeType = styled.span`
  font-size: 10px;
  background: #e9ecef;
  color: #6c757d;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
  text-transform: uppercase;
`

const NodeDescription = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.3;
`

const NodeBody = styled.div`
  padding: 12px;
`

const NodeStatus = styled.div<{ status: string }>`
  font-size: 11px;
  font-weight: 500;
  color: ${props => {
    switch (props.status) {
      case 'running': return '#f39c12'
      case 'success': return '#27ae60'
      case 'error': return '#e74c3c'
      default: return '#6c757d'
    }
  }};
  text-transform: uppercase;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: '●';
    font-size: 8px;
  }
`

const PortContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`

const PortGroup = styled.div<{ isInput: boolean }>`
  position: absolute;
  ${props => props.isInput ? 'left: -10px;' : 'right: -10px;'}
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Port = styled.div<{ 
  type: string
  isInput: boolean
  isConnecting?: boolean
  canConnect?: boolean
  isDragging?: boolean
}>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => {
    if (props.canConnect) return '#27ae60'
    if (props.isConnecting) return '#f39c12'
    switch (props.type) {
      case 'data': return '#4a90e2'
      case 'query': return '#9b59b6'
      case 'result': return '#27ae60'
      case 'control': return '#f39c12'
      default: return '#95a5a6'
    }
  }};
  border: 3px solid white;
  box-shadow: 0 0 0 2px ${props => {
    if (props.canConnect) return '#27ae60'
    if (props.isConnecting) return '#f39c12'
    return '#ddd'
  }};
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  position: relative;
  transition: all 0.2s ease;
  pointer-events: all;
  z-index: 10;
  
  &:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 3px #4a90e2;
    z-index: 20;
  }

  ${props => props.isConnecting && `
    animation: pulse 1.5s infinite;
    box-shadow: 0 0 0 4px rgba(243, 156, 18, 0.4);
  `}

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0.7); }
    70% { box-shadow: 0 0 0 8px rgba(243, 156, 18, 0); }
    100% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0); }
  }
`

const PortLabel = styled.div<{ isInput: boolean; show: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #333;
  white-space: nowrap;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.95);
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.2s ease;
  z-index: 30;
  
  ${props => props.isInput ? 
    'right: 28px; text-align: right;' : 
    'left: 28px; text-align: left;'
  }
`

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'mysql': return '🗄️'
    case 'claude': return '🤖'
    case 'openai': return '🧠'
    case 'fdc-hadoop': return '🐘'
    case 'elasticsearch': return '🔍'
    default: return '⚙️'
  }
}

interface MCPNodeComponentProps {
  node: MCPNode
  selected: boolean
  connecting?: { nodeId: string; portId: string } | null
  onDrag: (nodeId: string, deltaX: number, deltaY: number) => void
  onClick: (nodeId: string) => void
  onConnectionStart: (nodeId: string, portId: string, portElement: HTMLElement) => void
  onConnectionEnd: (nodeId: string, portId: string) => void
}

const MCPNodeComponent: React.FC<MCPNodeComponentProps> = ({
  node,
  selected,
  connecting,
  onDrag,
  onClick,
  onConnectionStart,
  onConnectionEnd
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredPort, setHoveredPort] = useState<string | null>(null)
  const [portDragging, setPortDragging] = useState<string | null>(null)
  const nodeRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      onDrag(node.id, deltaX, deltaY)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }, [isDragging, dragStart, node.id, onDrag])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDragging) {
      onClick(node.id)
    }
  }, [isDragging, node.id, onClick])

  const handlePortMouseDown = useCallback((e: React.MouseEvent, portId: string, isInput: boolean) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!isInput && e.currentTarget instanceof HTMLElement) {
      setPortDragging(portId)
      onConnectionStart(node.id, portId, e.currentTarget)
    }
  }, [node.id, onConnectionStart])

  const handlePortMouseUp = useCallback((e: React.MouseEvent, portId: string, isInput: boolean) => {
    e.stopPropagation()
    
    if (isInput && connecting && connecting.nodeId !== node.id) {
      onConnectionEnd(node.id, portId)
    }
    setPortDragging(null)
  }, [node.id, onConnectionEnd, connecting])

  const handlePortMouseEnter = useCallback((portId: string) => {
    setHoveredPort(portId)
  }, [])

  const handlePortMouseLeave = useCallback(() => {
    setHoveredPort(null)
  }, [])

  const canConnectToPort = useCallback((portId: string, isInput: boolean) => {
    if (!connecting || !isInput) return false
    return connecting.nodeId !== node.id
  }, [connecting, node.id])

  return (
    <NodeContainer
      ref={nodeRef}
      x={node.position.x}
      y={node.position.y}
      selected={selected}
      status={node.status}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      <NodeHeader>
        <NodeTitle>
          {getNodeIcon(node.type)} {node.name}
          <NodeType>{node.type}</NodeType>
        </NodeTitle>
        <NodeDescription>{node.description}</NodeDescription>
      </NodeHeader>
      
      <NodeBody>
        <NodeStatus status={node.status}>{node.status}</NodeStatus>
        
        <PortContainer>
          <PortGroup isInput={true}>
            {node.inputs.map(port => (
              <div key={port.id} style={{ position: 'relative' }}>
                <Port
                  type={port.type}
                  isInput={true}
                  isConnecting={connecting?.nodeId === node.id && connecting?.portId === port.id}
                  canConnect={canConnectToPort(port.id, true)}
                  isDragging={portDragging === port.id}
                  onMouseDown={(e) => handlePortMouseDown(e, port.id, true)}
                  onMouseUp={(e) => handlePortMouseUp(e, port.id, true)}
                  onMouseEnter={() => handlePortMouseEnter(port.id)}
                  onMouseLeave={handlePortMouseLeave}
                />
                <PortLabel 
                  isInput={true} 
                  show={hoveredPort === port.id || connecting !== null}
                >
                  {port.name}
                </PortLabel>
              </div>
            ))}
          </PortGroup>
          
          <PortGroup isInput={false}>
            {node.outputs.map(port => (
              <div key={port.id} style={{ position: 'relative' }}>
                <Port
                  type={port.type}
                  isInput={false}
                  isConnecting={connecting?.nodeId === node.id && connecting?.portId === port.id}
                  canConnect={false}
                  isDragging={portDragging === port.id}
                  onMouseDown={(e) => handlePortMouseDown(e, port.id, false)}
                  onMouseUp={(e) => handlePortMouseUp(e, port.id, false)}
                  onMouseEnter={() => handlePortMouseEnter(port.id)}
                  onMouseLeave={handlePortMouseLeave}
                />
                <PortLabel 
                  isInput={false} 
                  show={hoveredPort === port.id || connecting !== null}
                >
                  {port.name}
                </PortLabel>
              </div>
            ))}
          </PortGroup>
        </PortContainer>
      </NodeBody>
    </NodeContainer>
  )
}

export default MCPNodeComponent