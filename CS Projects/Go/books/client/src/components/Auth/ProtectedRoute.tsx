import { Navigate, Outlet } from "react-router-dom"
import React from 'react'
import { useContext } from 'react'
import Cookies from '../../../node_modules/@types/js-cookie'

const ProtectedRoute = () => {
    const token = localStorage.getItem("authToken")

    return (
        token ? <Outlet/> : <Navigate to={'/'}/>
    )
}

export default ProtectedRoute