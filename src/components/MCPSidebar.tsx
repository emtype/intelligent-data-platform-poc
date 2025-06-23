import React, { useState } from 'react'
import styled from 'styled-components'
import { MCPNode, MCPProvider } from '../types'

const SidebarContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
`

const SidebarTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`

const CategoryTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  background: white;
`

const CategoryTab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: ${props => props.active ? '#4a90e2' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#4a90e2' : '#f5f5f5'};
  }
`

const MCPList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`

const MCPItem = styled.div`
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #4a90e2;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`

const MCPName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
`

const MCPDescription = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`

const MCPStatus = styled.div<{ status: string }>`
  font-size: 10px;
  font-weight: 500;
  color: ${props => {
    switch (props.status) {
      case 'available': return '#27ae60'
      case 'unavailable': return '#e74c3c'
      case 'deprecated': return '#f39c12'
      default: return '#666'
    }
  }};
  margin-top: 4px;
  text-transform: uppercase;
`

interface MCPSidebarProps {
  onAddNode: (nodeTemplate: Partial<MCPNode>) => void
}

const MCPSidebar: React.FC<MCPSidebarProps> = ({ onAddNode }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const mcpProviders: MCPProvider[] = [
    {
      id: 'mysql',
      name: 'MySQL Database',
      description: 'Connect to MySQL databases for data queries and operations',
      category: 'database',
      icon: '🗄️',
      config: {
        fields: [
          { name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
          { name: 'port', label: 'Port', type: 'number', required: true, defaultValue: 3306 },
          { name: 'database', label: 'Database', type: 'text', required: true },
          { name: 'username', label: 'Username', type: 'text', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true }
        ]
      },
      capabilities: ['query', 'insert', 'update', 'delete'],
      status: 'available'
    },
    {
      id: 'claude',
      name: 'Claude AI',
      description: 'AI-powered data analysis and visualization using Claude',
      category: 'ai',
      icon: '🤖',
      config: {
        fields: [
          { name: 'apiKey', label: 'API Key', type: 'password', required: true },
          { name: 'model', label: 'Model', type: 'select', required: true, defaultValue: 'claude-3-sonnet', 
            options: [
              { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet' },
              { label: 'Claude 3 Haiku', value: 'claude-3-haiku' }
            ]
          }
        ]
      },
      capabilities: ['analyze', 'visualize', 'summarize'],
      status: 'available'
    },
    {
      id: 'openai',
      name: 'OpenAI GPT',
      description: 'Natural language to SQL conversion and text processing',
      category: 'ai',
      icon: '🧠',
      config: {
        fields: [
          { name: 'apiKey', label: 'API Key', type: 'password', required: true },
          { name: 'model', label: 'Model', type: 'select', required: true, defaultValue: 'gpt-4',
            options: [
              { label: 'GPT-4', value: 'gpt-4' },
              { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }
            ]
          }
        ]
      },
      capabilities: ['text-to-sql', 'nlp', 'generation'],
      status: 'available'
    },
    {
      id: 'fdc-hadoop',
      name: 'FDC Hadoop Cluster',
      description: 'Big data processing with anonymized internal data',
      category: 'processing',
      icon: '🐘',
      config: {
        fields: [
          { name: 'clusterUrl', label: 'Cluster URL', type: 'text', required: true },
          { name: 'username', label: 'Username', type: 'text', required: true },
          { name: 'kerberosConfig', label: 'Kerberos Config', type: 'textarea', required: false }
        ]
      },
      capabilities: ['batch-processing', 'analytics', 'data-lake'],
      status: 'available'
    },
    {
      id: 'elasticsearch',
      name: 'Elasticsearch',
      description: 'Search and analytics engine for log and text data',
      category: 'database',
      icon: '🔍',
      config: {
        fields: [
          { name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost:9200' },
          { name: 'username', label: 'Username', type: 'text', required: false },
          { name: 'password', label: 'Password', type: 'password', required: false },
          { name: 'index', label: 'Default Index', type: 'text', required: false }
        ]
      },
      capabilities: ['search', 'aggregation', 'analytics'],
      status: 'available'
    }
  ]

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'database', label: 'Database' },
    { id: 'ai', label: 'AI' },
    { id: 'processing', label: 'Processing' },
    { id: 'storage', label: 'Storage' },
    { id: 'api', label: 'API' }
  ]

  const filteredProviders = mcpProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleAddMCPNode = (provider: MCPProvider) => {
    const nodeTemplate: Partial<MCPNode> = {
      type: provider.id as any,
      name: provider.name,
      description: provider.description,
      config: {},
      inputs: [
        { id: 'input', name: 'Input', type: 'data', required: false }
      ],
      outputs: [
        { id: 'output', name: 'Output', type: 'data', required: false }
      ]
    }

    if (provider.id === 'elasticsearch') {
      const host = window.prompt('Elasticsearch Host', 'http://localhost:9200')
      if (host === null) return
      const username = window.prompt('Username', '')
      if (username === null) return
      const password = window.prompt('Password', '')
      if (password === null) return
      const index = window.prompt('Default Index', '')
      if (index === null) return

      nodeTemplate.config = {
        host,
        username,
        password,
        index
      }
    }

    onAddNode(nodeTemplate)
  }

  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarTitle>MCP Providers</SidebarTitle>
        <SearchInput
          type="text"
          placeholder="Search providers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SidebarHeader>
      
      <CategoryTabs>
        {categories.map(category => (
          <CategoryTab
            key={category.id}
            active={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </CategoryTab>
        ))}
      </CategoryTabs>
      
      <MCPList>
        {filteredProviders.map(provider => (
          <MCPItem
            key={provider.id}
            onClick={() => handleAddMCPNode(provider)}
          >
            <MCPName>{provider.icon} {provider.name}</MCPName>
            <MCPDescription>{provider.description}</MCPDescription>
            <MCPStatus status={provider.status}>{provider.status}</MCPStatus>
          </MCPItem>
        ))}
      </MCPList>
    </SidebarContainer>
  )
}

export default MCPSidebar