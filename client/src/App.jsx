import { BrowserRouter, Route, Routes } from "react-router-dom"
import Signup from "./Pages/Signup"
import Login from "./Pages/Login"
import Dashboard from "./Pages/Dashboard"
import { Toaster } from "react-hot-toast"
import { useState } from "react"
import Category from "./Modals/Category"

function App() {
  const [ selectedCard, setSelectedCard ] = useState()
  const [ categoryId, setCategoryId ] = useState()

  const closePopup = () => {
    setSelectedCard(null);
  };

  const renderPopup = () => {
    switch(selectedCard){
      case 'category' : 
        return (
          <div>
            <Category categoryId={categoryId} setSelectedCard={setSelectedCard} closePopup={closePopup} />
          </div>
        ) 
    }
  }

  return (
    <>
                {
            selectedCard && (
              <>
                <div className='popup-overlay z-40 fixed flex items-center justify-center top-0 left-0 w-[100vw] h-[100vh] bg-[#A59B9B4D] '>
                  <div className={`z-50 w-[551px] bg-white shadow-xl rounded-[12px] p-4`}>
                    <div className='w-full'>
                        {renderPopup()}
                    </div>
                  </div>
                </div>
              </>
            )
          }
    <Toaster position="bottom-center"></Toaster>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/*" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard setSelectedCard={setSelectedCard} />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
