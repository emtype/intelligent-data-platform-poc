import React, { useState } from 'react'
import styled from 'styled-components'
import { MCPProvider } from '../types'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  max-width: 90%;
`

const ModalTitle = styled.h3`
  margin-bottom: 16px;
`

const Field = styled.div`
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const Label = styled.label`
  font-weight: 500;
`

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`

const Textarea = styled.textarea`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`

const Buttons = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`

const Button = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background: #4a90e2;
  color: white;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

interface ConfigModalProps {
  provider: MCPProvider
  onCancel: () => void
  onSubmit: (config: Record<string, any>) => void
}

const ConfigModal: React.FC<ConfigModalProps> = ({ provider, onCancel, onSubmit }) => {
  const initialState = provider.config.fields.reduce<Record<string, any>>((acc, field) => {
    acc[field.name] = field.defaultValue || ''
    return acc
  }, {})
  const [formData, setFormData] = useState<Record<string, any>>(initialState)

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  return (
    <Overlay>
      <ModalContainer>
        <ModalTitle>{provider.name} Settings</ModalTitle>
        {provider.config.fields.map(field => (
          <Field key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === 'select' ? (
              <Select
                id={field.name}
                value={formData[field.name] ?? ''}
                onChange={e => handleChange(field.name, e.target.value)}
              >
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            ) : field.type === 'textarea' ? (
              <Textarea
                id={field.name}
                value={formData[field.name] ?? ''}
                onChange={e => handleChange(field.name, e.target.value)}
              />
            ) : (
              <Input
                id={field.name}
                type={field.type}
                value={formData[field.name] ?? ''}
                placeholder={field.placeholder}
                onChange={e => handleChange(field.name, e.target.value)}
              />
            )}
          </Field>
        ))}
        <Buttons>
          <Button type="button" onClick={onCancel}>Cancel</Button>
          <Button type="button" onClick={handleSubmit}>Add Node</Button>
        </Buttons>
      </ModalContainer>
    </Overlay>
  )
}

export default ConfigModal
