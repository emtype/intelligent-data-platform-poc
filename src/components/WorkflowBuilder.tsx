import React, { useState, useCallback } from 'react'
import { AppContainer, Sidebar, MainContent, Toolbar, CanvasArea } from '../styles/GlobalStyles'
import MCPSidebar from './MCPSidebar'
import WorkflowCanvas from './WorkflowCanvas'
import WorkflowToolbar from './WorkflowToolbar'
import { WorkflowCanvas as WorkflowCanvasType, MCPNode, MCPConnection } from '../types'

const WorkflowBuilder: React.FC = () => {
  const [workflow, setWorkflow] = useState<WorkflowCanvasType>({
    nodes: [],
    connections: [],
    viewport: { x: 0, y: 0, zoom: 1 }
  })

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const handleAddNode = useCallback((nodeTemplate: Partial<MCPNode>) => {
    const newNode: MCPNode = {
      id: `node_${Date.now()}`,
      type: nodeTemplate.type || 'custom',
      name: nodeTemplate.name || 'New Node',
      description: nodeTemplate.description || '',
      config: nodeTemplate.config || {},
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100
      },
      inputs: nodeTemplate.inputs || [],
      outputs: nodeTemplate.outputs || [],
      status: 'idle'
    }

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }))
  }, [])

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<MCPNode>) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }))
  }, [])

  const handleConnectionCreate = useCallback((connection: MCPConnection) => {
    setWorkflow(prev => ({
      ...prev,
      connections: [...prev.connections, connection]
    }))
  }, [])

  const handleViewportChange = useCallback((viewport: { x: number; y: number; zoom: number }) => {
    setWorkflow(prev => ({
      ...prev,
      viewport
    }))
  }, [])

  const handleClearWorkflow = useCallback(() => {
    setWorkflow({
      nodes: [],
      connections: [],
      viewport: { x: 0, y: 0, zoom: 1 }
    })
    setSelectedNodeId(null)
  }, [])

  const handleRunWorkflow = useCallback(() => {
    console.log('Running workflow:', workflow)
  }, [workflow])

  return (
    <AppContainer>
      <Sidebar>
        <MCPSidebar onAddNode={handleAddNode} />
      </Sidebar>
      <MainContent>
        <Toolbar>
          <WorkflowToolbar 
            onClear={handleClearWorkflow}
            onRun={handleRunWorkflow}
            nodeCount={workflow.nodes.length}
            connectionCount={workflow.connections.length}
          />
        </Toolbar>
        <CanvasArea>
          <WorkflowCanvas
            workflow={workflow}
            selectedNodeId={selectedNodeId}
            onNodeUpdate={handleNodeUpdate}
            onNodeSelect={setSelectedNodeId}
            onConnectionCreate={handleConnectionCreate}
            onViewportChange={handleViewportChange}
          />
        </CanvasArea>
      </MainContent>
    </AppContainer>
  )
}

export default WorkflowBuilder