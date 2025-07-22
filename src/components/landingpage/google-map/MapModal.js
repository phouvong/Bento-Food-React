import React, { useEffect, useState } from 'react'
import {
    Box,
    Modal,
    Paper,
    Typography,
    styled,
    Button,
    Autocomplete,
    TextField,
    Grid,
    useTheme,
    alpha,
    Stack
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import CloseIcon from '@mui/icons-material/Close'
import GoogleMapComponent from './GoogleMapComponent'
import { useQuery } from 'react-query'
import { GoogleApi } from '@/hooks/react-query/config/googleApi'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useGeolocated } from 'react-geolocated'
import { PrimaryButton } from '../link-section/Linksection.style'
import Skeleton from '@mui/material/Skeleton'
import { onErrorResponse, onSingleErrorResponse } from '../../ErrorResponse'
import { setUserLocationUpdate, setZoneData } from '@/redux/slices/global'
import LocationEnableCheck from '../LocationEnableCheck'
import { FacebookCircularProgress } from '../HeroLocationForm'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { CustomTypographyGray } from '../../error/Errors.style'
import { CustomToaster } from '@/components/custom-toaster/CustomToaster'

const CustomBoxWrapper = styled(Box)(({ theme }) => ({
    outline: 'none',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgColor: 'background.paper',
    boxShadow: 24,
    paddingTop:"25px",
    maxWidth: '800px',
    minWidth: '100px',
    width: '100%',
    minHeight: '550px',
    background: theme.palette.background.paper,
    borderRadius: '5px',
    [theme.breakpoints.down('md')]: {
        maxWidth: '500px',
    },
    [theme.breakpoints.down('sm')]: {
        maxWidth: '330px',
        minHeight: '300px',
    },
}))
const CssTextField = styled(TextField)(({ theme }) => ({
    '& label.Mui-focused': {
        color: theme.palette.primary.main,
        background: theme.palette.whiteContainer.main,
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: theme.palette.primary.main,
        background: theme.palette.whiteContainer.main,
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
    '& .MuiOutlinedInput-root': {
        fontSize: '13px',
        padding: '4px',
        border: '1px solid',
        borderColor:  alpha(theme.palette.neutral[400],.5),
        borderRadius:"4px",
        '& fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
}))

const MapModal = ({ open, handleClose, redirectUrl }) => {
    const router = useRouter()
    const theme = useTheme()
    const { global, userLocationUpdate } = useSelector(
        (state) => state.globalSettings
    )
    const [isEnableLocation, setIsEnableLocation] = useState(false)
    const [searchKey, setSearchKey] = useState('')
    const [enabled, setEnabled] = useState(false)
    const [predictions, setPredictions] = useState([])
    const [placeDetailsEnabled, setPlaceDetailsEnabled] = useState(false)
    const [locationEnabled, setLocationEnabled] = useState(false)
    const [placeId, setPlaceId] = useState('')
    const [placeDescription, setPlaceDescription] = useState(undefined)
    const [location, setLocation] = useState(global?.default_location)
    const [zoneId, setZoneId] = useState(undefined)
    const [isLoadingCurrentLocation, setLoadingCurrentLocation] =
        useState(false)
    const [currentLocation, setCurrentLocation] = useState({})
    const [rerenderMap, setRerenderMap] = useState(false)
    const [currentLocationValue, setCurrentLactionValue] = useState({
        description: '',
    })
    const [loadingAuto, setLoadingAuto] = useState(false)
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const {
        isLoading: placesIsLoading,
        data: places,
        error,
    } = useQuery(
        ['places', searchKey],
        async () => GoogleApi.placeApiAutocomplete(searchKey),
        { enabled },
        {
            retry: 1,
        }
    )
    if (error) {
        setPredictions([])
        setEnabled(false)
    }
    

    const { data: placeDetails } = useQuery(
        ['placeDetails', placeId],
        async () => GoogleApi.placeApiDetails(placeId),
        {
            enabled: placeDetailsEnabled,
            onSuccess: () => setLoadingAuto(false),
            onError: onSingleErrorResponse,
        },
        {
            retry: 1,
        }
    )

    const {
        isLoading: locationLoading,
        data: zoneData,
        isError: isErrorLocation,
        error: errorLocation,
        refetch: locationRefetch,
    } = useQuery(
        ['zoneId', location],
        async () => GoogleApi.getZoneId(location),
        { enabled: locationEnabled, onError: onErrorResponse },
        {
            retry: 1,
        }
    )
    const { coords, isGeolocationEnabled } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: false,
        },
        userDecisionTimeout: 1000,
        isGeolocationEnabled: true,
    })

    useEffect(() => {
        if (coords) {
            setCurrentLocation({
                lat: coords.latitude,
                lng: coords.longitude,
            })
        }
    }, [])

    if (isErrorLocation) {
    }
    const { data: geoCodeResults, refetch: refetchCurrentLocation } = useQuery(
        ['geocode-api', location],
        async () => GoogleApi.geoCodeApi(location)
    )
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
    useEffect(() => {
        if (zoneData) {
            setZoneId(zoneData?.data?.zone_id)
            dispatch(setZoneData(zoneData?.data?.zone_data))
            setLocationEnabled(false)
        } else {
            locationRefetch()
        }
        if (!zoneData) {
            setZoneId(undefined)
        }
    }, [zoneData])
    
    useEffect(() => {
        if (placeDetails) {
            setLocation({
                lat: placeDetails?.data?.location?.latitude,
                lng: placeDetails?.data?.location?.longitude
            })
            setLocationEnabled(true)
        }
    }, [placeDetails])
    useEffect(() => {
        if (places) {
           const tempData= places?.data?.suggestions?.map((item) => ({
            place_id: item.placePrediction.placeId,
                description: `${item?.placePrediction?.structuredFormat?.mainText?.text}, ${item?.placePrediction?.structuredFormat?.secondaryText?.text || ""}`
            }))
            setPredictions(tempData)
        }
    }, [places])

    const handleLocationSet = (values) => {
        setLocation(values)
    }
    const handlePickLocationOnClick = () => {
        if (zoneId && geoCodeResults && location) {
            localStorage.setItem('zoneid', zoneId)
            localStorage.setItem(
                'location',
                geoCodeResults?.data?.results[0]?.formatted_address
            )
            localStorage.setItem('currentLatLng', JSON.stringify(location))
            dispatch(setUserLocationUpdate(!userLocationUpdate))
            CustomToaster('success', 'New location has been set.')
            if (redirectUrl) {
                if (redirectUrl?.query === undefined) {
                    router.push({ pathname: redirectUrl?.pathname })
                } else {
                    router.push({
                        pathname: redirectUrl?.pathname,
                        query: {
                            restaurantType: redirectUrl?.query,
                        },
                    })
                }
            } else {
                router.push('/home')
            }
        }
        handleClose()
    }
    const handleLocationSelection = (value) => {
        setPlaceId(value?.place_id)
        setPlaceDescription(value?.description)
    }

    const handleAgreeLocation = async () => {
        if (coords) {
            setLocation({ lat: coords?.latitude, lng: coords?.longitude })
            setLoadingCurrentLocation(true)
            setLocationEnabled(true)
            setLoadingCurrentLocation(false)
            if (zoneId) {
                localStorage.setItem('zoneid', zoneId)
            }
            await refetchCurrentLocation()
            setRerenderMap((prevState) => !prevState)
        } else {
            setIsEnableLocation(true)
        }
    }


    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <CustomBoxWrapper>
                <Grid container spacing={1} sx={{ paddingX: '25px',}}>
                    <Grid item md={12}>
                        <Typography
                            fontWeight="600"
                            fontSize={{ xs: '14px', sm: '16px' }}
                            color={theme.palette.neutral[1000]}
                        >
                            {t('Pick Location')}
                        </Typography>
                        <Typography
                            fontSize={{ xs: '12px', sm: '14px' }}
                            color={theme.palette.neutral[1000]}
                        >
                            {t(
                                'Sharing your accurate location enhances precision in search results and delivery estimates, ensures effortless order delivery.'
                            )}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <Paper sx={{ outline: 'none' }}>
                            {loadingAuto ? (
                                <Skeleton
                                    width="100%"
                                    height="55px"
                                    variant="rectangular"
                                />
                            ) : (
                                <Autocomplete
                                    fullWidth
                                    freeSolo
                                    id="combo-box-demo"
                                    getOptionLabel={(option) =>
                                        option.description
                                    }
                                    options={predictions}
                                    onChange={(event, value) => {
                                        if (value) {
                                            if (
                                                value !== '' &&
                                                typeof value === 'string'
                                            ) {
                                                setLoadingAuto(true)
                                                const value =predictions[0]
                                                handleLocationSelection(value)
                                            } else {
                                                handleLocationSelection(value)
                                            }
                                            setPlaceDetailsEnabled(true)
                                        }
                                        
                                    }}
                                    clearOnBlur={false}
                                    value={currentLocationValue}
                                    loading={placesIsLoading}
                                    loadingText={t(
                                        'Search suggestions are loading...'
                                    )}
                                    renderInput={(params) => (
                                        <CssTextField
                                            label={null}
                                            {...params}
                                            placeholder={t(
                                                'Search location here...'
                                            )}
                                            onChange={(event) => {
                                                setSearchKey(event.target.value)
                                                if (event.target.value) {
                                                    setEnabled(true)
                                                } else {
                                                    setEnabled(false)
                                                }
                                            }}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    setSearchKey(e.target.value)
                                                }
                                            }}
                                        />
                                    )}
                                />
                            )}
                        </Paper>
                    </Grid>

                </Grid>
                <Box
                    spacing={2}
                    className="mapsearch"
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: '10px',
                    }}
                >
                    <button onClick={handleClose} className="closebtn">
                        <CloseIcon sx={{ fontSize: '16px' }} />
                    </button>
                </Box>

                <Box
                    id="modal-modal-description"
                    sx={{
                        mt: 2,
                        color: (theme) => theme.palette.neutral[1000],
                        Height: '400px',
                        paddingX: '25px',
                    }}
                >
                    {!!location ? (
                        <GoogleMapComponent
                            key={rerenderMap}
                            setLocationEnabled={setLocationEnabled}
                            setLocation={handleLocationSet}
                            setCurrentLocation={setCurrentLocation}
                            locationLoading={locationLoading}
                            location={location}
                            setPlaceDetailsEnabled={setPlaceDetailsEnabled}
                            placeDetailsEnabled={placeDetailsEnabled}
                            locationEnabled={locationEnabled}
                            setPlaceDescription={setPlaceDescription}
                            handleAgreeLocation={handleAgreeLocation}
                        />
                    ) : (
                        <CustomStackFullWidth
                            alignItems="center"
                            justifyContent="center"
                            sx={{ minHeight: '400px' }}
                        >
                            <FacebookCircularProgress />
                            <CustomTypographyGray nodefaultfont="true">
                                {t('Please wait sometimes')}
                            </CustomTypographyGray>
                        </CustomStackFullWidth>
                    )}

                    <CustomStackFullWidth
                        justifyConatent="center"
                        alignItems="center"
                    ></CustomStackFullWidth>


                </Box>
                {errorLocation?.response?.data ? (
                    <Button
                        aria-label="picklocation"
                        sx={{
                            flex: '1 0',
                            width: '100%',
                            top: '.7rem',
                        }}
                        disabled={locationLoading}
                        variant="contained"
                        color="error"
                        onClick={() => {
                            if (zoneId) {
                                localStorage.setItem('zoneid', zoneId)
                            }
                            handleClose()
                        }}
                    >
                        {errorLocation?.response?.data?.errors[0]?.message}
                    </Button>
                ) : (
                    <>
                        {!!location && (
                            <Stack width="100%" justifyContent="flex-end" alignItems="flex-end"
                            sx={{borderRadius: "5px",
                                background: theme=>theme.palette.neutral[100],
                                boxShadow: "0px -1px 25px 0px rgba(0, 0, 0, 0.08)",
                                paddingX:"25px",
                                paddingY:"10px"
                            }}

                            >
                                <PrimaryButton
                                    align="center"
                                    aria-label="picklocation"
                                    sx={{
                                        flex: '1 0',
                                        maxWidth:"194px",
                                        width: '100%',

                                        borderRadius:"5px"
                                    }}
                                    disabled={locationLoading}
                                    variant="contained"
                                    onClick={() => handlePickLocationOnClick()}
                                >
                                    {t('Pick Locations')}
                                </PrimaryButton>
                            </Stack>
                        )}
                    </>
                )}
                <LocationEnableCheck
                    openLocation={isEnableLocation}
                    handleCloseLocation={() => setIsEnableLocation(false)}
                    isGeolocationEnabled={isGeolocationEnabled}
                    t={t}
                    coords={coords}
                    handleAgreeLocation={handleAgreeLocation}
                />
            </CustomBoxWrapper>
        </Modal>
    )
}

export default MapModal
