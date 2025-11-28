import React, { useEffect, useState } from 'react'
import CustomTextFieldWithFormik from '../form-fields/CustomTextFieldWithFormik'
import { useTranslation } from 'react-i18next'
import CustomSelectWithFormik from '../custom-select/CustomSelectWithFormik'
import { Grid } from '@mui/material'
import GoogleMapComponent from '../landingpage/google-map/GoogleMapComponent'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { useGeolocated } from 'react-geolocated'
import useGetAutocompletePlace from '@/hooks/react-query/google-api/usePlaceAutoComplete'
import useGetZoneId from '@/hooks/react-query/google-api/useGetZone'
import useGetPlaceDetails from '@/hooks/react-query/google-api/useGetPlaceDetails'
import useGetCheckZone from '@/hooks/react-query/google-api/useGetCheckZone'
import useGetGeoCode from '@/hooks/react-query/google-api/useGetGeoCode'
import CustomMapSearch from '../join-restaurant/CustomMapSearch'

const MapForRestaurantJoin = ({
    RestaurantJoinFormik,
    latHandler,
    lngHandler,
    handleLocation,
    zoneId,
    zoneHandler,
    polygonPaths,
    inZoom,
    restaurantAddressHandler,
    setInZone,
    configData,
}) => {
    // const { configData } = useSelector((state) => state.configData)
    const [locationEnabled, setLocationEnabled] = useState(false)
    const [location, setLocation] = useState(
        configData && configData?.default_location
    )
    const [searchKey, setSearchKey] = useState('')
    const [enabled, setEnabled] = useState(false)
    const [placeDetailsEnabled, setPlaceDetailsEnabled] = useState(true)
    const [placeDescription, setPlaceDescription] = useState(undefined)
    const [predictions, setPredictions] = useState([])
    const [placeId, setPlaceId] = useState('')
    const { t } = useTranslation()
    useEffect(() => {
        setLocation({
            lat: configData?.default_location?.lat,
            lng: configData?.default_location?.lng,
        })
    }, [configData?.default_location])
    const {
        coords,
        isGeolocationAvailable,
        isGeolocationEnabled,
        getPosition,
    } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: false,
        },
        userDecisionTimeout: 5000,
        isGeolocationEnabled: true,
    })

    const { data: places, isLoading } = useGetAutocompletePlace(
        searchKey,
        enabled
    )

    useEffect(() => {
        if (places) {
            setPredictions(places?.predictions)
        }
    }, [places])
    const zoneIdEnabled = locationEnabled
    const { data: zoneData } = useGetZoneId(location, zoneIdEnabled)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (zoneData) {
                // dispatch(setZoneData(zoneData?.data?.zone_data));
                localStorage.setItem('zoneid', zoneData?.zone_id)
            }
        }
    }, [zoneData])
    const { isLoading: isLoading2, data: placeDetails } = useGetPlaceDetails(
        placeId,
        placeDetailsEnabled
    )
    //

    useEffect(() => {
        if (placeDetails) {
            setLocation(placeDetails?.result?.geometry?.location)
            setLocationEnabled(true)
        }
    }, [placeDetails])
    const successHandler = (res) => {
        setInZone(res)
        if (!res && res !== undefined) {
            toast.error('Out Of The Zone')
        }
    }
    const { data: checkedData } = useGetCheckZone(
        location,
        zoneId,
        successHandler
    )
    const { data: geoCodeResults, isFetching: isFetchingGeoCodes } =
        useGetGeoCode(location)
    useEffect(() => {
        if (polygonPaths?.length > 0) {
            restaurantAddressHandler(
                geoCodeResults?.results[0]?.formatted_address
            )
        } else {
        }

        handleLocation(location)
    }, [geoCodeResults])

    const HandleChangeForSearch = (event) => {
        if (event.target.value) {
            setSearchKey(event.target.value)
            setEnabled(true)
            setPlaceDetailsEnabled(true)
        }
    }
    const handleChange = (event, value) => {
        if (value) {
            setPlaceId(value?.place_id)
        }
        setPlaceDetailsEnabled(true)
    }
    const handleCloseLocation = () => {
        setPredictions([])
    }
    return (
        <CustomStackFullWidth>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <CustomStackFullWidth sx={{ position: 'relative' }}>
                        <CustomStackFullWidth
                            sx={{
                                right: '10px',
                                position: 'absolute',
                                zIndex: 999,
                                maxWidth: '250px',
                                top: '10px',
                            }}
                        >
                            <CustomMapSearch
                                newMap
                                handleCloseLocation={handleCloseLocation}
                                frommap="false"
                                setSearchKey={setSearchKey}
                                setEnabled={setEnabled}
                                predictions={predictions}
                                setPlaceId={setPlaceId}
                                setPlaceDetailsEnabled={setPlaceDetailsEnabled}
                                setPlaceDescription={setPlaceDescription}
                                HandleChangeForSearch={HandleChangeForSearch}
                                handleChange={handleChange}
                            />
                        </CustomStackFullWidth>
                        <GoogleMapComponent
                            setLocation={setLocation}
                            location={location}
                            setPlaceDetailsEnabled={setPlaceDetailsEnabled}
                            placeDetailsEnabled={placeDetailsEnabled}
                            locationEnabled={locationEnabled}
                            setPlaceDescription={setPlaceDescription}
                            setLocationEnabled={setLocationEnabled}
                            height="250px"
                            polygonPaths={polygonPaths}
                            inZoom={inZoom}
                        />
                    </CustomStackFullWidth>
                </Grid>
            </Grid>
        </CustomStackFullWidth>
    )
}
export default MapForRestaurantJoin
