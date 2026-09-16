import React, { useRef } from 'react'
import { Box } from '@mui/material'
import RestaurantMobileCartBar from './RestaurantMobileCartBar'
import RestaurantMobileHappyHourBar from './RestaurantMobileHappyHourBar'
import useBottomOverlayHeight from '@/hooks/custom-hooks/useBottomOverlayHeight'

interface RestaurantMobileBottomBarProps {
    restaurantDetails?: Record<string, any>
}

const RestaurantMobileBottomBar: React.FC<RestaurantMobileBottomBarProps> = ({
    restaurantDetails,
}) => {
    const barRef = useRef<HTMLDivElement | null>(null)
    useBottomOverlayHeight(barRef)

    return (
        <Box
            ref={barRef}
            sx={{
                display: { xs: 'flex', md: 'none' },
                flexDirection: 'column',
                '& > *': { margin: 0 },
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1100,
                backgroundColor: 'transparent',
            }}
        >
            <RestaurantMobileHappyHourBar
                restaurantId={restaurantDetails?.id}
            />
            <RestaurantMobileCartBar restaurantDetails={restaurantDetails} />
        </Box>
    )
}

export default RestaurantMobileBottomBar
