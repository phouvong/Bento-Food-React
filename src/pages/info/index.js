import React, { useEffect, useState } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import CustomContainer from '../../components/container'
import UserInfo from '../../components/user-info'
import SideDrawerForProfile from '../../components/user-info/SideDrawer'
import jwt from 'base-64'
import { useSearchParams } from 'next/navigation'
import useIsAuthenticated from '@/hooks/custom-hooks/useIsAuthenticated'
const Index = () => {
    const searchParams = useSearchParams()
    const isAuthenticated = useIsAuthenticated()
    const orderId = searchParams.get('orderId')
    const token = searchParams.get('token')
    const page = searchParams.get('page') || (token ? 'order' : null)
    const [attributeId, setAttributeId] = useState('')

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwt.decode(token)

                if (typeof decodedToken === 'string') {
                    const keyValuePairs = decodedToken.split('&&')

                    for (const pair of keyValuePairs) {
                        const [key, value] = pair.split('=')
                        if (key === 'attribute_id') {
                            setAttributeId(value)
                            break
                        }
                    }
                } else {
                    console.error(
                        'Decoded token is not a string:',
                        decodedToken
                    )
                }
            } catch (error) {
                console.error('Error decoding token:', error)
            }
        }
    }, [token])

    return (
        <div>
            <CssBaseline />
            {page && isAuthenticated !== null && (
                <>
                    {/* Rendered outside CustomContainer so this bar
                        spans the full viewport width on mobile instead
                        of inheriting the Container's horizontal padding. */}
                    <SideDrawerForProfile
                        page={page}
                        setAttributeId={setAttributeId}
                        isAuthenticated={isAuthenticated}
                    />
                    <CustomContainer>
                        <UserInfo
                            page={page}
                            orderId={orderId ?? attributeId}
                            setAttributeId={setAttributeId}
                            isAuthenticated={isAuthenticated}
                        />
                    </CustomContainer>
                </>
            )}
        </div>
    )
}

export default Index
