import React from 'react'
import { useSelector } from 'react-redux'
import HappyHourProgressBanner from '@/components/happy-hour/HappyHourProgressBanner'
import useHappyHourBanner from '@/hooks/custom-hooks/useHappyHourBanner'
import { getSubTotalPrice } from '@/utils/customFunctions'

interface RestaurantMobileHappyHourBarProps {
    restaurantId?: number | string
}

const RestaurantMobileHappyHourBar: React.FC<
    RestaurantMobileHappyHourBarProps
> = ({ restaurantId }) => {
    const { cartList = [] } = useSelector(
        (state: { cart: { cartList: Array<Record<string, unknown>> } }) =>
            state.cart
    )
    const cartDrawerOpen = useSelector(
        (state: { utilsData: { cartDrawerOpen?: boolean } }) =>
            state.utilsData?.cartDrawerOpen
    )

    const banner = useHappyHourBanner({
        restaurantId,
        cartSubtotal: getSubTotalPrice(cartList),
    })

    if (!banner.show || cartDrawerOpen) return null

    return (
        <HappyHourProgressBanner
            expireAt={banner.expireAt}
            windowMinutes={banner.windowMinutes}
            remainingAmount={banner.remainingAmount}
            discountPercent={banner.discountPercent}
            amountProgress={banner.amountProgress}
            flushBottom
        />
    )
}

export default RestaurantMobileHappyHourBar
