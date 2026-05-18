import React, { useEffect } from 'react'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomMapSearch from '../join-restaurant/CustomMapSearch'
import GoogleMapComponent from '../landingpage/google-map/GoogleMapComponent'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@mui/styles'
import { Box, Typography, useMediaQuery } from '@mui/material'
import { useGetLocation } from '@/utils/custom-hook/useGetLocation'
import useGetCheckZone from '@/hooks/react-query/zone-list/useGetCheckZone'
import { setLocation } from '@/redux/slices/addressData'
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
    zoneId,
    handleAgreeLocation,
    locationFrom,
    setShowZoneWarning,
    fromStoreRegistration,
    locationCreated,
    inZone
}) => {
    const theme = useTheme()
    const dispatch = useDispatch()

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
        setCurrentLactionValue,
    } = useGetLocation(coords,setInZone)
    let currentLocation = undefined
    if (typeof window !== 'undefined') {
        currentLocation = JSON.parse(localStorage.getItem('currentLatLng'))
        //hostname = window.location.hostnam
    }
 let locationAddress = undefined
    if (typeof window !== 'undefined') {
        locationAddress = localStorage.getItem('location')
    }
    useEffect(() => {
        if (locationCreated?.lat && locationCreated?.lng) {
            setLocations({ lat: locationCreated.lat, lng: locationCreated.lng })
        }
    }, [locationCreated?.lat, locationCreated?.lng])

    // Sync Redux location with currentLocation from localStorage so the
    // useGetLocation hook geocodes the right coordinates and the search
    // box shows the formatted address for the current location.
    useEffect(() => {
        if (currentLocation?.lat && currentLocation?.lng) {
            const sameLocation =
                location?.lat === currentLocation.lat &&
                location?.lng === currentLocation.lng
            if (!sameLocation) {
                dispatch(setLocation(currentLocation))
            }
        }
    }, [currentLocation?.lat, currentLocation?.lng])

    useEffect(() => {
        if (formatted_address) {
            setCurrentLactionValue({ description: formatted_address })
            setSearchKey({ description: formatted_address })
        }
    }, [formatted_address])

    useEffect(() => {
        if (polygonPaths?.length > 0) {
            restaurantAddressHandler(currentLocationValue?.description)
        }

        handleLocation?.(location, true)
    }, [currentLocationValue])

    const successHandler = (res) => {
        setInZone(res)
        if (!res && res !== undefined) {
            setShowZoneWarning?.(true)
        } else {
            setShowZoneWarning?.(false)
        }
    }
    const { data: checkedData, refetch: refetchZone } = useGetCheckZone(
        location,
        zoneId,
        successHandler
    )

console.log({locationAddress});


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
                            currentLocationValue={  currentLocationValue}
                        />
                    )}
                </>
            )}
            {!!location && orderType !== 'take_away' && (
                <Box sx={{ position: 'relative' }}>
                    <GoogleMapComponent
                        fromStoreRegistration={fromStoreRegistration}
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
                        handleAgreeLocation={handleAgreeLocation}
                        inZone={inZone}
                        searchBoxInside={searchBoxInside}
                        searchSlot={
                            orderType !== 'take_away' ? (
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
                            ) : null
                        }
                    />
                </Box>
            )}
        </CustomStackFullWidth>
    )
}

export default MapWithSearch
