import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    alpha,
    Box,
    Button,
    CircularProgress,
    Drawer,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation, useQuery } from 'react-query'
import { useTranslation } from 'react-i18next'
import MapWithSearchBox from '@/components/google-map/MapWithSearchBox'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'
import { useGetLocation } from '@/utils/custom-hook/useGetLocation'
import { AnimationDots } from '@/components/products-page/AnimationDots'
import { setLocation } from '@/redux/slices/addressData'
import { AddressApi } from '@/hooks/react-query/config/addressApi'
import { ProfileApi } from '@/hooks/react-query/config/profileApi'
import { setUserLocationUpdate } from '@/redux/slices/global'
import { RTL } from '@/components/RTL/RTL'
import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import {
    normalizeAddressValues,
    setLocalLocation,
} from '@/components/checkout-page/functions/addressHelpers'
import AddressDrawerHeader from './AddressDrawerHeader'
import AddressDrawerList from './AddressDrawerList'
import AddressDrawerForm from './AddressDrawerForm'
import { INTENTS, MODES, STEPS } from './addressDrawerConstants'
import useCloseOnBackButton from '@/hooks/custom-hooks/useCloseOnBackButton'

const FORM_ID = 'address-drawer-form'

const primaryButtonSx = {
    height: '44px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '-0.48px',
    textTransform: 'capitalize',
    color: (theme) => `${theme.palette.primary.contrastText} !important`,
    backgroundColor: (theme) => theme.palette.primary.main,
    '&:hover': { backgroundColor: (theme) => theme.palette.primary.dark },
    '&.Mui-disabled': {
        color: (theme) => `${theme.palette.text.disabled} !important`,
        backgroundColor: (theme) => theme.palette.action.disabledBackground,
    },
}

const secondaryButtonSx = {
    height: '44px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '-0.48px',
    textTransform: 'capitalize',
    color: (theme) => theme.palette.text.primary,
    backgroundColor: (theme) => theme.palette.neutral[200],
    '&:hover': {
        backgroundColor: (theme) => theme.palette.neutral[200],
        opacity: 0.85,
    },
}

const AddressDrawer = ({
    open,
    onClose,
    mode = MODES.reselect,
    coords,
    selectedAddress,
    setAddress,
    editAddress,
    onSaved,
}) => {
    const { t } = useTranslation()
    const token = getToken()
    const dispatch = useDispatch()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    useCloseOnBackButton(Boolean(open), onClose)
    const showList = mode === MODES.reselect

    const initialStep = () => {
        if (editAddress) return STEPS.form
        return showList ? STEPS.list : STEPS.map
    }
    const initialIntent = () => {
        if (editAddress) return INTENTS.edit
        return showList ? INTENTS.relocate : INTENTS.create
    }

    const [inZone, setInZone] = useState(null)
    const [rerenderMap, setRerenderMap] = useState(false)
    const [step, setStep] = useState(initialStep)
    const [intent, setIntent] = useState(initialIntent)
    const [editingAddress, setEditingAddress] = useState(editAddress ?? null)
    const [locationPicked, setLocationPicked] = useState(false)
    const [draft, setDraft] = useState(null)
    const commitOnGeocode = useRef(false)

    const { geoCodeLoading, setLocationEnabled } = useGetLocation(coords)
    const { location, formatted_address, zoneId } = useSelector(
        (state) => state.addressData
    )
    const { userLocationUpdate } = useSelector((state) => state.globalSettings)
    const languageDirection =
        typeof window !== 'undefined'
            ? localStorage.getItem('direction')
            : 'ltr'

    const {
        data: addressData,
        isLoading: addressLoading,
        refetch: refetchAddresses,
    } = useQuery(['address-list'], AddressApi.addressList, {
        enabled: Boolean(token) && open && showList,
    })

    const { data: profileData } = useQuery(
        ['profile-info'],
        ProfileApi.profileInfo,
        { enabled: Boolean(token) && open }
    )

    // Guard against a stale ['address-list']/['profile-info'] cache outliving
    // logout — enabled:false only stops refetching, it doesn't clear `data`.
    const addresses = token ? addressData?.data?.addresses ?? [] : []
    const profile = token ? profileData?.data : undefined

    // MapWithSearchBox renders nothing usable until it has real coordinates —
    // without this the map step is a blank panel while they resolve.
    const hasMapLocation =
        Number.isFinite(Number(location?.lat)) &&
        Number.isFinite(Number(location?.lng))

    const commitLocation = () => {
        if (!zoneId || !formatted_address || !location) return false
        localStorage.setItem('zoneid', zoneId)
        localStorage.setItem('location', formatted_address)
        localStorage.setItem('currentLatLng', JSON.stringify(location))
        CustomToaster('success', 'New location has been set.')
        setAddress?.(null)
        dispatch(setUserLocationUpdate(!userLocationUpdate))
        onClose()
        window.location.reload()
        return true
    }

    const moveToCurrentLocation = () => {
        if (!coords) {
            CustomToaster(
                'error',
                t('Unable to detect your current location.')
            )
            return
        }
        setLocationEnabled(true)
        dispatch(
            setLocation({ lat: coords?.latitude, lng: coords?.longitude })
        )
        if (zoneId) {
            localStorage.setItem('zoneid', zoneId)
        }
        setRerenderMap((prevMap) => !prevMap)
    }

    const [locatingCurrentPosition, setLocatingCurrentPosition] =
        useState(false)

    const handleUseCurrentLocation = () => {
        if (!coords) {
            moveToCurrentLocation()
            return
        }
        commitOnGeocode.current = true
        setLocatingCurrentPosition(true)
        moveToCurrentLocation()
    }

    useEffect(() => {
        if (!commitOnGeocode.current) return
        if (commitLocation()) {
            commitOnGeocode.current = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location, formatted_address, zoneId])

    useEffect(() => {
        if (!locatingCurrentPosition) return
        const timeoutId = setTimeout(() => {
            if (!commitOnGeocode.current) return
            commitOnGeocode.current = false
            setLocatingCurrentPosition(false)
            CustomToaster(
                'error',
                t('Could not set your current location. Please try again.')
            )
        }, 15000)
        return () => clearTimeout(timeoutId)
    }, [locatingCurrentPosition])

    // Hosts mount this only while open, so the step/intent useState initialisers
    // already reflect editAddress — this only has to seed the map pin.
    useEffect(() => {
        if (editAddress?.latitude && editAddress?.longitude) {
            dispatch(
                setLocation({
                    lat: editAddress.latitude,
                    lng: editAddress.longitude,
                })
            )
            setRerenderMap((prevMap) => !prevMap)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const goToMap = (nextIntent) => {
        setIntent(nextIntent)
        setStep(STEPS.map)
    }

    const handleAddAddress = () => {
        setEditingAddress(null)
        setLocationPicked(false)
        setDraft(null)
        goToMap(INTENTS.create)
    }

    const handleSelectAddress = (selected) => {
        const normalized = normalizeAddressValues(selected)
        setAddress?.(normalized)
        setLocalLocation(normalized)
    }

    const handleConfirmLocation = () => {
        if (intent === INTENTS.relocate) {
            commitLocation()
            return
        }
        setLocationPicked(true)
        setStep(STEPS.form)
    }

    const handleBack = () => {
        if (draft || editingAddress) {
            setStep(STEPS.form)
            return
        }
        if (showList) {
            setStep(STEPS.list)
            return
        }
        onClose()
    }

    const handleSaved = (response) => {
        CustomToaster('success', response?.data?.message)
        setDraft(null)
        setEditingAddress(null)
        onSaved?.()
        if (showList) {
            refetchAddresses()
            setStep(STEPS.list)
            return
        }
        onClose()
    }

    const { mutate: addAddress, isLoading: adding } = useMutation(
        'address-add',
        AddressApi.addNewAddress,
        { onSuccess: handleSaved }
    )

    const { mutate: updateAddress, isLoading: updating } = useMutation(
        'address-update',
        AddressApi.editAddress,
        { onSuccess: handleSaved }
    )

    // Until the user re-picks on the map, an address being edited keeps its own
    // saved text and coordinates rather than whatever the map last geocoded.
    const activeAddressText = locationPicked
        ? formatted_address ?? ''
        : editingAddress?.address ?? formatted_address ?? ''
    const activeLatLng = locationPicked
        ? { lat: location?.lat, lng: location?.lng }
        : {
              lat: editingAddress?.latitude ?? location?.lat,
              lng: editingAddress?.longitude ?? location?.lng,
          }

    const formInitialValues = useMemo(
        () => ({
            address: activeAddressText,
            address_type:
                draft?.address_type ??
                editingAddress?.address_type?.toLowerCase() ??
                'home',
            contact_person_name:
                draft?.contact_person_name ??
                editingAddress?.contact_person_name ??
                profile?.f_name ??
                '',
            road: draft?.road ?? editingAddress?.road ?? '',
            house: draft?.house ?? editingAddress?.house ?? '',
            floor: draft?.floor ?? editingAddress?.floor ?? '',
        }),
        [draft, activeAddressText, editingAddress, profile]
    )

    const handleFormSubmit = (values) => {
        const payload = {
            ...values,
            address: activeAddressText || values.address,
            contact_person_number:
                editingAddress?.contact_person_number ?? profile?.phone ?? '',
            latitude: activeLatLng.lat,
            longitude: activeLatLng.lng,
        }
        if (editingAddress?.id) {
            updateAddress({ ...payload, id: editingAddress.id })
            return
        }
        addAddress(payload)
    }

    const headerProps = {
        [STEPS.list]: {
            title: t('Delivery address'),
            subtitle: t('Choose where you want to receive your order'),
        },
        [STEPS.map]: {
            title: t('Pick a location'),
            subtitle: t('Drag the pin or search to set your address'),
            onBack: handleBack,
        },
        [STEPS.form]: {
            title: editingAddress ? t('Edit Address') : t('Add New Address'),
        },
    }[step]

    return (
        <RTL direction={languageDirection}>
            <Drawer
                anchor={isMobile ? 'bottom' : 'left'}
                open={open}
                onClose={onClose}
                variant="temporary"
                sx={{
                    zIndex: 1300,
                    '& .MuiDrawer-paper': {
                        width: { xs: '100vw', sm: '460px', md: '500px' },
                        maxWidth: '100vw',
                        height: { xs: '90dvh', sm: '100%' },
                        maxHeight: { xs: '90dvh', sm: '100%' },
                        borderTopLeftRadius: { xs: '20px', sm: 0 },
                        borderTopRightRadius: { xs: '20px', sm: 0 },
                        backgroundColor: (theme) =>
                            theme.palette.background.paper,
                    },
                }}
            >
                <Stack sx={{ height: '100%' }}>
                    <AddressDrawerHeader {...headerProps} onClose={onClose} />

                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: step === STEPS.map ? 'hidden' : 'auto',
                        }}
                    >
                        {step === STEPS.list && (
                            <AddressDrawerList
                                addresses={addresses}
                                isLoading={Boolean(token) && addressLoading}
                                selectedId={selectedAddress?.id}
                                onSelect={handleSelectAddress}
                                onAddAddress={handleAddAddress}
                                token={token}
                                onClose={onClose}
                            />
                        )}

                        {step === STEPS.map && (
                            <Box
                                sx={{
                                    position: 'relative',
                                    height: '100%',
                                    '& > .MuiStack-root': {
                                        height: '100%',
                                        gap: 0,
                                    },
                                    '& > .MuiStack-root > .MuiBox-root': {
                                        height: '100%',
                                    },
                                    '& > .MuiStack-root > .MuiBox-root > .MuiStack-root':
                                        { height: '100%', minHeight: 0 },
                                    '& .map > div': {
                                        border: 'none !important',
                                        borderRadius: '0 !important',
                                    },
                                    '& .MuiSkeleton-root': {
                                        height: '100% !important',
                                    },
                                }}
                            >
                                {!hasMapLocation && (
                                    <Stack
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            zIndex: 5,
                                            backgroundColor: (theme) =>
                                                theme.palette.background.paper,
                                        }}
                                    >
                                        <CircularProgress size={28} />
                                    </Stack>
                                )}
                                <MapWithSearchBox
                                    isGps={true}
                                    searchBoxInside={true}
                                    rerenderMap={rerenderMap}
                                    orderType="dd"
                                    padding="0px"
                                    coords={coords}
                                    mapHeight="100%"
                                    heightFromStore="100%"
                                    handleAgreeLocation={moveToCurrentLocation}
                                    setInZone={setInZone}
                                    inZone={inZone}
                                />
                                {inZone === false && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            left: '16px',
                                            right: '16px',
                                            bottom: '16px',
                                            zIndex: 1200,
                                            p: '10px',
                                            borderRadius: '10px',
                                            backgroundColor: (theme) =>
                                                theme.palette.background.paper,
                                            border: (theme) =>
                                                `1px solid ${alpha(
                                                    theme.palette.error.main,
                                                    0.4
                                                )}`,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: '12.5px',
                                                color: (theme) =>
                                                    theme.palette.error.main,
                                            }}
                                        >
                                            {t(
                                                "We don't deliver to this location yet."
                                            )}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {step === STEPS.form && (
                            <AddressDrawerForm
                                formId={FORM_ID}
                                initialValues={formInitialValues}
                                onSubmit={handleFormSubmit}
                                onEditLocation={(values) => {
                                    setDraft(values)
                                    goToMap(intent)
                                }}
                            />
                        )}
                    </Box>

                    <Stack
                        sx={{
                            flexShrink: 0,
                            gap: '12px',
                            px: { xs: '16px', sm: '24px' },
                            pt: '16px',
                            pb: { xs: '16px', sm: '24px' },
                            borderTop: (theme) =>
                                `1px solid ${theme.palette.divider}`,
                            backgroundColor: (theme) =>
                                theme.palette.background.paper,
                        }}
                    >
                        {step === STEPS.list && (
                            <>
                                <Button
                                    fullWidth
                                    startIcon={
                                        locatingCurrentPosition ? (
                                            <CircularProgress
                                                size={16}
                                                color="inherit"
                                            />
                                        ) : (
                                            <GpsFixedIcon
                                                sx={{ fontSize: 16 }}
                                            />
                                        )
                                    }
                                    disabled={locatingCurrentPosition}
                                    onClick={handleUseCurrentLocation}
                                    sx={primaryButtonSx}
                                >
                                    {t('Use Current Location')}
                                </Button>
                                <Button
                                    fullWidth
                                    startIcon={
                                        <MapOutlinedIcon sx={{ fontSize: 16 }} />
                                    }
                                    onClick={() => goToMap(INTENTS.relocate)}
                                    sx={secondaryButtonSx}
                                >
                                    {t('Set From map')}
                                </Button>
                            </>
                        )}

                        {step === STEPS.map &&
                            (geoCodeLoading ? (
                                <Button fullWidth sx={primaryButtonSx}>
                                    <AnimationDots
                                        sx={{ height: '20px' }}
                                        size="0px"
                                    />
                                </Button>
                            ) : (
                                <Button
                                    fullWidth
                                    disabled={
                                        inZone === false ||
                                        !zoneId ||
                                        !hasMapLocation
                                    }
                                    onClick={handleConfirmLocation}
                                    sx={primaryButtonSx}
                                >
                                    {t('Confirm Location')}
                                </Button>
                            ))}

                        {step === STEPS.form && (
                            <Stack direction="row" gap="20px">
                                <Button
                                    fullWidth
                                    onClick={() => {
                                        setDraft(null)
                                        setEditingAddress(null)
                                        if (showList) {
                                            setStep(STEPS.list)
                                            return
                                        }
                                        onClose()
                                    }}
                                    sx={secondaryButtonSx}
                                >
                                    {t('Cancel')}
                                </Button>
                                <Button
                                    fullWidth
                                    type="submit"
                                    form={FORM_ID}
                                    disabled={adding || updating}
                                    sx={primaryButtonSx}
                                >
                                    {adding || updating ? (
                                        <AnimationDots
                                            sx={{ height: '20px' }}
                                            size="0px"
                                        />
                                    ) : (
                                        t('Save Address')
                                    )}
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </Drawer>
        </RTL>
    )
}

export default AddressDrawer
