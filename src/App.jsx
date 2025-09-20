import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DroppingText from './drop_text'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className='App'>
      <DroppingText text= "Welcome to my Portfolio"></DroppingText>
    </div>
    </>
  )
}

export default App
