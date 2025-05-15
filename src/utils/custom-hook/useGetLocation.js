import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { GoogleApi } from '@/hooks/react-query/config/googleApi'
import {
    setFormattedAddress,
    setLocation,
    setZoneIds,
} from '@/redux/slices/addressData'

export const useGetLocation = (coords) => {
    const dispatch = useDispatch()
    const { global } = useSelector((state) => state.globalSettings)
    const { location } = useSelector((state) => state.addressData)
    const [isDisablePickButton, setDisablePickButton] = useState(false)
    const [locationEnabled, setLocationEnabled] = useState(false)
    const [searchKey, setSearchKey] = useState({ description: '' })
    const [enabled, setEnabled] = useState(false)
    const [placeDetailsEnabled, setPlaceDetailsEnabled] = useState(false)
    const [placeDescription, setPlaceDescription] = useState(undefined)
    const [zoneId, setZoneId] = useState(undefined)
    const [mounted, setMounted] = useState(true)
    const [predictions, setPredictions] = useState([])
    const [placeId, setPlaceId] = useState('')
    const [value, setValue] = useState()
    const [currentLocationValue, setCurrentLactionValue] = useState({
        description: '',
    })

    const { data: places, isLoading: isLoadingPlacesApi } = useQuery(
        ['places', searchKey.description],
        async () => GoogleApi.placeApiAutocomplete(searchKey.description),
        { enabled },
        {
            retry: 1,
        }
    )

    useEffect(() => {
        if (global?.default_location) {
            dispatch(setLocation(global?.default_location))
        }
    }, [global?.default_location])

    const { data: zoneData } = useQuery(
        ['zoneId', location],
        async () => GoogleApi.getZoneId(location),
        { enabled: locationEnabled },
        {
            retry: 1,
        }
    )
    const { data: placeDetails } = useQuery(
        ['placeDetails', placeId],
        async () => GoogleApi.placeApiDetails(placeId),
        { enabled: placeDetailsEnabled },
        {
            retry: 1,
        }
    )

    useEffect(() => {
        if (placeDetails) {
            dispatch(
                setLocation({
                    lat: placeDetails?.data?.location?.latitude,
                    lng: placeDetails?.data?.location?.longitude
                })
            )
            setLocationEnabled(true)
        }
    }, [placeDetails])
    useEffect(() => {

        
        if (places) {
            const tempData= places?.data?.suggestions?.map((item) => ({
                place_id: item.placePrediction.placeId,
                    description: `${item?.placePrediction?.structuredFormat?.mainText?.text}, ${item?.placePrediction?.structuredFormat?.secondaryText?.text}`
                }))
            setPredictions(tempData)
        }
    }, [places])

    useEffect(() => {
        if (zoneData) {
            setZoneId(zoneData?.data?.zone_id)
            dispatch(setZoneIds(zoneData?.data?.zone_id))
            setLocationEnabled(false)
            setMounted(false)
        }
        if (!zoneData) {
            setZoneId(undefined)
        }
    }, [zoneData])

    const { isLoading: geoCodeLoading, data: geoCodeResults } = useQuery(
        ['geocode-api', location],
        async () => GoogleApi.geoCodeApi(location)
    )
    if (geoCodeResults) {
    }
    const setLocations = (value) => {
        dispatch(setLocation(value))
    }
    useEffect(() => {
        if (geoCodeResults) {
            dispatch(
                setFormattedAddress(
                    geoCodeResults?.data?.results[0]?.formatted_address
                )
            )
        }
    }, [geoCodeResults])
    useEffect(() => {
        if (geoCodeResults) {
            setCurrentLactionValue({
                description:
                    geoCodeResults?.data?.results[0]?.formatted_address,
            })
        } else {
            setCurrentLactionValue({
                description: '',
            })
        }
    }, [geoCodeResults])
    return {
        isDisablePickButton,
        setDisablePickButton,
        locationEnabled,
        setLocationEnabled,
        searchKey,
        setSearchKey,
        enabled,
        setEnabled,
        placeDetailsEnabled,
        setPlaceDetailsEnabled,
        placeDescription,
        setPlaceDescription,
        zoneId,
        setZoneId,
        mounted,
        setMounted,
        predictions,
        setPredictions,
        placeId,
        setPlaceId,
        value,
        setValue,
        setLocation,
        setLocations,
        isLoadingPlacesApi,
        geoCodeLoading,
        currentLocationValue,
        setCurrentLactionValue,

        // Other state variables and functions...
    }
}
