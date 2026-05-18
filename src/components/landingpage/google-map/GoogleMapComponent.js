import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GoogleMap, useJsApiLoader, Polygon } from '@react-google-maps/api'
import {
    Box,
    CircularProgress,
    IconButton,
    Stack,
    useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { CustomStackFullWidth } from '../../../styled-components/CustomStyles.style'
import Skeleton from '@mui/material/Skeleton'
import MapMarker from './MapMarker'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import { IconWrapper, brandMapStyles } from './Map.style'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip'
import { t } from 'i18next'
const GoogleMapComponent = ({
    setDisablePickButton,
    setLocationEnabled,
    setLocation,
    setCurrentLocation,
    locationLoading,
    location,
    setPlaceDetailsEnabled,
    placeDetailsEnabled,
    locationEnabled,
    setPlaceDescription,
    height,
    isGps,
    polygonPaths,
    handleAgreeLocation,
    fromStoreRegistration,
    inZone,
    searchSlot,
    searchBoxInside,
}) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const MIN_ZOOM = 1
    const MAX_ZOOM = 21

    const containerRef = useRef(null)
    const center = useMemo(
        () => ({
            lat: parseFloat(location?.lat),
            lng: parseFloat(location?.lng),
        }),
        [location]
    )


    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
    })

    const options = useMemo(
        () => ({
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            disableDefaultUI: true,
            fullscreenControl: false,
            fullscreenControlOptions: {
                position: window?.google?.maps?.ControlPosition?.BOTTOM_RIGHT ?? 9,
            },
        }),
        [isLoaded]
    )
    const [isMounted, setIsMounted] = useState(false)
    const [openInfoWindow, setOpenInfoWindow] = useState(false)
    const [mapSetup, setMapSetup] = useState(false)
    useEffect(() => setIsMounted(true), [])
    const locationRef = useRef(location)
    useEffect(() => {
        locationRef.current = location
    }, [location])
    const isFittingBoundsRef = useRef(false)
    const [map, setMap] = useState(null)
    const [zoom, setZoom] = useState(19)
    const [centerPosition, setCenterPosition] = useState(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerStyle = {
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen
            ? '100vh'
            : height
            ? height
            : isSmall
            ? '350px'
            : '400px',
        borderRadiusTopLeft: isFullscreen ? 0 : '10px',
        borderRadiusTopRight: isFullscreen ? 0 : '10px',
        border: isFullscreen ? 'none' : `1px solid ${theme.palette.neutral[300]}`,
    }

    useEffect(() => {
        setCenterPosition(center)
    }, [center])
    const onLoad = useCallback(function callback(map) {
        const initialZoom = map?.getZoom?.()
        setZoom(typeof initialZoom === 'number' ? initialZoom : 19)
        setMap(map)
    }, [])
    useEffect(() => {
        if (location && placeDetailsEnabled) {
            setCenterPosition(location)
        }
        if (map?.center && mapSetup) {
            setCenterPosition({
                lat: map.center.lat(),
                lng: map.center.lng(),
            })
        }

        setIsMounted(true)
    }, [map, mapSetup, placeDetailsEnabled, location])

    const onUnmount = useCallback(function callback(map) {
        setMap(null)
        // setMapSetup(false)
    }, [])

    const handleZoomIn = () => {
        if (!map) return
        const currentZoom = map.getZoom()
        const baseZoom = typeof currentZoom === 'number' ? currentZoom : zoom
        const nextZoom = Math.min(baseZoom + 1, MAX_ZOOM)
        map.setZoom(nextZoom)
        setZoom(nextZoom)
    }

    const handleZoomOut = () => {
        if (!map) return
        const currentZoom = map.getZoom()
        const baseZoom = typeof currentZoom === 'number' ? currentZoom : zoom
        const nextZoom = Math.max(baseZoom - 1, MIN_ZOOM)
        map.setZoom(nextZoom)
        setZoom(nextZoom)
    }
    useEffect(() => {
        if (
            !map ||
            !polygonPaths?.length ||
            typeof window === "undefined" ||
            !window.google ||
            !window.google.maps
        ) {
            return
        }

        try {
            const bounds = new window.google.maps.LatLngBounds()
            polygonPaths.forEach((path) => {
                if (
                    typeof path?.lat === "number" &&
                    typeof path?.lng === "number"
                ) {
                    bounds.extend(
                        new window.google.maps.LatLng(path.lat, path.lng)
                    )
                }
            })
            if (!bounds.isEmpty()) {
                isFittingBoundsRef.current = true
                map.fitBounds(bounds)
                window.google.maps.event.addListenerOnce(map, 'idle', () => {
                    const fittedZoom = map.getZoom()
                    if (typeof fittedZoom === 'number') {
                        setZoom(fittedZoom)
                    }
                    isFittingBoundsRef.current = false
                })
                const center = bounds.getCenter()
                if (center) {
                    const newCenter = {
                        lat: center.lat(),
                        lng: center.lng(),
                    }

                    const existing = locationRef.current
                    const hasValidLocation =
                        existing &&
                        Number.isFinite(parseFloat(existing.lat)) &&
                        Number.isFinite(parseFloat(existing.lng))

                    if (!hasValidLocation) {
                        setLocation(newCenter)
                        setCenterPosition(newCenter)
                    }
                }
            }
        } catch (error) {
            console.error("Google Maps polygon fit error:", error)
        }
    }, [polygonPaths, map])


    const handleCurrentLocation = () => {
        handleAgreeLocation?.()
    }

    const handleToggleFullscreen = () => {
        if (typeof document === "undefined") {
            return
        }

        const target = containerRef.current
        if (!target) {
            return
        }

        if (!document.fullscreenElement) {
            target.requestFullscreen?.()
        } else {
            document.exitFullscreen?.()
        }
    }

    useEffect(() => {
        if (typeof document === "undefined") {
            return
        }

        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement === containerRef.current)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            )
        }
    }, [])

    return isLoaded ? (
        <CustomStackFullWidth
            position="relative"
            className="map"
            ref={containerRef}
        >
            {searchSlot && (searchBoxInside || isFullscreen) && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: isFullscreen ? '20px' : '12px',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        px: { xs: '10px', md: '20px' },
                    }}
                >
                    {searchSlot}
                </Box>
            )}
            <Stack
                position="absolute"
                zIndex={10}
                right="15px"
                bottom={isGps ? '8%' : '6%'}
                direction="column"
                spacing={1}
            >
                
               
                <IconWrapper
                    sx={{ borderRadius: "5px" }}
                    padding={{ xs: '2px', sm: '4px' }}
                    onClick={handleToggleFullscreen}
                    size="small"
                >
                    {isFullscreen ? (
                        <CloseFullscreenIcon
                         
                            sx={{ fontSize: 20 }}
                        />
                    ) : (
                        <OpenInFullIcon
                           
                            sx={{ fontSize: 20 }}
                        />
                    )}
                </IconWrapper>
                <IconWrapper
                    sx={{ borderRadius: "5px" }}
                    padding={{ xs: '2px', sm: '4px' }}
                    onClick={handleCurrentLocation}
                    size="small"
                >
                    <GpsFixedIcon color="primary" sx={{ fontSize: 20 }} />
                </IconWrapper>
                 <Stack sx={{ backgroundColor: theme => theme.palette.neutral[100],borderRadius: "5px" }}>
                    <IconWrapper
                        sx={{ borderRadius: "5px" }}
                        padding={{ xs: '2px', sm: '4px' }}
                        onClick={handleZoomIn}
                        disabled={zoom >= MAX_ZOOM}
                        size="small"
                    >
                        <AddIcon  sx={{ fontSize: 20 }} />
                    </IconWrapper>
                    <IconWrapper
                        sx={{ borderRadius: "5px" }}
                        padding={{ xs: '2px', sm: '4px' }}
                        onClick={handleZoomOut}
                        disabled={zoom <= MIN_ZOOM}
                        size="small"
                    >
                        <RemoveIcon  sx={{ fontSize: 20 }} />
                    </IconWrapper>
                </Stack>
            </Stack>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={centerPosition}
                onLoad={onLoad}
                zoom={zoom}
                onUnmount={onUnmount}
                onMouseDown={(e) => {
                    setMapSetup(true)
                    setDisablePickButton?.(true)
                }}
                onMouseUp={(e) => {
                    setMapSetup(false)
                    setDisablePickButton?.(false)
                    setLocationEnabled(true)
                    setLocation({
                        lat: map?.center?.lat(),
                        lng: map?.center?.lng(),
                    })
                    setCenterPosition({
                        lat: map?.center?.lat(),
                        lng: map?.center?.lng(),
                    })
                    setPlaceDetailsEnabled(false)
                    setPlaceDescription(undefined)
                }}
                onZoomChanged={() => {
                    if (map) {
                        const nextZoom = map.getZoom()
                        if (typeof nextZoom === 'number') {
                            setZoom(nextZoom)
                        }
                        if (isFittingBoundsRef.current) return
                        setLocationEnabled(true)
                        setLocation({
                            lat: map.center.lat(),
                            lng: map.center.lng(),
                        })
                        setCenterPosition({
                            lat: map.center.lat(),
                            lng: map.center.lng(),
                        })
                    }
                }}
                options={{ ...options, styles: brandMapStyles }}
                onClick={(e) => {
                    if (fromStoreRegistration) {
                        setLocation({
                            lat: e.latLng.lat(),
                            lng: e.latLng.lng(),
                        })
                        setCenterPosition({
                            lat: e.latLng.lat(),
                            lng: e.latLng.lng(),
                        })
                        setLocationEnabled(true)
                    }
                }}
            >
                {polygonPaths?.length > 0 && (
                    <Polygon
                        paths={polygonPaths}
                        onClick={(e) => {
                            if (fromStoreRegistration) {
                                setLocation({
                                    lat: e.latLng.lat(),
                                    lng: e.latLng.lng(),
                                })
                                setCenterPosition({
                                    lat: e.latLng.lat(),
                                    lng: e.latLng.lng(),
                                })
                                setLocationEnabled(true)
                            }
                        }}
                        options={{
                            fillColor: 'blue',
                            fillOpacity: 0.3,
                            strokeColor: theme.palette.error.main,
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                        }}
                    />
                )}
                {!locationLoading ? (
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
                        <MapMarker width="60px" height="70px" />
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
            </GoogleMap>
            {inZone === false && (
                <Box
                    sx={{
                        position: 'absolute',
                        left: '50%',
                        bottom: '12px',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        backgroundColor: theme.palette.neutral[1000],
                        color: theme.palette.neutral[100],
                        fontSize: { xs: '10px', sm: '13px' },
                        fontWeight: 500,
                        px: 2,
                        py: 1,
                        borderRadius: '6px',
                        textAlign: 'center',
                        width: '100%',
                        maxWidth: '400px',
                        textTransform: 'none',
                    }}
                >
                    <PrivacyTipIcon
                        sx={{
                            fontSize: { xs: '14px', sm: '18px' },
                            verticalAlign: 'middle',
                            mr: 1,
                            color: theme.palette.primary.main,
                        }}
                    />
                    {t('Please place the marker inside the available zones.')}
                </Box>
            )}
        </CustomStackFullWidth>
    ) : (
        <CustomStackFullWidth
            alignItems="center"
            justifyContent="center"
            sx={{
                minHeight: '400px',
                [theme.breakpoints.down('sm')]: {
                    minHeight: '250px',
                },
            }}
        >
            <Skeleton
                width="100%"
                height="100%"
                variant="rectangular"
                animation="wave"
            />
        </CustomStackFullWidth>
    )
}

export default GoogleMapComponent
