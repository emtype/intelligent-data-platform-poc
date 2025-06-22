import React from 'react'
import { Routes, Route } from 'react-router-dom'
import WorkflowBuilder from './components/WorkflowBuilder'

function App() {
  return (
    <Routes>
      <Route path="/" element={<WorkflowBuilder />} />
    </Routes>
  )
}

export default App