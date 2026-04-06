import React from 'react'
import { createRoot } from 'react-dom/client'
import { DecisionScorecard } from './components/DecisionScorecard'

import './styles.css'

function App() {
  return (
    <div>
      <DecisionScorecard />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
