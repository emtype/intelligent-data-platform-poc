import React from 'react'
import styled from 'styled-components'

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`

const ToolbarButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #4a90e2;
          color: white;
          border-color: #4a90e2;
          
          &:hover {
            background: #357abd;
            border-color: #357abd;
          }
        `
      case 'danger':
        return `
          background: #e74c3c;
          color: white;
          border-color: #e74c3c;
          
          &:hover {
            background: #c0392b;
            border-color: #c0392b;
          }
        `
      default:
        return `
          background: white;
          color: #333;
          border-color: #ddd;
          
          &:hover {
            background: #f5f5f5;
            border-color: #bbb;
          }
        `
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      background: ${props => props.variant === 'primary' ? '#4a90e2' : 
                   props.variant === 'danger' ? '#e74c3c' : 'white'};
    }
  }
`

const ToolbarSeparator = styled.div`
  width: 1px;
  height: 24px;
  background: #ddd;
  margin: 0 8px;
`

const ToolbarInfo = styled.div`
  font-size: 14px;
  color: #666;
  margin-left: auto;
  display: flex;
  gap: 16px;
`

const InfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: '●';
    color: #4a90e2;
    font-size: 10px;
  }
`

interface WorkflowToolbarProps {
  onClear: () => void
  onRun: () => void
  nodeCount: number
  connectionCount: number
}

const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  onClear,
  onRun,
  nodeCount,
  connectionCount
}) => {
  return (
    <ToolbarContainer>
      <ToolbarButton variant="primary" onClick={onRun} disabled={nodeCount === 0}>
        ▶ Run Workflow
      </ToolbarButton>
      
      <ToolbarButton onClick={() => console.log('Save workflow')}>
        💾 Save
      </ToolbarButton>
      
      <ToolbarButton onClick={() => console.log('Load workflow')}>
        📁 Load
      </ToolbarButton>
      
      <ToolbarSeparator />
      
      <ToolbarButton onClick={() => window.location.reload()}>
        🔄 Reset View
      </ToolbarButton>
      
      <ToolbarButton variant="danger" onClick={onClear} disabled={nodeCount === 0}>
        🗑 Clear All
      </ToolbarButton>
      
      <ToolbarInfo>
        <InfoItem>{nodeCount} Nodes</InfoItem>
        <InfoItem>{connectionCount} Connections</InfoItem>
      </ToolbarInfo>
    </ToolbarContainer>
  )
}

export default WorkflowToolbar