import React, { useState } from 'react'
import MapComponent from '@/components/restaurant-details/google-address/MapComponent'
import { IconButton, Stack } from '@mui/material'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import { useTheme } from '@mui/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const ResMapSection = ({ userLocation, details, setUserLocation, coords }) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const [rerenderMap, setRerenderMap] = useState(false)
    const handleCurrentLocation = () => {
        if (coords) {
            setUserLocation({ lat: coords?.latitude, lng: coords?.longitude })
        }
        setRerenderMap((prvMap) => !prvMap)
    }
    const customMapStyle = {
        width: '100%',
        height: isSmall ? '250px' : '300px',
    }
    return (
        <div>
            <Stack position="relative">
                <MapComponent
                    customMapStyle={customMapStyle}
                    key={rerenderMap}
                    userLat={userLocation?.lat}
                    userLong={userLocation?.lng}
                    latitude={details?.latitude}
                    longitude={details?.longitude}
                    isRestaurant
                />
                <IconButton
                    sx={{
                        background: (theme) => theme.palette.neutral[100],
                        padding: '10px',
                        position: 'absolute',

                        right: '10px',
                        bottom: '20px',
                    }}
                    onClick={handleCurrentLocation}
                >
                    <GpsFixedIcon color="primary" />
                </IconButton>
            </Stack>
        </div>
    )
}

export default ResMapSection
