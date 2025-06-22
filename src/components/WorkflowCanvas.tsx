import React, { useRef, useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import { WorkflowCanvas as WorkflowCanvasType, MCPNode, MCPConnection } from '../types'
import MCPNodeComponent from './MCPNodeComponent'

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: 
    radial-gradient(circle at 1px 1px, rgba(0,0,0,.15) 1px, transparent 0);
  background-size: 20px 20px;
  background-color: #fafafa;
  cursor: grab;
  
  &.dragging {
    cursor: grabbing;
  }
`

const CanvasContent = styled.div<{ transform: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: ${props => props.transform};
  transform-origin: 0 0;
`

const ConnectionSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`

interface WorkflowCanvasProps {
  workflow: WorkflowCanvasType
  selectedNodeId: string | null
  onNodeUpdate: (nodeId: string, updates: Partial<MCPNode>) => void
  onNodeSelect: (nodeId: string | null) => void
  onConnectionCreate: (connection: MCPConnection) => void
  onViewportChange: (viewport: { x: number; y: number; zoom: number }) => void
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
  selectedNodeId,
  onNodeUpdate,
  onNodeSelect,
  onConnectionCreate,
  onViewportChange
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [connecting, setConnecting] = useState<{
    nodeId: string
    portId: string
    startPos: { x: number; y: number }
  } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.currentTarget === canvasRef.current) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      onNodeSelect(null)
    }
  }, [onNodeSelect])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setMousePos({
        x: (e.clientX - rect.left - workflow.viewport.x) / workflow.viewport.zoom,
        y: (e.clientY - rect.top - workflow.viewport.y) / workflow.viewport.zoom
      })
    }
    
    if (isDragging && canvasRef.current) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      
      const newViewport = {
        x: workflow.viewport.x + deltaX,
        y: workflow.viewport.y + deltaY,
        zoom: workflow.viewport.zoom
      }
      
      onViewportChange(newViewport)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }, [isDragging, dragStart, workflow.viewport, onViewportChange])

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false)
    setConnecting(null)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(3, workflow.viewport.zoom * zoomDelta))
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      const newViewport = {
        x: workflow.viewport.x - (mouseX - workflow.viewport.x) * (newZoom / workflow.viewport.zoom - 1),
        y: workflow.viewport.y - (mouseY - workflow.viewport.y) * (newZoom / workflow.viewport.zoom - 1),
        zoom: newZoom
      }
      
      onViewportChange(newViewport)
    }
  }, [workflow.viewport, onViewportChange])

  const handleNodeDrag = useCallback((nodeId: string, deltaX: number, deltaY: number) => {
    const node = workflow.nodes.find(n => n.id === nodeId)
    if (node) {
      onNodeUpdate(nodeId, {
        position: {
          x: node.position.x + deltaX / workflow.viewport.zoom,
          y: node.position.y + deltaY / workflow.viewport.zoom
        }
      })
    }
  }, [workflow.nodes, workflow.viewport.zoom, onNodeUpdate])

  const handleNodeClick = useCallback((nodeId: string) => {
    onNodeSelect(nodeId === selectedNodeId ? null : nodeId)
  }, [selectedNodeId, onNodeSelect])

  const handleConnectionStart = useCallback((nodeId: string, portId: string, portElement: HTMLElement) => {
    const rect = portElement.getBoundingClientRect()
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    
    if (canvasRect) {
      const sourceNode = workflow.nodes.find(n => n.id === nodeId)
      if (sourceNode) {
        setConnecting({
          nodeId,
          portId,
          startPos: {
            x: sourceNode.position.x + 210,
            y: sourceNode.position.y + 60
          }
        })
      }
    }
  }, [workflow.nodes])

  const handleConnectionEnd = useCallback((targetNodeId: string, targetPortId: string) => {
    if (connecting && connecting.nodeId !== targetNodeId) {
      const newConnection: MCPConnection = {
        id: `conn_${Date.now()}`,
        sourceNodeId: connecting.nodeId,
        sourcePortId: connecting.portId,
        targetNodeId,
        targetPortId
      }
      
      onConnectionCreate(newConnection)
    }
    setConnecting(null)
  }, [connecting, onConnectionCreate])

  const createBezierPath = (startX: number, startY: number, endX: number, endY: number) => {
    const controlOffset = Math.min(Math.abs(endX - startX) * 0.5, 150)
    const cp1x = startX + controlOffset
    const cp1y = startY
    const cp2x = endX - controlOffset
    const cp2y = endY
    
    return `M ${startX} ${startY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${endX} ${endY}`
  }

  const renderConnections = () => {
    const connections = workflow.connections.map(connection => {
      const sourceNode = workflow.nodes.find(n => n.id === connection.sourceNodeId)
      const targetNode = workflow.nodes.find(n => n.id === connection.targetNodeId)
      
      if (!sourceNode || !targetNode) return null
      
      const sourceX = sourceNode.position.x + 210
      const sourceY = sourceNode.position.y + 60
      const targetX = targetNode.position.x - 10
      const targetY = targetNode.position.y + 60
      
      const path = createBezierPath(sourceX, sourceY, targetX, targetY)
      
      return (
        <g key={connection.id}>
          <path
            d={path}
            fill="none"
            stroke="#4a90e2"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={path}
            fill="none"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="0"
          />
        </g>
      )
    })

    // 드래그 중인 연결선
    if (connecting) {
      const path = createBezierPath(
        connecting.startPos.x,
        connecting.startPos.y,
        mousePos.x,
        mousePos.y
      )
      
      connections.push(
        <g key="connecting">
          <path
            d={path}
            fill="none"
            stroke="#f39c12"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8,4"
          />
        </g>
      )
    }

    return connections
  }

  const transformStyle = `translate(${workflow.viewport.x}px, ${workflow.viewport.y}px) scale(${workflow.viewport.zoom})`

  return (
    <CanvasContainer
      ref={canvasRef}
      className={isDragging ? 'dragging' : ''}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onWheel={handleWheel}
    >
      <CanvasContent transform={transformStyle}>
        <ConnectionSvg>
          {renderConnections()}
        </ConnectionSvg>
        
        {workflow.nodes.map(node => (
          <MCPNodeComponent
            key={node.id}
            node={node}
            selected={selectedNodeId === node.id}
            connecting={connecting}
            onDrag={handleNodeDrag}
            onClick={handleNodeClick}
            onConnectionStart={handleConnectionStart}
            onConnectionEnd={handleConnectionEnd}
          />
        ))}
      </CanvasContent>
    </CanvasContainer>
  )
}

export default WorkflowCanvas