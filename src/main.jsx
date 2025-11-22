import React from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import App from './App'
import './styles/tailwind.css'
import 'aos/dist/aos.css'
import AOS from 'aos'
AOS.init({duration:700})
createRoot(document.getElementById('root')).render(
 <React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>
)