import React, { useState } from 'react'
import { alpha, Box, Button, Drawer, Typography, useTheme, Stack } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DeliveryAddress from '../../../checkout-page/DeliveryAddress'
import { CustomButtonPrimary } from '@/styled-components/CustomButtons.style'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MapWithSearchBox from '../../../google-map/MapWithSearchBox'
import { getToken } from '../../../checkout-page/functions/getGuestUserId'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { useDispatch, useSelector } from 'react-redux'
import { useGetLocation } from '@/utils/custom-hook/useGetLocation'
import { AnimationDots } from '../../../products-page/AnimationDots'
import IconButton from '@mui/material/IconButton'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import { setLocation } from '@/redux/slices/addressData'
import { useQuery } from 'react-query'
import { GoogleApi } from '@/hooks/react-query/config/googleApi'
import { setUserLocationUpdate } from '@/redux/slices/global'
import { RTL } from '../../../RTL/RTL'
import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import { he } from 'date-fns/locale'

const AddressReselectPopover = (props) => {
    const token = getToken()
    const theme = useTheme()
    const dispatch = useDispatch()
    const [inZone, setInZone] = React.useState(null)
    const [rerenderMap, setRerenderMap] = useState(false)
    const {
        coords,
        anchorEl,
        setMapOpen,
        mapOpen,
        onClose,
        open,
        t,
        address,
        setAddress,
        ...other
    } = props
    //const geoCodeLoading = false
    const { geoCodeLoading, setLocationEnabled } = useGetLocation(coords)
    const { location, formatted_address, zoneId } = useSelector(
        (state) => state.addressData
    )
    const { userLocationUpdate } = useSelector((state) => state.globalSettings)
    const languageDirection = typeof window !== 'undefined' ? localStorage.getItem('direction') : 'ltr'
    const handleSuccess = () => {
        if (getToken()) {
            if (!mapOpen && open) {
                getLocation()
            }
        } else {
            if (mapOpen && open) {
                getLocation()
            }
        }
    }

    const { refetch: refetchCurrentLocation } = useQuery(
        ['geocode-api', location],
        async () => GoogleApi.geoCodeApi(location),
        {
            onSuccess: handleSuccess,
        }
    )

    console.log({ zoneId });

    const getLocation = () => {
        if (zoneId && formatted_address && location) {
            localStorage.setItem('zoneid', zoneId)
            localStorage.setItem('location', formatted_address)
            localStorage.setItem('currentLatLng', JSON.stringify(location))
            CustomToaster('success', 'New location has been set.')
            setAddress(null)
            dispatch(setUserLocationUpdate(!userLocationUpdate))
            onClose()
            window.location.reload()
        }
    }
    const setUserCurrentLocation = async () => {
        if (coords) {
            setLocationEnabled(true)
            dispatch(
                setLocation({
                    lat: coords?.latitude,
                    lng: coords?.longitude,
                })
            )
            if (zoneId) {
                localStorage.setItem('zoneid', zoneId)
            }
            await refetchCurrentLocation()
            setRerenderMap((prvMap) => !prvMap)
        }
    }

    const isListView = token && !mapOpen

    return (
        <RTL direction={languageDirection}>
            <Drawer
                anchor="left"
                open={open}
                onClose={onClose}
                variant="temporary"
                sx={{
                    zIndex: 1300,
                    '& .MuiDrawer-paper': {
                        width: { xs: '100vw', sm: '460px', md: '500px' },
                        maxWidth: '100vw',
                        backgroundColor: (theme) =>
                            theme.palette.background.paper,
                    },
                }}
            >
                <Stack sx={{ height: '100%' }}>
                    {/* Header */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            px: 2,
                            py: 1.25,
                            borderBottom: (theme) =>
                                `1px solid ${theme.palette.neutral[200]}`,
                            backgroundColor: (theme) =>
                                theme.palette.background.paper,
                            position: 'sticky',
                            top: 0,
                            zIndex: 3,
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            gap={1.25}
                            flex={1}
                            minWidth={0}
                        >
                            <IconButton
                                onClick={() => {
                                    if (mapOpen) {
                                        setMapOpen(false)
                                        setInZone(null)
                                    } else {
                                        onClose()
                                    }
                                }}
                                size="small"
                                sx={{
                                    p: '6px',
                                    backgroundColor: (theme) =>
                                        alpha(theme.palette.neutral[300], 0.4),
                                    '&:hover': {
                                        backgroundColor: (theme) =>
                                            theme.palette.neutral[300],
                                    },
                                }}
                            >
                                <ArrowBackIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <Stack minWidth={0}>
                                <Typography
                                    fontWeight={700}
                                    fontSize={{ xs: 15, md: 16 }}
                                    sx={{
                                        lineHeight: 1.25,
                                        color: (theme) =>
                                            theme.palette.neutral[1000],
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {mapOpen
                                        ? t('Pick a location')
                                        : t('Delivery address')}
                                </Typography>
                                <Typography
                                    fontSize={11.5}
                                    sx={{
                                        lineHeight: 1.3,
                                        color: (theme) =>
                                            theme.palette.neutral[600],
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {mapOpen
                                        ? t(
                                              'Drag the pin or search to set your address'
                                          )
                                        : token
                                        ? t(
                                              'Choose where you want to receive your order'
                                          )
                                        : t(
                                              'Type your address or pick from map'
                                          )}
                                </Typography>
                            </Stack>
                        </Stack>
                        <IconButton
                            onClick={onClose}
                            className="closebtn"
                            size="small"
                            sx={{ p: '6px', ml: 1, flexShrink: 0 }}
                        >
                            <CloseIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Stack>

                    {/* Scrollable body */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            px: 2,
                            pt: 1.5,
                            pb: 1.5,
                        }}
                    >
                        {isListView ? (
                            <Stack spacing={2}>
                                {/* Hero quick-action: current location */}
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    gap={1.25}
                                    onClick={setUserCurrentLocation}
                                    sx={{
                                        cursor: 'pointer',
                                        p: 1.25,
                                        borderRadius: '12px',
                                        background: (theme) =>
                                            `linear-gradient(135deg, ${alpha(
                                                theme.palette.primary.main,
                                                0.1
                                            )} 0%, ${alpha(
                                                theme.palette.primary.main,
                                                0.02
                                            )} 100%)`,
                                        border: (theme) =>
                                            `1px solid ${alpha(
                                                theme.palette.primary.main,
                                                0.22
                                            )}`,
                                        transition: 'all .15s ease',
                                        '&:hover': {
                                            background: (theme) =>
                                                alpha(
                                                    theme.palette.primary.main,
                                                    0.14
                                                ),
                                            borderColor: (theme) =>
                                                theme.palette.primary.main,
                                        },
                                    }}
                                >
                                    <Stack
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '10px',
                                            backgroundColor: (theme) =>
                                                theme.palette.primary.main,
                                            color: '#fff',
                                            flexShrink: 0,
                                            boxShadow: (theme) =>
                                                `0 6px 14px ${alpha(
                                                    theme.palette.primary.main,
                                                    0.32
                                                )}`,
                                        }}
                                    >
                                        <GpsFixedIcon sx={{ fontSize: 20 }} />
                                    </Stack>
                                    <Stack flex={1} minWidth={0}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight={700}
                                            sx={{
                                                color: (theme) =>
                                                    theme.palette
                                                        .neutral[1000],
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {t('Use current location')}
                                        </Typography>
                                        <Typography
                                            fontSize={11.5}
                                            sx={{
                                                color: (theme) =>
                                                    theme.palette.neutral[600],
                                                lineHeight: 1.35,
                                                mt: '2px',
                                            }}
                                        >
                                            {t(
                                                'Detect automatically using your device'
                                            )}
                                        </Typography>
                                    </Stack>
                                    <ChevronRightIcon
                                        sx={{
                                            fontSize: 22,
                                            color: (theme) =>
                                                theme.palette.primary.main,
                                            flexShrink: 0,
                                        }}
                                    />
                                </Stack>

                                {/* Section label */}
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <Typography
                                        fontSize={11}
                                        fontWeight={700}
                                        sx={{
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            color: (theme) =>
                                                theme.palette.neutral[600],
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {t('Saved addresses')}
                                    </Typography>
                                    <Box
                                        sx={{
                                            flex: 1,
                                            height: '1px',
                                            backgroundColor: (theme) =>
                                                theme.palette.neutral[200],
                                        }}
                                    />
                                </Stack>

                                {/* Saved addresses list */}
                                <DeliveryAddress
                                    setAddress={setAddress}
                                    address={address}
                                    hideAddressSelectionField="true"
                                    renderOnNavbar="true"
                                    token={token}
                                    maxHeight="50vh"
                                />
                            </Stack>
                        ) : (
                            <Stack spacing={1.5}>
                                <Box
                                    sx={{
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: (theme) =>
                                            `1px solid ${theme.palette.neutral[200]}`,
                                    }}
                                >
                                    <MapWithSearchBox
                                        isGps={true}
                                        rerenderMap={rerenderMap}
                                        orderType="dd"
                                        padding="0px"
                                        coords={coords}
                                        mapHeight="430px"
                                        handleAgreeLocation={
                                            setUserCurrentLocation
                                        }
                                        setInZone={setInZone}
                                        inZone={inZone}
                                    />
                                </Box>
                                {inZone === false && (
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        gap={1}
                                        sx={{
                                            p: 1.25,
                                            borderRadius: '10px',
                                            backgroundColor: (theme) =>
                                                alpha(
                                                    theme.palette.error.main,
                                                    0.08
                                                ),
                                            border: (theme) =>
                                                `1px solid ${alpha(
                                                    theme.palette.error.main,
                                                    0.2
                                                )}`,
                                        }}
                                    >
                                        <Typography
                                            fontSize={12.5}
                                            sx={{
                                                color: (theme) =>
                                                    theme.palette.error.main,
                                            }}
                                        >
                                            {t(
                                                "We don't deliver to this location yet."
                                            )}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                        )}
                    </Box>

                    {/* Sticky footer action */}
                    <Box
                        sx={{
                            px: 2,
                            py: 1.25,
                            borderTop: (theme) =>
                                `1px solid ${theme.palette.neutral[200]}`,
                            backgroundColor: (theme) =>
                                theme.palette.background.paper,
                            boxShadow: '0 -4px 14px rgba(15,23,42,0.04)',
                        }}
                    >
                        {isListView ? (
                            <Button
                            variant='contained'
                                paddingTop="12px"
                                paddingBottom="12px"
                                sx={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                }}
                                onClick={() => setMapOpen(true)}
                            >
                                <AddCircleOutlineIcon sx={{ fontSize: 18, mr: 1 }} />
                                {t('Pick from Map')}
                            </Button>
                        ) : geoCodeLoading ? (
                            <Button
                                fullWidth
                                sx={{
                                    py: '12px',
                                    color: `${theme.palette.whiteText.main} !important`,
                                    backgroundColor: theme.palette.primary.main,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: 14,
                                    borderRadius: '10px',
                                    '&:hover': {
                                        backgroundColor:
                                            theme.palette.primary.dark,
                                    },
                                }}
                            >
                                <AnimationDots
                                    sx={{ height: '20px' }}
                                    size="0px"
                                />
                            </Button>
                        ) : (
                            <Button
                                fullWidth
                                disabled={inZone === false || !zoneId}
                                onClick={getLocation}
                                sx={{
                                    py: '12px',
                                    color: `${theme.palette.whiteText.main} !important`,
                                    backgroundColor: theme.palette.primary.main,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: 14,
                                    borderRadius: '10px',
                                    '&:hover': {
                                        backgroundColor:
                                            theme.palette.primary.dark,
                                    },
                                    '&.Mui-disabled': {
                                        color: theme.palette.text.disabled,
                                        backgroundColor:
                                            theme.palette.action
                                                .disabledBackground,
                                    },
                                }}
                            >
                                {t('Confirm location')}
                            </Button>
                        )}
                    </Box>
                </Stack>
            </Drawer>
        </RTL>
    )
}

AddressReselectPopover.propTypes = {}

export default AddressReselectPopover
