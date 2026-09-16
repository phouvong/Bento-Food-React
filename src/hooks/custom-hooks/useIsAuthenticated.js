import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'

const useIsAuthenticated = () => {
    const { token } = useSelector((state) => state.userToken)
    const [isAuthenticated, setIsAuthenticated] = useState(null)

    useEffect(() => {
        setIsAuthenticated(Boolean(getToken()))
    }, [token])

    return isAuthenticated
}

export default useIsAuthenticated
