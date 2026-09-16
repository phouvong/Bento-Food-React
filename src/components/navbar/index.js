import React, { useEffect } from 'react'
import { AppBarStyle } from './Navbar.style'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@emotion/react'
import { useSelector } from 'react-redux'
import NewNavbar from './new-navbar/NewNavbar'
import { usesMobilePageHeader } from './navbarConstants'
import { setCategoryIsSticky, setSticky } from '@/redux/slices/scrollPosition'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { checkMaintenanceMode } from '@/utils/customFunctions'
import { cart } from '@/redux/slices/cart'
import useGetAllCartList, {
    mapRestaurantCartRows,
} from '../../hooks/react-query/add-cart/useGetAllCartList'
import { ConfigApi } from '@/hooks/react-query/config/useConfig'
import { useQuery } from 'react-query'
import { onSingleErrorResponse } from '@/components/ErrorResponse'
import { setGlobalSettings } from '@/redux/slices/global'

const Navigation = () => {
    const { global } = useSelector((state) => state.globalSettings)
    const router = useRouter()
    const dispatch = useDispatch()
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    useEffect(() => {
        if (router.pathname !== '/home') dispatch(setSticky(false))
        dispatch(setCategoryIsSticky(false))
    }, [router.pathname])
    const cartListSuccessHandler = (res) => {
        if (!Array.isArray(res) || res.length === 0) return
        const isIndividualItemFormat = Boolean(res[0]?.item)
        if (!isIndividualItemFormat) return
        dispatch(cart(mapRestaurantCartRows(res)))
    }

    const { data: cartData, refetch: cartListRefetch } = useGetAllCartList(
        undefined,
        { onSuccess: cartListSuccessHandler }
    )
    useEffect(() => {
        cartListRefetch()
    }, [router.pathname])

    const handleConfigData = (res) => {
        if (res?.data) {
            dispatch(setGlobalSettings(res?.data))
        }
    }
    const { data, refetch } = useQuery(['config'], ConfigApi.config, {
        enabled: false,
        onError: onSingleErrorResponse,
        onSuccess: handleConfigData,
        staleTime: 1000 * 60 * 8,
        cacheTime: 8 * 60 * 1000,
    })
    useEffect(() => {
        if (!global) {
            refetch()
        }
    }, [data])

    useEffect(() => {
        if (global) {
            if (checkMaintenanceMode(global)) {
                router.push('/maintenance')
            }
        }
    }, [global])

    if (isSmall && usesMobilePageHeader(router.pathname)) return null

    return (
        <AppBarStyle
            sx={{ borderRadius: '0px', zIndex: '1200' }}
            disableGutters={true}
            isSmall={isSmall}
        >
            <NewNavbar cartListRefetch={cartListRefetch} />
        </AppBarStyle>
    )
}

export default Navigation
