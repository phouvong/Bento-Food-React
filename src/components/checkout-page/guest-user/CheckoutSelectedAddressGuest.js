import React, { useState } from 'react'
import { Button, Modal, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useGeolocated } from 'react-geolocated'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'

import AddressSelectionField from '../AddressSelectionField'
import CustomPopover from '../../custom-popover/CustomPopover'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { PrimaryButton } from '@/components/products-page/FoodOrRestaurant'
import MapWithSearchBox from '@/components/google-map/MapWithSearchBox'
import { ACTIONS } from '@/components/checkout-page/states/additionalInformationStates'
import { setLocation } from '@/redux/slices/addressData'
import {
    normalizeAddressValues,
    setLocalLocation,
} from '@/components/checkout-page/functions/addressHelpers'

const mapModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '92%', sm: '75%', md: '65%' },
    maxWidth: '900px',
    bgcolor: 'background.paper',
    borderRadius: '10px',
    boxShadow: 24,
    p: { xs: '12px', md: '20px' },
}

const CheckoutSelectedAddressGuest = ({
    address,
    setAddress,
    additionalInformationDispatch,
    coverageLabel,
}) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState(null)
    const [mapModalOpen, setMapModalOpen] = useState(false)
    const [rerenderMap, setRerenderMap] = useState(false)
    const { location, formatted_address } = useSelector(
        (state) => state.addressData
    )
    const { coords } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: false,
        },
        userDecisionTimeout: 5000,
        isGeolocationEnabled: true,
    })

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    const setAdditionalInformation = (values = {}) => {
        if (additionalInformationDispatch) {
            additionalInformationDispatch({
                type: ACTIONS.setStreetNumber,
                payload: values?.road || '',
            })
            additionalInformationDispatch({
                type: ACTIONS.setHouseNumber,
                payload: values?.house || '',
            })
            additionalInformationDispatch({
                type: ACTIONS.setFloor,
                payload: values?.floor || '',
            })
            additionalInformationDispatch({
                type: ACTIONS.setAddressType,
                payload: values?.address_type || '',
            })
        }
    }

    const handleQuickAddressSelection = (values = {}) => {
        const normalizedAddress = normalizeAddressValues(values)
        setAddress(normalizedAddress)
        setAdditionalInformation(normalizedAddress)
        setLocalLocation(normalizedAddress)
        setMapModalOpen(false)
        handleClose()
    }

    const handleUseCurrentLocation = () => {
        if (!coords) return
        const lat = coords?.latitude
        const lng = coords?.longitude
        dispatch(setLocation({ lat, lng }))
        setRerenderMap((prevState) => !prevState)
        handleQuickAddressSelection({
            address: formatted_address || t('Selected Address'),
            latitude: lat,
            longitude: lng,
            address_type: 'Selected Address',
        })
    }

    const handleMapCurrentLocation = () => {
        if (!coords) return
        dispatch(
            setLocation({
                lat: coords?.latitude,
                lng: coords?.longitude,
            })
        )
        setRerenderMap((prevState) => !prevState)
    }

    const handleSetFromMap = () => {
        handleClose()
        setMapModalOpen(true)
    }

    const handlePickLocationFromMap = () => {
        if (!location?.lat || !location?.lng) return
        handleQuickAddressSelection({
            address: formatted_address || t('Selected Address'),
            latitude: location?.lat,
            longitude: location?.lng,
            address_type: 'Selected Address',
        })
    }

    return (
        <>
            <AddressSelectionField
                theme={theme}
                address={address}
                t={t}
                onEdit={handleClick}
                coverageLabel={coverageLabel}
            />
            <CustomPopover
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                handleClose={handleClose}
                padding="20px 20px 20px"
                bgColor={theme.palette.background.paper}
            >
                <CustomStackFullWidth spacing={1}>
                    <Button
                        variant="contained"
                        startIcon={<GpsFixedIcon />}
                        onClick={handleUseCurrentLocation}
                        fullWidth
                        sx={{
                            borderRadius: '16px',
                            backgroundColor: (theme) =>
                                theme.palette.neutral[300],
                            color: (theme) => theme.palette.neutral[1000],
                            fontWeight: 400,
                            textTransform: 'none',
                            boxShadow: 'none',
                            py: 1.2,
                            '& .MuiButton-startIcon': {
                                color: (theme) => theme.palette.primary.main,
                            },
                            '&:hover': {
                                backgroundColor: (theme) =>
                                    theme.palette.neutral[200],
                                boxShadow: 'none',
                            },
                        }}
                    >
                        {t('Use Current Location')}
                    </Button>
                    <Button
                        variant="text"
                        startIcon={<MapOutlinedIcon />}
                        onClick={handleSetFromMap}
                        fullWidth
                        sx={{
                            borderRadius: '16px',
                            color: (theme) => theme.palette.primary.main,
                            fontWeight: 400,
                            textTransform: 'none',
                            fontSize: '16px',
                            mt: 0.5,
                            '& .MuiButton-startIcon': {
                                color: (theme) => theme.palette.primary.main,
                            },
                        }}
                    >
                        {t('Set from map')}
                    </Button>
                </CustomStackFullWidth>
            </CustomPopover>
            <Modal
                open={mapModalOpen}
                onClose={() => setMapModalOpen(false)}
                aria-labelledby="pick-location-on-map"
            >
                <Stack sx={mapModalStyle} spacing={2}>
                    <Typography fontWeight={600} fontSize="16px" color={theme.palette.neutral[100]}>
                        {t('Set from map')}
                    </Typography>
                    <MapWithSearchBox
                        rerenderMap={rerenderMap}
                        coords={coords}
                        isGps
                        mapHeight="320px"
                        orderType="delivery"
                        handleAgreeLocation={handleMapCurrentLocation}
                    />
                    <Stack direction="row" justifyContent="flex-end" gap="10px">
                        <Button
                            variant="outlined"
                            onClick={() => setMapModalOpen(false)}
                            sx={{
                                color: (theme) => theme.palette.neutral[400],
                                borderColor: (theme) => theme.palette.neutral[300],
                                '&:hover': {
                                    borderColor: (theme) => theme.palette.neutral[400],
                                },
                            }}
                        >
                            {t('Cancel')}
                        </Button>
                        <PrimaryButton
                            variant="contained"
                            onClick={handlePickLocationFromMap}
                            disabled={!location?.lat || !location?.lng}
                        >
                            {t('Pick location')}
                        </PrimaryButton>
                    </Stack>
                </Stack>
            </Modal>
        </>
    )
}

export default CheckoutSelectedAddressGuest
