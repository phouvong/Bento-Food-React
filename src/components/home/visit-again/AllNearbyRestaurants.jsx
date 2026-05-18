import NewStoreCard from '@/components/new-store-card/NewStoreCard'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { Box, CircularProgress, Stack, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import SearchRestaurent from './SearchRestaurent'
import CustomEmptyResult from '@/components/empty-view/CustomEmptyResult'
import { noRestaurantsImage } from '@/utils/LocalImages'

const AllNearbyRestaurants = ({
    restaurants,
    setRestaurants,
    allRestaurants,
    isLoading,
    hoveredMarkerId,
    seletedRestaurentRef,
}) => {
    const theme = useTheme()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const { global } = useSelector((state) => state.globalSettings)
    useEffect(() => {
        if (!hoveredMarkerId || !seletedRestaurentRef.current) return
        const elementId = String(hoveredMarkerId).startsWith('restaurent-')
            ? hoveredMarkerId
            : `restaurent-${hoveredMarkerId}`
        const cardElement = document.getElementById(elementId)
        if (!cardElement) return
        const scrollTimer = setTimeout(() => {
            cardElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            })
        }, 200)
        return () => clearTimeout(scrollTimer)
    }, [hoveredMarkerId, seletedRestaurentRef])

    const forSmallDevice = {
        height: '100%',
        width: '100%',
    }
    const forLargeDevice = {
        maxHeight: '55vh',
    }

    return (
        <CustomStackFullWidth
            padding={{ xs: '20px', sm: '10px 0 0 10px', md: '20px 0 0 20px' }}
            borderRadius="8px"
            gap="20px"
        >
            <Stack pr={!isXSmall && '30px'}>
                <SearchRestaurent
                    restaurants={restaurants}
                    setRestaurants={setRestaurants}
                    allRestaurants={allRestaurants}
                />
            </Stack>
            {isLoading ? (
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    minHeight={isXSmall ? '210px' : '55vh'}
                >
                    <CircularProgress />
                </Stack>
            ) : (
                <SimpleBar style={isXSmall ? forSmallDevice : forLargeDevice}>
                    <CustomStackFullWidth
                        paddingBlock={isXSmall && '10px'}
                        gap="20px"
                        flexDirection={isXSmall ? 'row' : 'column'}
                        ref={seletedRestaurentRef}
                    >
                        {restaurants?.length === 0 ? (
                            <CustomStackFullWidth
                                alignItems="center"
                                justifyContent="center"
                            >
                                <CustomEmptyResult
                                    height="150px"
                                    width="150px"
                                    image={noRestaurantsImage}
                                    label="No Restaurants Found"
                                />
                            </CustomStackFullWidth>
                        ) : (
                            <>
                                {restaurants?.map((restaurantData) => (
                                    <Box
                                        key={restaurantData?.id}
                                        id={`restaurent-${restaurantData.id}`}
                                        sx={{
                                            outline:
                                                hoveredMarkerId ===
                                                `restaurent-${restaurantData?.id}`
                                                    ? (theme) =>
                                                          `2px solid ${theme.palette.primary.main}`
                                                    : 'none',
                                            borderRadius: '12px',
                                            transition:
                                                'outline 0.2s ease',
                                            minWidth: { xs: '260px', sm: 0 },
                                            paddingInlineEnd:"1rem"
                                        }}
                                    >
                                        <NewStoreCard
                                            restaurant={{
                                                ...restaurantData,
                                                opening_time:
                                                    restaurantData?.current_opening_time,
                                            }}
                                        />
                                    </Box>
                                ))}
                            </>
                        )}
                    </CustomStackFullWidth>
                </SimpleBar>
            )}
        </CustomStackFullWidth>
    )
}

export default AllNearbyRestaurants
