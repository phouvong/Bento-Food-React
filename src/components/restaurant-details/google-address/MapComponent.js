import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    MarkerF,
    InfoWindowF,
    OverlayView,
} from '@react-google-maps/api'
import {
    Box,
    CircularProgress,
    Divider,
    IconButton,
    useTheme,
} from '@mui/material'
import { Stack } from '@mui/material'
import { t } from 'i18next'
import { grayscaleMapStyles } from '@/components/landingpage/google-map/Map.style'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MapMarker from '@/components/landingpage/google-map/MapMarker'
import RestaurantMarker from '@/components/restaurant-details/RestaurantMarker'
import LatestRestaurantCard from '@/components/restaurant-details/LatestRestaurantCard'

const containerStyle = {
    width: '100%',
    height: '250px',
}

const MapComponent = ({
    latitude,
    longitude,
    data,
    handleRouteToRestaurant,
    customMapStyle,
    resLat,
    resLong,
    isRestaurant,
    userLong,
    userLat,
    order_details,
    tempDistance,
}) => {
    const theme = useTheme()
    const [directionsResponse, setDirectionsResponse] = useState(null)

    const center = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
    }
    const center1 = {
        lat: parseFloat(userLat),
        lng: parseFloat(userLong),
    }

    const options = useMemo(
        () => ({
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
        }),
        []
    )
    const [isMounted, setIsMounted] = useState(false)

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
    })

    const [map, setMap] = useState(null)
    const [zoom, setZoom] = useState(15)
    const [hoveredMarkerId, setHoveredMarkerId] = useState(null)

    const onLoad = useCallback(function callback(map) {
        setZoom(isRestaurant ? 6 : 15)
        setMap(map)
    }, [])

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
    }, [])

    useEffect(() => {
        if (map) {
            setIsMounted(true)
        }
    }, [map])

    const handleZoomIn = () => {
        if (map && zoom <= 21) {
            setZoom((prevZoom) => Math.min(prevZoom + 1))
        }
    }

    const handleZoomOut = () => {
        if (map && zoom >= 1) {
            setZoom((prevZoom) => Math.max(prevZoom - 1))
        }
    }

    const directionRoute = async () => {
        if (window.google && window.google.maps) {
            const directionsService = new google.maps.DirectionsService();
            const results = await directionsService.route({
                origin: center,
                destination: center1,
                travelMode: google.maps.TravelMode.DRIVING,
            })
            setDirectionsResponse(results)
        }
    }
    useEffect(() => {
        if (userLong) {
            directionRoute()
        }
    }, [userLong, userLat, latitude, longitude])
    return isLoaded ? (
        <CustomStackFullWidth position="relative" className="map">
            <Stack
                position="absolute"
                zIndex={1}
                bottom="20px"
                left="20px"
                direction="column"
                spacing={1}
            >
                <Stack
                    sx={{
                        backgroundColor: theme.palette.neutral[1800],
                        borderRadius: '8px',
                    }}
                >
                    <IconButton onClick={handleZoomIn}>
                        <AddIcon sx={{ color: theme.palette.neutral[1000] }} />
                    </IconButton>
                    <Divider
                        variant="middle"
                        sx={{ backgroundColor: 'red', marginInline: '8px' }}
                    />
                    <IconButton onClick={handleZoomOut}>
                        <RemoveIcon
                            sx={{ color: theme.palette.neutral[1000] }}
                        />
                    </IconButton>
                </Stack>
            </Stack>
            {order_details && (
                <Stack
                    position="absolute"
                    zIndex={1}
                    bottom="20px"
                    right="20px"
                    direction="column"
                    spacing={1}
                >
                    <LatestRestaurantCard
                        id={data[0]?.id}
                        image={data[0]?.cover_photo_full_url}
                        logo={data[0]?.logo_full_url}
                        name={data[0]?.name}
                        restaurantImageUrl={global?.base_urls}
                        restaurantDiscount={
                            data[0]?.discount && data[0]?.discount
                        }
                        delivery_fee={data[0]?.delivery_fee}
                        open={data[0]?.open}
                        active={data[0]?.active}
                        delivery_time={data[0]?.delivery_time}
                        discount={data[0]?.discount}
                        characteristics={data[0]?.characteristics}
                        coupons={data[0]?.coupons}
                        slug={data[0]?.slug}
                        zone_id={data[0]?.zone_id}
                        distance={tempDistance}
                        foods_count={data[0]?.foods}
                        order_details={order_details}
                    />
                </Stack>
            )}
            <GoogleMap
                mapContainerStyle={
                    customMapStyle ? customMapStyle : containerStyle
                }
                center={center}
                onLoad={onLoad}
                zoom={zoom}
                onUnmount={onUnmount}
                options={{ ...options, styles: grayscaleMapStyles }}
            >
                {data?.length > 0 ? (
                    <>
                        {data?.map((restaurant) => (
                            <MarkerF
                                key={`${name}-${parseFloat(
                                    latitude
                                )}-${parseFloat(longitude)}
                    `}
                                position={{
                                    lat: parseFloat(restaurant?.latitude),
                                    lng: parseFloat(restaurant?.longitude),
                                }}
                                icon={{
                                    url: 'static/location-pins/restaurant_location_icon.svg',
                                    scale: 7,
                                }}
                                onClick={() =>
                                    setHoveredMarkerId(restaurant?.id)
                                }
                            >
                                {hoveredMarkerId === restaurant?.id && (
                                    <InfoWindowF
                                        position={{
                                            lat: parseFloat(
                                                restaurant?.latitude
                                            ),
                                            lng: parseFloat(
                                                restaurant?.longitude
                                            ),
                                        }}
                                        pixelOffset={
                                            new window.google.maps.Size(0, -30)
                                        }
                                    >
                                        <Box
                                            sx={{
                                                color: theme.palette
                                                    .neutral[800],
                                                svg: {
                                                    color: theme.palette.primary
                                                        .main,
                                                },
                                            }}
                                            onClick={() =>
                                                handleRouteToRestaurant(
                                                    restaurant
                                                )
                                            }
                                        >
                                            <Stack
                                                direction="row"
                                                gap={1}
                                                mb={1}
                                            >
                                                <Box
                                                    width="0"
                                                    flexGrow="1"
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    {restaurant?.name}{' '}
                                                    <Box
                                                        component="small"
                                                        color="primary.main"
                                                    >
                                                        (
                                                        {(
                                                            tempDistance / 1000
                                                        ).toFixed(2)}
                                                        km {t('away')})
                                                    </Box>
                                                </Box>
                                            </Stack>
                                            <Stack
                                                direction="row"
                                                gap={1}
                                                fontSize="0.75rem"
                                            >
                                                <Box width="0" flexGrow="1">
                                                    {restaurant?.address}
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </InfoWindowF>
                                )}
                            </MarkerF>
                        ))}
                    </>
                ) : (
                    <>
                        {' '}
                        {isMounted ? (
                            <Stack
                                style={{
                                    zIndex: 3,
                                    position: 'absolute',
                                    marginTop: -63,
                                    marginLeft: -32,
                                    left: '50%',
                                    top: '50%',
                                }}
                            >
                                <>
                                    {isRestaurant ? (
                                        <>
                                            {directionsResponse && (
                                                <>
                                                    <OverlayView
                                                        position={{
                                                            lat: directionsResponse.routes[0].legs[0].start_location.lat(),
                                                            lng: directionsResponse.routes[0].legs[0].start_location.lng(),
                                                        }}
                                                        mapPaneName={
                                                            OverlayView.OVERLAY_MOUSE_TARGET
                                                        }
                                                        getPixelPositionOffset={(
                                                            width,
                                                            height
                                                        ) => ({
                                                            x: -width / 3,
                                                            y: -height / 1.5,
                                                        })}
                                                    >
                                                        <RestaurantMarker
                                                            width="60px"
                                                            height="70px"
                                                        />
                                                    </OverlayView>
                                                    <OverlayView
                                                        position={{
                                                            lat: directionsResponse.routes[0].legs[0].end_location.lat(),
                                                            lng: directionsResponse.routes[0].legs[0].end_location.lng(),
                                                        }}
                                                        mapPaneName={
                                                            OverlayView.OVERLAY_MOUSE_TARGET
                                                        }
                                                        getPixelPositionOffset={(
                                                            width,
                                                            height
                                                        ) => ({
                                                            x: -width / 2,
                                                            y: -height / 1.5,
                                                        })}
                                                    >
                                                        <MapMarker
                                                            width="60px"
                                                            height="70px"
                                                        />
                                                    </OverlayView>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        // <Marker position={{ lat: latitude, lng: longitude }}>
                                        //     <RestaurantMarker width="60px" height="70px"  />
                                        // </Marker>
                                        <Marker
                                            position={{
                                                lat: latitude,
                                                lng: longitude,
                                            }}
                                        >
                                            <MapMarker
                                                width="60px"
                                                height="70px"
                                            />
                                        </Marker>
                                    )}
                                </>
                            </Stack>
                        ) : (
                            <Stack
                                alignItems="center"
                                style={{
                                    zIndex: 3,
                                    position: 'absolute',
                                    marginTop: -37,
                                    marginLeft: -11,
                                    left: '50%',
                                    top: '50%',
                                }}
                            >
                                <CircularProgress />
                            </Stack>
                        )}
                    </>
                )}
            </GoogleMap>
        </CustomStackFullWidth>
    ) : (
        <CircularProgress />
    )
}

export default MapComponent
