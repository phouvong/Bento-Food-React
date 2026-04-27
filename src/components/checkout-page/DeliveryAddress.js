import React, { useEffect, useState } from 'react'
import { Button, Stack, Typography, Modal } from '@mui/material'

import { DeliveryCaption, SaveAddressBox, InputField } from './CheckOut.style'
import { useQuery } from 'react-query'
import { AddressApi } from '@/hooks/react-query/config/addressApi'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { onErrorResponse, onSingleErrorResponse } from '../ErrorResponse'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import AddressSelectionField from './AddressSelectionField'
import AddressSelectionList from './order-summary/AddressSelectionList'
import CustomPopover from '../custom-popover/CustomPopover'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import AddNewAddress from '@/components/user-info/address/AddNewAddress'
import { PrimaryButton } from '@/components/products-page/FoodOrRestaurant'
import { ACTIONS } from '@/components/checkout-page/states/additionalInformationStates'
import MapWithSearchBox from '@/components/google-map/MapWithSearchBox'
import { useDispatch, useSelector } from 'react-redux'
import { useGeolocated } from 'react-geolocated'
import { setLocation } from '@/redux/slices/addressData'

const getZoneWiseAddresses = (addresses, restaurantId) => {
    const newArray = []
    addresses.forEach(
        (item) => item.zone_ids.includes(restaurantId) && newArray.push(item)
    )
    return newArray
}
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
const DeliveryAddress = ({
    setAddress,
    address,
    hideAddressSelectionField,
    handleSize,
    renderOnNavbar,
    additionalInformationDispatch,
    restaurantId,
    token,
    handleAddressSetSuccess,
    maxHeight
}) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const [allAddress, setAllAddress] = useState()
    const [selectedAddress, setSelectedAddress] = useState({})
    const [data, setData] = useState(null)
    const [anchorEl, setAnchorEl] = useState(null)
    const [mapModalOpen, setMapModalOpen] = useState(false)
    const [rerenderMap, setRerenderMap] = useState(false)
    const dispatch = useDispatch()
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

    const mainAddress = {
        ...address,
    }
    const handleSuccess = (response) => {
        if (restaurantId) {
            const newObj = {
                ...response.data,
                addresses: getZoneWiseAddresses(
                    response.data.addresses,
                    restaurantId
                ),
            }
            setData(newObj)
        } else {
            setData(response.data)
        }
    }
    const { refetch, isRefetching } = useQuery(
        ['address-list'],
        AddressApi.addressList,
        {
            enabled: false,
            onSuccess: handleSuccess,
            onError: onSingleErrorResponse,
        }
    )
    useEffect(() => {
        if (token) {
            const apiRefetch = async () => {
                await refetch()
            }

            apiRefetch()
        }
    }, [restaurantId])
    useEffect(() => {
        data && setAllAddress([mainAddress, ...data.addresses])
    }, [data])

    const handleLatLng = (values) => {
        const normalizedAddress = normalizeAddressValues(values)
        if (renderOnNavbar === 'true') {
            setAddress(normalizedAddress)
            setLocalLocation(normalizedAddress)
        } else {
            setSelectedAddress(normalizedAddress)
        }
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    const normalizeAddressValues = (values = {}) => {
        const latitude = values?.latitude ?? values?.lat
        const longitude = values?.longitude ?? values?.lng
        return {
            ...values,
            latitude,
            longitude,
            lat: latitude,
            lng: longitude,
            address_type: values?.address_type || 'Selected Address',
        }
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

    const setLocalLocation = (values = {}) => {
        if (typeof window === 'undefined') return
        if (values?.latitude && values?.longitude) {
            localStorage.setItem(
                'currentLatLng',
                JSON.stringify({
                    lat: values.latitude,
                    lng: values.longitude,
                })
            )
        }
        if (values?.address) {
            localStorage.setItem('location', values.address)
        }
    }

    const handleQuickAddressSelection = (values = {}) => {
        const normalizedAddress = normalizeAddressValues(values)
        setSelectedAddress(normalizedAddress)
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

    const handleSelectedAddress = () => {
        const normalizedAddress = normalizeAddressValues(selectedAddress)
        setAddress(normalizedAddress)
        setAdditionalInformation(normalizedAddress)
        setLocalLocation(normalizedAddress)
        handleClose()
    }
    return (
        <>
            {!renderOnNavbar && (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <DeliveryCaption>{t('Delivery Addresses')}</DeliveryCaption>
                    <SaveAddressBox onClick={handleClick}>
                        <Typography
                            color={theme.palette.primary.main}
                            sx={{ cursor: 'pointer' }}
                            fontSize="12px"
                            // onClick={handleRoute}
                        >
                            {t('Saved Address')}
                        </Typography>
                    </SaveAddressBox>
                </Stack>
            )}
            {hideAddressSelectionField !== 'true' && (
                <AddressSelectionField
                    theme={theme}
                    address={address}
                    refetch={refetch}
                    t={t}
                />
            )}
            {renderOnNavbar === 'true' ? (
                <AddressSelectionList
                    data={data}
                    allAddress={data?.addresses}
                    handleLatLng={handleLatLng}
                    t={t}
                    address={address}
                    maxHeight={maxHeight}
                    renderOnNavbar={renderOnNavbar}
                />
            ) : (
                <SimpleBar style={{ maxHeight: 200 }}>
                    {/*<AddressSelectionList*/}
                    {/*    data={data}*/}
                    {/*    allAddress={allAddress}*/}
                    {/*    handleLatLng={handleLatLng}*/}
                    {/*    t={t}*/}
                    {/*    address={address}*/}
                    {/*    isRefetching={isRefetching}*/}
                    {/*    additionalInformationDispatch={additionalInformationDispatch}*/}
                    {/*/>*/}
                </SimpleBar>
            )}
            <CustomPopover
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                handleClose={handleClose}
                padding="20px 20px 20px"
            >
                <CustomStackFullWidth>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                        spacing={1}
                    >
                        <DeliveryCaption
                            no_margin_bottom="true"
                            no_margin_top="true"
                            textAlign="left"
                        >
                            {t('Saved Address')}
                        </DeliveryCaption>
                        <AddNewAddress refetch={refetch} buttonbg="true" />
                    </Stack>
                    <AddressSelectionList
                        data={data}
                        allAddress={data?.addresses}
                        handleLatLng={handleLatLng}
                        t={t}
                        address={address}
                        isRefetching={isRefetching}
                        additionalInformationDispatch={
                            additionalInformationDispatch
                        }
                        selectedAddress={selectedAddress}
                        renderOnNavbar={renderOnNavbar}
                        onUseCurrentLocation={handleUseCurrentLocation}
                        onSetFromMap={handleSetFromMap}
                    />
                    {data?.addresses?.length > 0 && (
                        <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                            witdh="100%"
                            pt=".5rem"
                            gap="10px"
                        >
                            <Button
                                variant="outlined"
                                sx={{
                                    color: (theme) =>
                                        theme.palette.neutral[400],
                                    borderColor: (theme) =>
                                        theme.palette.neutral[300],
                                    '&:hover': {
                                        borderColor: (theme) =>
                                            theme.palette.neutral[300], // Change border color on hover if needed
                                    },
                                }}
                                onClick={handleClose}
                            >
                                {t('Cancel')}
                            </Button>
                            <PrimaryButton
                                variant="contained"
                                onClick={handleSelectedAddress}
                            >
                                {t('Select')}
                            </PrimaryButton>
                        </Stack>
                    )}
                </CustomStackFullWidth>
            </CustomPopover>
            <Modal
                open={mapModalOpen}
                onClose={() => setMapModalOpen(false)}
                aria-labelledby="pick-location-on-map"
            >
                <Stack sx={mapModalStyle} spacing={2}>
                    <Typography fontWeight={600} fontSize="16px">
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
export default DeliveryAddress
