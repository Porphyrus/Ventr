import './App.scss'
import Input from './components/Input/Input'
import Header from './components/Header/Header'
import History from './components/History/History'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Input />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
