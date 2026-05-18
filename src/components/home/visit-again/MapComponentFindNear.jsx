import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    InfoWindow,
} from '@react-google-maps/api'
import {
    Box,
    CircularProgress,
    Divider,
    IconButton,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import { Stack } from '@mui/material'
import { t } from 'i18next'
import { grayscaleMapStyles } from '@/components/landingpage/google-map/Map.style'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useGeolocated } from 'react-geolocated'
import { useGetLocation } from '@/utils/custom-hook/useGetLocation'
import CustomMapSearch from '@/components/join-restaurant/CustomMapSearch'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import { useDispatch, useSelector } from 'react-redux'
import { setLocation } from '@/redux/slices/addressData'
import CustomImageContainer from '@/components/CustomImageContainer'

const containerStyle = {
    width: '100%',
    height: '250px',
}

const MapComponentFindNear = ({
    latitude,
    longitude,
    data,
    handleRouteToRestaurant,
    customMapStyle,
    hoveredMarkerId,
    setHoveredMarkerId,
}) => {
    const [map, setMap] = useState(null)
    const [zoom, setZoom] = useState(10)
    const [openUserMsg, setOpenUserMsg] = useState(false)
    const fitBoundsTimeoutRef = useRef(null)
    const hoverCloseTimeoutRef = useRef(null)

    const cancelHoverClose = useCallback(() => {
        if (hoverCloseTimeoutRef.current) {
            clearTimeout(hoverCloseTimeoutRef.current)
            hoverCloseTimeoutRef.current = null
        }
    }, [])

    const scheduleHoverClose = useCallback(() => {
        cancelHoverClose()
        hoverCloseTimeoutRef.current = setTimeout(() => {
            setHoveredMarkerId(null)
        }, 180)
    }, [cancelHoverClose, setHoveredMarkerId])

    const openMarkerHover = useCallback(
        (id) => {
            cancelHoverClose()
            setOpenUserMsg(false)
            setHoveredMarkerId((prev) =>
                prev === `restaurent-${id}` ? prev : `restaurent-${id}`
            )
        },
        [cancelHoverClose, setHoveredMarkerId]
    )

    useEffect(() => () => cancelHoverClose(), [cancelHoverClose])
    const dispatch = useDispatch()
    const theme = useTheme()
    const { location } = useSelector((state) => state.addressData)
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    // const [hoveredMarkerId, setHoveredMarkerId] = useState("")
    const [userLocation, setUserLocation] = useState({
        lat: location?.lat,
        lng: location?.lng,
    })
    const {
        searchKey,
        setSearchKey,
        setEnabled,
        setPlaceDetailsEnabled,
        placeDescription,
        setPlaceDescription,
        predictions,
        setPlaceId,
        isLoadingPlacesApi,
        currentLocationValue,
    } = useGetLocation()

    const { coords } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: false,
        },
        userDecisionTimeout: 5000,
        isGeolocationEnabled: true,
    })
    const applyUserLocation = useCallback(
        (lat, lng) => {
            const next = { lat, lng }
            setUserLocation(next)
            dispatch(setLocation(next))
            if (map) {
                map.panTo(next)
                map.setZoom(15)
            }
        },
        [map, dispatch]
    )

    const handleAgreeLocation = () => {
        if (coords?.latitude && coords?.longitude) {
            applyUserLocation(coords.latitude, coords.longitude)
            return
        }
        if (typeof window !== 'undefined' && navigator?.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    applyUserLocation(
                        position.coords.latitude,
                        position.coords.longitude
                    )
                },
                (error) => {
                    console.error('Geolocation error:', error)
                },
                { enableHighAccuracy: false, timeout: 8000 }
            )
        }
    }


    const center = {
        lat: parseFloat(userLocation?.lat),
        lng: parseFloat(userLocation?.lng),
    }
    useEffect(() => {
        if (!map) return
        if (!Number.isFinite(center.lat) || !Number.isFinite(center.lng)) return
        map.panTo(center)
    }, [map, center.lat, center.lng])
    const options = useMemo(
        () => ({
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
        }),
        []
    )
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
    })

    const onLoad = useCallback(function callback(map) {
        setZoom(10)
        setMap(map)
    }, [])

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
    }, [])

    const handleZoomIn = () => {
        if (map && zoom < 21) {
            setZoom((prevZoom) => Math.min(prevZoom + 1, 21))
        }
    }

    const handleZoomOut = () => {
        if (map && zoom > 1) {
            setZoom((prevZoom) => Math.max(prevZoom - 1, 1))
        }
    }

    const handleZoomChanged = useCallback(() => {
        if (!map) return
        const nextZoom = map.getZoom()
        if (typeof nextZoom === 'number') setZoom(nextZoom)
    }, [map])

    const restaurantPositions = useMemo(() => {
        if (!Array.isArray(data)) return []
        return data
            .map((restaurant) => {
                const lat = Number.parseFloat(restaurant?.latitude)
                const lng = Number.parseFloat(restaurant?.longitude)
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
                return { lat, lng }
            })
            .filter(Boolean)
    }, [data])

    useEffect(() => {
        if (!map) return
        if (!restaurantPositions?.length) return
        if (typeof window === 'undefined' || !window.google?.maps) return

        if (fitBoundsTimeoutRef.current) {
            clearTimeout(fitBoundsTimeoutRef.current)
        }

        fitBoundsTimeoutRef.current = setTimeout(() => {
            if (restaurantPositions.length === 1) {
                const [position] = restaurantPositions
                map.panTo(position)
                map.setZoom(Math.max(map.getZoom() ?? 0, 15))
                return
            }

            const bounds = new window.google.maps.LatLngBounds()
            restaurantPositions.forEach((position) => bounds.extend(position))
            map.fitBounds(bounds, 80)
        }, 250)

        return () => {
            if (fitBoundsTimeoutRef.current) {
                clearTimeout(fitBoundsTimeoutRef.current)
            }
        }
    }, [map, restaurantPositions])

    const handleSearchLocation = (lat, lng) => {
        setUserLocation({ lat, lng })
    }
    useEffect(() => {
        if (
            Number.isFinite(parseFloat(location?.lat)) &&
            Number.isFinite(parseFloat(location?.lng))
        ) {
            setUserLocation({ lat: location.lat, lng: location.lng })
        }
    }, [location])

    useEffect(() => {
        if (
            Number.isFinite(parseFloat(latitude)) &&
            Number.isFinite(parseFloat(longitude))
        ) {
            dispatch(setLocation({ lat: latitude, lng: longitude }))
        }
    }, [latitude, longitude])

    useEffect(() => {
        if (
            !Number.isFinite(parseFloat(userLocation?.lat)) &&
            coords?.latitude &&
            coords?.longitude
        ) {
            applyUserLocation(coords.latitude, coords.longitude)
        }
    }, [coords, userLocation, applyUserLocation])

    const clickOnResIcon = (id) => {
        setHoveredMarkerId(`restaurent-${id}`)
        if (openUserMsg) {
            setOpenUserMsg(false)
        }
    }
    const clickOnUserIcon = () => {
        setOpenUserMsg(!openUserMsg)
        setHoveredMarkerId(null)
    }
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
                        borderRadius: '50%',
                    }}
                >
                    <IconButton onClick={handleAgreeLocation}>
                        <GpsFixedIcon color="primary" />
                    </IconButton>
                </Stack>
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
            <CustomStackFullWidth
                position="absolute"
                zIndex={1}
                top={isXSmall ? '50px' : '20px'}
                paddingInline="20px"
                spacing={1}
            >
                <CustomMapSearch
                    setSearchKey={setSearchKey}
                    setEnabled={setEnabled}
                    predictions={predictions}
                    setPlaceId={setPlaceId}
                    setPlaceDetailsEnabled={setPlaceDetailsEnabled}
                    setPlaceDescription={setPlaceDescription}
                    border={theme.palette.primary.main}
                    searchKey={searchKey}
                    placeDescription={placeDescription}
                    isLoadingPlacesApi={isLoadingPlacesApi}
                    currentLocationValue={currentLocationValue}
                />
            </CustomStackFullWidth>
            <GoogleMap
                mapContainerStyle={
                    customMapStyle ? customMapStyle : containerStyle
                }
                center={center}
                onLoad={onLoad}
                zoom={zoom}
                onUnmount={onUnmount}
                onZoomChanged={handleZoomChanged}
                options={{
                    ...options,
                    styles: grayscaleMapStyles,
                }}
            >
                {Number.isFinite(center.lat) && Number.isFinite(center.lng) && (
                <Marker
                    key={`user`}
                    position={center}
                    icon={{
                        url: '/static/location-pins/customer_location_icon.svg',
                        scaledSize: new window.google.maps.Size(55, 55),
                        anchor: new window.google.maps.Point(27, 55),
                    }}
                    zIndex={999}
                    onClick={clickOnUserIcon}
                >
                    {openUserMsg && (
                        <InfoWindow
                            position={{
                                lat: parseFloat(userLocation?.lat),
                                lng: parseFloat(userLocation?.lng),
                            }}
                            options={{
                                pixelOffset: new window.google.maps.Size(0, -30),
                                disableAutoPan: true,
                            }}
                        >
                            <Box
                                sx={{
                                    color: theme.palette.neutral[800],
                                    svg: { color: theme.palette.primary.main },
                                }}
                            >
                                <Box
                                    width="0"
                                    flexGrow="1"
                                    sx={{ cursor: 'pointer' }}
                                ></Box>
                                <Stack direction="row" gap={1} mb={1}>
                                    <Box
                                        width="0"
                                        flexGrow="1"
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <Typography fontSize="12px ">
                                            {t('We will deliver here')}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </InfoWindow>
                    )}
                </Marker>
                )}
                {data?.length > 0 ? (
                    data.map((restaurant) => (
                        <Marker
                            key={restaurant?.id}
                            position={{
                                lat: parseFloat(restaurant.latitude),
                                lng: parseFloat(restaurant.longitude),
                            }}
                            icon={{
                                url: "/static/location-pins/restaurant_location_icon.svg",
                                scaledSize:
                                    hoveredMarkerId === `restaurent-${restaurant.id}`
                                        ? new window.google.maps.Size(60, 60)
                                        : new window.google.maps.Size(45, 45),
                            }}
                            onClick={() => clickOnResIcon(restaurant.id)}
                            onMouseOver={() => openMarkerHover(restaurant.id)}
                            onMouseOut={scheduleHoverClose}
                        >
                            {hoveredMarkerId === `restaurent-${restaurant.id}` && (
                                <InfoWindow
                                    key={`info-${restaurant.id}`}
                                    position={{
                                        lat: parseFloat(restaurant.latitude),
                                        lng: parseFloat(restaurant.longitude),
                                    }}
                                    options={{
                                        pixelOffset: new window.google.maps.Size(0, -30),
                                        disableAutoPan: true,
                                    }}
                                    onCloseClick={() => setHoveredMarkerId(null)}
                                >
                                    <Box
                                        sx={{
                                            color: theme.palette.neutral[800],
                                            svg: { color: theme.palette.primary.main },
                                            cursor: 'pointer',
                                            minWidth: '220px',
                                            maxWidth: '280px',
                                        }}
                                        onMouseEnter={cancelHoverClose}
                                        onMouseLeave={scheduleHoverClose}
                                        onClick={() => handleRouteToRestaurant(restaurant)}
                                    >
                                        <Stack direction="row" gap={1} mb={1} alignItems="center">
                                            <CustomImageContainer
                                                width="20px"
                                                height="20px"
                                                borderRadius="50%"
                                                src={restaurant?.logo_full_url}
                                                objectfit="cover"
                                            />
                                            <Box sx={{ flex: 1, minWidth: 0, fontWeight: 600 }}>
                                                {restaurant.name}{" "}
                                                {Number.isFinite(restaurant?.distance) && (
                                                    <Box component="small" color="primary.main">
                                                        ({(restaurant.distance / 1000).toFixed(2)} km {t("away")})
                                                    </Box>
                                                )}
                                            </Box>
                                        </Stack>
                                        <Box sx={{ fontSize: '0.75rem', color: theme.palette.neutral[600] }}>
                                            {restaurant.address}
                                        </Box>
                                    </Box>
                                </InfoWindow>
                            )}
                        </Marker>
                    ))
                ) : (
                    <Stack
                        alignItems="center"
                        style={{
                            zIndex: 3,
                            position: "absolute",
                            marginTop: -37,
                            marginLeft: -11,
                            left: "50%",
                            top: "50%",
                        }}
                    >
                        <CircularProgress />
                    </Stack>
                )}
            </GoogleMap>
        </CustomStackFullWidth>
    ) : (
        <CircularProgress />
    )
}

export default MapComponentFindNear
