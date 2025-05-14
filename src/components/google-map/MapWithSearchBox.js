import React, { useEffect } from 'react'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomMapSearch from '../join-restaurant/CustomMapSearch'
import GoogleMapComponent from '../landingpage/google-map/GoogleMapComponent'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@mui/styles'
import { Box, useMediaQuery } from '@mui/material'
import { useGetLocation } from '@/utils/custom-hook/useGetLocation'
import useGetCheckZone from '@/hooks/react-query/zone-list/useGetCheckZone'
import toast from 'react-hot-toast'

const MapWithSearch = ({
    orderType,
    searchBoxInside = false,
    padding,
    coords,
    mapHeight,
    heightFromStore,
    rerenderMap,
    isGps,
    polygonPaths,
    handleLocation,
    restaurantAddressHandler,
                           setInZone,
                           zoneId
}) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const { global } = useSelector((state) => state.globalSettings)
    const { location, formatted_address } = useSelector(
        (state) => state.addressData
    )

    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const {
        setDisablePickButton,
        locationEnabled,
        setLocationEnabled,
        searchKey,
        setSearchKey,
        setEnabled,
        placeDetailsEnabled,
        setPlaceDetailsEnabled,
        placeDescription,
        setPlaceDescription,
        predictions,
        setPlaceId,
        setLocations,
        isLoadingPlacesApi,
        currentLocationValue,
    } = useGetLocation(coords)
    let currentLocation = undefined
    if (typeof window !== 'undefined') {
        currentLocation = JSON.parse(localStorage.getItem('currentLatLng'))
        //hostname = window.location.hostnam
    }
    useEffect(() => {
        if (polygonPaths?.length > 0) {
            restaurantAddressHandler(currentLocationValue?.description)
        } else {
        }

        handleLocation?.(location)
    }, [currentLocationValue])

    const successHandler = (res) => {
        setInZone(res);
        if (!res) {
            toast.error("Out Of The Zone");
        }
    };
    const { data: checkedData } = useGetCheckZone(
        location,
        zoneId,
        successHandler
    );
    
    return (
        <CustomStackFullWidth spacing={1} gap="12px">
            {!searchBoxInside && (
                <>
                    {orderType !== 'take_away' && (
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
                    )}
                </>
            )}
            {!!location && orderType !== 'take_away' && (
                <Box sx={{ position: 'relative' }}>
                    {searchBoxInside && (
                        <Box
                            sx={{
                                position: 'absolute',
                                width: '100%',
                                mt: 2,
                                zIndex: 1000,
                                pl: {
                                    xs: '10px',
                                    md: '230px',
                                },
                                pr: '10px',
                            }}
                        >
                            {orderType !== 'take_away' && (
                                <CustomMapSearch
                                    setSearchKey={setSearchKey}
                                    setEnabled={setEnabled}
                                    predictions={predictions}
                                    setPlaceId={setPlaceId}
                                    setPlaceDetailsEnabled={
                                        setPlaceDetailsEnabled
                                    }
                                    setPlaceDescription={setPlaceDescription}
                                    border={theme.palette.primary.main}
                                    searchKey={searchKey}
                                    placeDescription={placeDescription}
                                    isLoadingPlacesApi={isLoadingPlacesApi}
                                    currentLocationValue={currentLocationValue}
                                />
                            )}
                        </Box>
                    )}
                    <GoogleMapComponent
                        key={rerenderMap}
                        setLocation={setLocations}
                        location={location}
                        setPlaceDetailsEnabled={setPlaceDetailsEnabled}
                        placeDetailsEnabled={placeDetailsEnabled}
                        locationEnabled={locationEnabled}
                        setPlaceDescription={setPlaceDescription}
                        setLocationEnabled={setLocationEnabled}
                        setDisablePickButton={setDisablePickButton}
                        height={
                            isSmall
                                ? mapHeight
                                : heightFromStore
                                ? heightFromStore
                                : '448px'
                        }
                        isGps={isGps}
                        polygonPaths={polygonPaths}
                    />
                </Box>
            )}
        </CustomStackFullWidth>
    )
}

export default MapWithSearch
