import React, { useEffect, useState } from 'react'
import {
    alpha,
    Autocomplete,
    CircularProgress,
    circularProgressClasses,
    IconButton,
    NoSsr,
    Stack,
    Typography,
    Box,
    Paper,
    Button,
} from '@mui/material'

import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import MapModal from './google-map/MapModal'
import { useQuery } from 'react-query'
import { GoogleApi } from '@/hooks/react-query/config/googleApi'
import { useGeolocated } from 'react-geolocated'
import CloseIcon from '@mui/icons-material/Close'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { CustomTypography } from '../custom-tables/Tables.style'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import {
    CssTextField,
    CustomBox,
    CustomSearchField,
    StyledButton,
} from './Landingpage.style'
import { useTheme } from '@mui/material/styles'
import { toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { setUserLocationUpdate, setZoneData } from '@/redux/slices/global'
import { onErrorResponse, onSingleErrorResponse } from '../ErrorResponse'
import LocationEnableCheck from './LocationEnableCheck'
import useMediaQuery from '@mui/material/useMediaQuery'
import { AnimationDots } from '../products-page/AnimationDots'
import { CustomToaster } from '../custom-toaster/CustomToaster'
import EastIcon from '@mui/icons-material/East';
import RoomIcon from '@mui/icons-material/Room';
import { CustomButtonPrimary } from '@/styled-components/CustomButtons.style'
import MapIcon from '@mui/icons-material/Map';

export function FacebookCircularProgress(props) {
    return (
        <Box
            sx={{
                position: 'relative',
                display: 'inline-flex',
                width: 24,
                height: 24,
                flexShrink: 0,
                lineHeight: 0,
            }}
        >
            <CircularProgress
                variant="determinate"
                sx={{
                    color: (theme) =>
                        theme.palette.grey[
                        theme.palette.mode === 'light' ? 200 : 800
                        ],
                }}
                size={24}
                thickness={4}
                {...props}
                value={100}
            />
            <CircularProgress
                variant="indeterminate"
                disableShrink
                sx={{
                    color: (theme) => theme.palette.primary.main,
                    animationDuration: '550ms',
                    position: 'absolute',
                    left: 0,
                    [`& .${circularProgressClasses.circle}`]: {
                        strokeLinecap: 'round',
                    },
                }}
                size={24}
                thickness={4}
                {...props}
            />
        </Box>
    )
}

const HeroLocationForm = ({ isStoreCreate, mobileview, fromHero, handleModalClose, getLocation, height, place_holder_search_text, placeholderColor }) => {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const theme = useTheme()
    const { coords, isGeolocationEnabled } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: false,
        },
        userDecisionTimeout: 5000,
        isGeolocationEnabled: true,
    })

    const handleOpen = () => setOpen(true)
    const handleClose = () => {
        setOpen(false)
        if (router.pathname !== '/') {
            handleModalClose?.()
        }
    }
    const [location, setLocation] = useState('')
    const [geoLocationEnable, setGeoLocationEnable] = useState(false)
    const [searchKey, setSearchKey] = useState('')
    const [enabled, setEnabled] = useState(false)
    const [predictions, setPredictions] = useState([])
    const [openLocation, setOpenLocation] = useState(false)
    const [currentLocation, setCurrentLocation] = useState(undefined)
    const [showCurrentLocation, setShowCurrentLocation] = useState(false)
    const [zoneIdEnabled, setZoneIdEnabled] = useState(false)
    const [placeId, setPlaceId] = useState('')
    const [placeDescription, setPlaceDescription] = useState(undefined)
    const [placeDetailsEnabled, setPlaceDetailsEnabled] = useState(false)
    const { userLocationUpdate } = useSelector((state) => state.globalSettings)
    const dispatch = useDispatch()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))

    useEffect(() => {
        if (getLocation) {
            // setShowCurrentLocation(false)
            getLocation(location)
            setGeoLocationEnable(false)
        }
    }, [location])


    const handleCloseLocation = () => {
        setOpenLocation(false)
        setShowCurrentLocation(false)
        setGeoLocationEnable(false)
        setCurrentLocation(undefined)
    }
    const handleAgreeLocation = () => {
        if (coords) {
            setLocation({ lat: coords?.latitude, lng: coords?.longitude })
            setOpenLocation(false)
            setShowCurrentLocation(true)
            setGeoLocationEnable(true)
            setZoneIdEnabled(false)
        } else {
            setOpenLocation(true)
        }
    }

    const { data: places } = useQuery(
        ['places', searchKey],
        async () => GoogleApi.placeApiAutocomplete(searchKey),
        { enabled },
        {
            retry: 1,
        }
    )
    const { data: geoCodeResults, isFetching } = useQuery(
        ['geocode-api', location],
        async () => GoogleApi.geoCodeApi(location),
        {
            enabled: geoLocationEnable,
            onError: onSingleErrorResponse,
        }
    )

    const onZoneSuccessHandler = (res) => {
        if (res?.data?.zone_data?.length > 0) {
            handleModalClose?.()
            CustomToaster('success', 'New location has been set.')
            dispatch(setUserLocationUpdate(!userLocationUpdate))
            router.push('/home')
        }
    }
    const { isLoading: locationLoading, data: zoneData } = useQuery(
        ['zoneId', location],
        async () => GoogleApi.getZoneId(location),
        {
            enabled: zoneIdEnabled,
            onError: onErrorResponse,
            onSuccess: onZoneSuccessHandler,
            retry: false,
        }
    )

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (zoneData) {
                dispatch(setZoneData(zoneData?.data?.zone_data))
                localStorage.setItem('zoneid', zoneData?.data?.zone_id)
            }
        }
    }, [zoneData])

    //********************Pick Location */
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
            setLocation({
                lat: placeDetails?.data?.location?.latitude,
                lng: placeDetails?.data?.location?.longitude,
            })
        }
    }, [placeDetails])

    useEffect(() => {
        if (places) {
            const tempData = places?.data?.suggestions?.map((item) => ({
                place_id: item?.placePrediction?.placeId,
                description: `${item?.placePrediction?.structuredFormat?.mainText?.text}, ${item?.placePrediction?.structuredFormat?.secondaryText?.text || ""}`
            }))
            setPredictions(tempData)
        }
    }, [places])
    useEffect(() => {
        if (geoCodeResults?.data?.results && showCurrentLocation) {
            setCurrentLocation(
                geoCodeResults?.data?.results[0]?.formatted_address
            )
        }
    }, [geoCodeResults])
    useEffect(() => {
        if (placeDescription) {
            setCurrentLocation(placeDescription)
        }
    }, [placeDescription])

    let languageDirection = undefined

    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }

    const setLocationEnable = () => {

        if (!currentLocation) {
            toast.error(t('Location is required.'), {
                id: 'id',
            })
            return null
        }
        setGeoLocationEnable(true)
        setZoneIdEnabled(true)

        if (currentLocation && location) {
            localStorage.setItem('location', currentLocation)
            localStorage.setItem('currentLatLng', JSON.stringify(location))
        } else {
            toast.error(t('Location is required.'), {
                id: 'id',
            })
        }
    }

    return (
        <>
            <Stack
                width="100%"
                backgroundColor={
                    !fromHero && !isXSmall && alpha(theme.palette.neutral[400], 0.2)
                }
                borderRadius={isXSmall ? '0px' : '10px'}
                marginTop={getLocation ? '' : fromHero ? '0px' : '20px'}
                sx={{
                    padding: getLocation || fromHero ? '' : (isXSmall ? 0 : '1rem'),
                    "> form": {
                        margin: 0,
                    }
                }}
            >
                <CustomBox component="form">
                    <CustomStackFullWidth
                        direction={{
                            xs: 'column',
                            sm: 'row',
                            md: 'row',
                        }}
                        spacing={{ xs: '0', sm: 1, md: 2 }}
                        alignItems={{
                            xs: 'center',
                        }}
                    >
                        <CustomStackFullWidth
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                            gap={fromHero ? (isXSmall ? '4px' : '8px') : 0}
                        >
                            <CustomSearchField
                                variant="outlined"
                                height={height}
                                sx={fromHero ? {
                                    flex: 1,
                                    minWidth: 0,
                                    borderRadius: '999px !important',
                                    border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                                    boxShadow: 'none',
                                    padding: { xs: '2px 4px 2px 8px', sm: '3px 5px 3px 14px' },
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: 'auto',
                                    backgroundColor: theme.palette.background.paper,
                                    transition: 'border-color .2s ease, box-shadow .2s ease',
                                    '&:focus-within': {
                                        borderColor: theme.palette.primary.main,
                                        boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.14)}`,
                                    },
                                } : undefined}
                            >
                                {!showCurrentLocation ? (
                                    <Autocomplete
                                        sx={{
                                            ...(fromHero && {
                                                width: '100%',
                                                '& .MuiAutocomplete-endAdornment': {
                                                    right: '4px',
                                                },
                                            }),
                                            '& .MuiAutocomplete-inputRoot': {
                                                paddingRight: '26px !important',
                                                paddingTop: getLocation
                                                    ? ''
                                                    : '3px',
                                            },
                                        }}
                                        loading={isFetching}
                                        fullWidth
                                        options={predictions || []}
                                        getOptionLabel={(option) =>
                                            option?.description
                                        }
                                        onChange={(event, value) => {
                                            if (value) {
                                                setPlaceId(value?.place_id)
                                                setPlaceDescription(
                                                    value?.description
                                                )
                                                setZoneIdEnabled(false)
                                                setGeoLocationEnable(true)
                                            }
                                            setPlaceDetailsEnabled(true)
                                        }}
                                        renderInput={(params) => {
                                            const hasRequiredAsterisk = place_holder_search_text?.includes('*');
                                            const displayText = hasRequiredAsterisk ? place_holder_search_text.replace('*', '') : (place_holder_search_text || t('Enter your location here....'));
                                            const isValueEmpty = !params.inputProps.value;

                                            return (
                                                <Box sx={{ position: 'relative', width: '100%' }}>
                                                    <CssTextField
                                                        mobileview={mobileview}
                                                        getLocation={getLocation}
                                                        languageDirection={languageDirection}
                                                        id="outlined-basic"
                                                        {...params}
                                                        placeholder={hasRequiredAsterisk ? "" : displayText}
                                                        onChange={(event) => {
                                                            setSearchKey(
                                                                event.target.value
                                                            )
                                                            if (event.target.value) {
                                                                setEnabled(true)
                                                                setGeoLocationEnable(
                                                                    true
                                                                )
                                                            } else {
                                                                setEnabled(false)
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                            }
                                                        }}
                                                        sx={fromHero ? {
                                                            width: '100%',
                                                            '& .MuiOutlinedInput-root': {
                                                                padding: '0 !important',
                                                                backgroundColor: 'transparent',
                                                                '& fieldset': { border: 'none !important' },
                                                                '&:hover fieldset': { border: 'none !important' },
                                                                '&.Mui-focused fieldset': { border: 'none !important' },
                                                            },
                                                            '& .MuiOutlinedInput-notchedOutline': { border: 'none !important' },
                                                            '& .MuiOutlinedInput-input': {
                                                                padding: { xs: '8px 0 !important', sm: '10px 0 !important' },
                                                                fontSize: '14px',
                                                                color: theme.palette.text.primary,
                                                            },
                                                        } : undefined}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            sx: {
                                                                '&::placeholder': {
                                                                    fontSize:{xs:"11px",md: '14px'},
                                                                    color: placeholderColor || '#9e9e9e',
                                                                    opacity: 1,
                                                                    fontWeight: '400',
                                                                },
                                                                input: {
                                                                    '&::placeholder': {
                                                                        fontSize:
                                                                           {xs:"11px",md: '14px'},
                                                                        color: placeholderColor || '#9e9e9e',
                                                                        opacity: 1,
                                                                        fontWeight:
                                                                            '400',
                                                                    },
                                                                },
                                                            },
                                                            startAdornment: (
                                                                <Box
                                                                    sx={{
                                                                        display: 'flex',
                                                                        alignItems:
                                                                            'center',
                                                                        color: fromHero
                                                                            ? theme.palette.primary.main
                                                                            : theme.palette.neutral[500],
                                                                        mr: fromHero ? { xs: 0.5, sm: 1 } : 0,
                                                                        flexShrink: 0,
                                                                    }}
                                                                >
                                                                    <RoomIcon
                                                                        sx={{
                                                                            fontSize: fromHero ? { xs: '18px', sm: '20px' } : '20px',
                                                                        }}
                                                                    />{' '}
                                                                    {/* Replace with any icon */}
                                                                </Box>
                                                            ),
                                                            endAdornment: (
                                                                <IconButton
                                                                    sx={fromHero ? {
                                                                        width: { xs: 28, sm: 32 },
                                                                        height: { xs: 28, sm: 32 },
                                                                        borderRadius: '50%',
                                                                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                                                        color: theme.palette.primary.main,
                                                                        flexShrink: 0,
                                                                        padding: { xs: '4px', sm: '8px' },
                                                                        '&:hover': {
                                                                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                                                        },
                                                                    } : {
                                                                        mr: '-20px',
                                                                    }}
                                                                    onClick={() =>
                                                                        handleAgreeLocation()
                                                                    }
                                                                >
                                                                    <GpsFixedIcon color="primary" sx={fromHero ? { fontSize: { xs: '14px', sm: '16px' } } : undefined} />
                                                                </IconButton>
                                                            ),
                                                        }}
                                                        required={true}
                                                    />
                                                    {hasRequiredAsterisk && isValueEmpty && (
                                                        <Typography
                                                            sx={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: languageDirection === 'rtl' ? 'unset' : '48px',
                                                                right: languageDirection === 'rtl' ? '48px' : 'unset',
                                                                transform: 'translateY(-50%)',
                                                                pointerEvents: 'none',
                                                                fontSize: '14px',
                                                                color: placeholderColor || '#9e9e9e',
                                                                fontWeight: '400',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                zIndex: 1,
                                                            }}
                                                        >
                                                            {displayText}
                                                            <span style={{ color: 'red', marginLeft: '2px' }}>*</span>
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )
                                        }}
                                        PaperComponent={({ children }) => {


                                            return (
                                                <Paper>
                                                    {children}
                                                    <Box textAlign="center" p={1}>
                                                        {isStoreCreate ? null :
                                                            (
                                                                <Button
                                                                    variant="text"
                                                                    size="small"
                                                                    onMouseDown={(e) => {
                                                                        e.stopPropagation()
                                                                        e.preventDefault()
                                                                        handleOpen()
                                                                    }}
                                                                    sx={{
                                                                        width: '100%',
                                                                        backgroundColor: theme.palette.neutral[300],
                                                                        display: 'flex',
                                                                        gap: 1,
                                                                    }}
                                                                >
                                                                    <MapIcon />
                                                                    <Typography variant="body1" color={theme.palette.text.main}>
                                                                        {t('Set from map')}
                                                                    </Typography>
                                                                </Button>
                                                            )
                                                        }

                                                    </Box>
                                                </Paper>
                                            )
                                        }}
                                    />
                                ) : (
                                    <CssTextField
                                        sx={fromHero ? {
                                            width: '100%',
                                            '& .MuiOutlinedInput-root': {
                                                padding: '0 !important',
                                                backgroundColor: 'transparent',
                                                '& fieldset': { border: 'none !important' },
                                                '&:hover fieldset': { border: 'none !important' },
                                                '&.Mui-focused fieldset': { border: 'none !important' },
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': { border: 'none !important' },
                                            '& .MuiOutlinedInput-input': {
                                                padding: { xs: '10px 0 !important', sm: '10px 0 !important' },
                                                fontSize: '14.5px',
                                                color: theme.palette.text.primary,
                                            },
                                        } : {
                                            // paddingTop: getLocation ? '' : '3px',
                                            width: '100%',
                                        }}
                                        getLocation={getLocation}
                                        mobileview={mobileview}
                                        languageDirection={languageDirection}
                                        size={!getLocation && 'small'}
                                        variant="outlined"
                                        id="outlined-basic"
                                        placeholder={t(
                                            'Search location here...'
                                        )}
                                        value={currentLocation}
                                        onChange={(event) => {
                                            setSearchKey(event.target.value)
                                            if (event.target.value) {
                                                setEnabled(true)
                                                setCurrentLocation(
                                                    event.target.value
                                                )
                                            } else {
                                                setEnabled(false)
                                                setCurrentLocation(undefined)
                                            }
                                        }}
                                        required={true}
                                        InputProps={{
                                            endAdornment:
                                                !showCurrentLocation ? (
                                                    <IconButton
                                                        onClick={() =>
                                                            handleAgreeLocation()
                                                        }
                                                    >
                                                        <GpsFixedIcon color="primary" />
                                                    </IconButton>
                                                ) : (
                                                    <>
                                                        {isFetching ? (
                                                            <FacebookCircularProgress />
                                                        ) : (
                                                            <CloseIcon
                                                                style={{
                                                                    cursor: 'pointer',
                                                                }}
                                                                onClick={() =>
                                                                    handleCloseLocation()
                                                                }
                                                            />
                                                        )}
                                                    </>
                                                ),
                                        }}
                                    />
                                )}
                            </CustomSearchField>

                            {!getLocation && (isFetching ? (
                                <>
                                    {fromHero ? (
                                        <CustomButtonPrimary
                                            radiuschange="true"
                                            paddingTop="8px"
                                            paddingBottom="8px"
                                            sx={{
                                                borderRadius: '999px !important',
                                                padding: { xs: '6px 12px', sm: '9px 22px' },
                                                minWidth: { xs: '44px', sm: '170px', md: '180px' },
                                                width: { xs: '44px', sm: '170px', md: '180px' },
                                                height: { xs: '36px', sm: '42px' },
                                                whiteSpace: 'nowrap',
                                                flexShrink: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Stack
                                                py="5px"
                                                alignItems="center"
                                                justifyContent="center"
                                                sx={{
                                                    transform: 'scale(0.6)',
                                                    transformOrigin: 'center',
                                                }}
                                            >
                                                <AnimationDots size="0px" />
                                            </Stack>
                                        </CustomButtonPrimary>
                                    ) : (
                                        <StyledButton
                                            radiuschange="true"
                                            sx={{
                                                fontWeight: '400',
                                                width: {
                                                    xs: '80px',

                                                },
                                            }}
                                        >
                                            <Stack py="5px" >
                                                <AnimationDots size="0px" />
                                            </Stack>
                                        </StyledButton>
                                    )}
                                </>
                            ) : (
                                <>
                                    {fromHero ? (
                                        <CustomButtonPrimary
                                            languageDirection={
                                                languageDirection
                                            }
                                            radiuschange="true"
                                            onClick={() => setLocationEnable()}
                                            paddingTop="8px"
                                            paddingBottom="8px"
                                            disabled={!location}
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: { xs: '13px', sm: '13.5px' },
                                                borderRadius: '999px !important',
                                                padding: { xs: '6px 12px', sm: '9px 22px' },
                                                minWidth: { xs: '44px', sm: '170px', md: '180px' },
                                                width: { xs: '44px', sm: '170px', md: '180px' },
                                                height: { xs: '36px', sm: '42px' },
                                                whiteSpace: 'nowrap',
                                                flexShrink: 0,
                                                '& .MuiSvgIcon-root': {
                                                    fontSize: { xs: '18px', sm: '20px' },
                                                },
                                            }}
                                        >
                                            {isXSmall ? <EastIcon /> : t('Find Restaurant')}
                                        </CustomButtonPrimary>
                                    ) : (
                                        <StyledButton
                                            languageDirection={
                                                languageDirection
                                            }
                                            radiuschange="true"
                                            onClick={() => setLocationEnable()}
                                            disabled={!location}
                                            sx={{
                                                fontWeight: '500',
                                                width: {
                                                    xs: fromHero
                                                        ? 'auto'
                                                        : '56px',
                                                },
                                            }}
                                        >
                                            <EastIcon />
                                        </StyledButton>
                                    )}
                                </>
                            ))}
                        </CustomStackFullWidth>
                    </CustomStackFullWidth>
                </CustomBox>
            </Stack>
            {open && <MapModal open={open} handleClose={handleClose} />}
            {!isGeolocationEnabled && (
                <LocationEnableCheck
                    openLocation={openLocation}
                    handleCloseLocation={handleCloseLocation}
                    isGeolocationEnabled={isGeolocationEnabled}
                    t={t}
                    coords={coords}
                    handleAgreeLocation={handleAgreeLocation}
                />
            )}
        </>
    )
}

export default HeroLocationForm
