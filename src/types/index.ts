export interface MCPNode {
  id: string
  type: 'mysql' | 'claude' | 'openai' | 'fdc' | 'custom'
  name: string
  description: string
  config: Record<string, any>
  position: {
    x: number
    y: number
  }
  inputs: MCPPort[]
  outputs: MCPPort[]
  status: 'idle' | 'running' | 'error' | 'success'
}

export interface MCPPort {
  id: string
  name: string
  type: 'data' | 'query' | 'result' | 'control'
  required: boolean
}

export interface MCPConnection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
}

export interface WorkflowCanvas {
  nodes: MCPNode[]
  connections: MCPConnection[]
  viewport: {
    x: number
    y: number
    zoom: number
  }
}

export interface MCPProvider {
  id: string
  name: string
  description: string
  category: 'database' | 'ai' | 'storage' | 'processing' | 'api'
  icon: string
  config: {
    fields: MCPConfigField[]
  }
  capabilities: string[]
  status: 'available' | 'unavailable' | 'deprecated'
}

export interface MCPConfigField {
  name: string
  label: string
  type: 'text' | 'password' | 'number' | 'select' | 'textarea'
  required: boolean
  defaultValue?: any
  options?: Array<{ label: string; value: any }>
  placeholder?: string
  description?: string
}