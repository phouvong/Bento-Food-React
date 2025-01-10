import React, { useState } from 'react'
import { IconButton, Modal, Stack, useMediaQuery } from '@mui/material'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery } from 'react-query'
import { ProfileApi } from '@/hooks/react-query/config/profileApi'
import { AddressApi } from '@/hooks/react-query/config/addressApi'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import CloseIcon from '@mui/icons-material/Close'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import AddressForm from './AddressForm'
import { onErrorResponse } from '../../ErrorResponse'
import { useTheme } from '@mui/material/styles'
import { RTL } from '../../RTL/RTL'
import { PrimaryButton } from '../../products-page/FoodOrRestaurant'
import CreateIcon from '@mui/icons-material/Create'
import AddLocationIcon from '@mui/icons-material/AddLocation'
import { setGuestUserInfo } from '@/redux/slices/guestUserInfo'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import MapWithSearchBox from '../../google-map/MapWithSearchBox'
import { useGeolocated } from 'react-geolocated'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import { setLocation } from '@/redux/slices/addressData'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '1080px',
    bgcolor: 'background.paper',
    border: '1px solid #fff',
    boxShadow: 24,
    borderRadius: '10px',
}
const AddNewAddress = ({
    refetch,
    buttonbg,
    guestUser,
    orderType,
    setOpenGuestUserModal,
    setEditAddress,
}) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const [rerenderMap, setRerenderMap] = useState(false)
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)
    const { location, formatted_address } = useSelector(
        (state) => state.addressData
    )
    const [open, setOpen] = useState(false)
    const [searchKey, setSearchKey] = useState({ description: '' })
    const [value, setValue] = useState()
    const { token } = useSelector((state) => state.userToken)
    const isXs = useMediaQuery(theme.breakpoints.down('sm'))

    const { data, isError } = useQuery(['profile-info'], ProfileApi.profileInfo)
    const clickAddNew = () => {
        if (guestUser && orderType === 'take_away') {
            setEditAddress?.(true)
            setOpenGuestUserModal(true)
        } else {
            setEditAddress?.(true)
            setOpen(true)
        }
    }
    const handleChange = (e) => {
        setValue(e.target.value)
    }
    const { mutate, isLoading, error } = useMutation(
        'address-add',
        AddressApi.addNewAddress,
        {
            onSuccess: (response) => {
                toast.success(response?.data?.message)

                if (response?.data) {
                    refetch()
                    setOpen(false)
                }
            },
            onError: (error) => {
                onErrorResponse(error)
            },
        }
    )
    const formSubmitHandler = (values) => {
        if (token) {
            mutate(values)
        } else {
            dispatch(setGuestUserInfo(values))
            setOpen(false)
        }
    }
    const languageDirection = localStorage.getItem('direction')
    const primaryColor = theme.palette.primary.main
    const whiteColor = theme.palette.whiteContainer.main
    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 5000,
            isGeolocationEnabled: true,
        })
    const setUserCurrentLocation = async () => {
        if (coords) {
            dispatch(
                setLocation({
                    lat: coords?.latitude,
                    lng: coords?.longitude,
                })
            )

            setRerenderMap((prvMap) => !prvMap)
        }
    }
    return (
        <>
            {guestUser === 'true' ? (
                <IconButton onClick={clickAddNew} padding="0px">
                    <CreateIcon
                        sx={{
                            width: '18px',
                            height: '20px',
                            color: (theme) => theme.palette.primary.main,
                        }}
                    />
                </IconButton>
            ) : (
                <PrimaryButton
                    variant={buttonbg === 'true' ? '' : 'outlined'}
                    sx={{
                        borderRadius: buttonbg === 'true' ? '5px' : '20px',
                        minWidth: '0',
                        justifyContent: 'left',
                        padding: isXs
                            ? '5px'
                            : buttonbg === 'true'
                            ? '5px 0px'
                            : '5px 10px',
                        '&:hover': {
                            backgroundColor: (theme) =>
                                theme.palette.neutral[100],
                        },
                    }}
                    onClick={clickAddNew}
                    backgroundColor={buttonbg === 'true' ? '' : ''}
                >
                    <Stack
                        direction="row"
                        spacing={0.5}
                        color={theme.palette.neutral[1000]}
                        alignItems="center"
                        justifyContent="center"
                    >
                        {buttonbg === 'true' && (
                            <AddCircleOutlineIcon
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    color: primaryColor,
                                }}
                            />
                        )}
                        <Typography
                            fontSize={{
                                xs: '12px',
                                sm: '12px',
                                md: buttonbg === 'true' ? '12px' : '14px',
                            }}
                            fontWeight={buttonbg === 'true' ? '500' : '400'}
                            color={
                                buttonbg === 'true'
                                    ? (theme) => theme.palette.primary.main
                                    : (theme) => theme.palette.primary.main
                            }
                        >
                            {t('Add Address')}
                        </Typography>

                        {buttonbg !== 'true' && (
                            <AddLocationIcon
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    color:
                                        buttonbg === 'true'
                                            ? whiteColor
                                            : primaryColor,
                                }}
                            />
                        )}
                    </Stack>
                </PrimaryButton>
            )}

            {open && (
                <Modal
                    open={open}
                    onClose={() => {
                        setOpen(false)
                    }}
                    aria-labelledby="child-modal-title"
                    aria-describedby="child-modal-description"
                >
                    <Stack
                        sx={style}
                        width={{ xs: '90%', sm: '70%' }}
                        spacing={2}
                        padding={{ xs: '10px', md: '25px' }}
                    >
                        <button
                            onClick={() => setOpen(false)}
                            className="closebtn"
                        >
                            <CloseIcon sx={{ fontSize: '16px' }} />
                        </button>

                        <RTL direction={languageDirection}>
                            <CustomStackFullWidth
                                sx={{ position: 'relative' }}
                                flexDirection={{ xs: 'column', sm: 'row' }}
                                gap={{ xs: '10px', md: '15px' }}
                            >
                                <MapWithSearchBox
                                    rerenderMap={rerenderMap}
                                    coords={coords}
                                    orderType={orderType}
                                    mapHeight="200px"
                                />
                                <IconButton
                                    sx={{
                                        background: (theme) =>
                                            theme.palette.neutral[100],
                                        padding: '10px',
                                        position: 'absolute',
                                        bottom: {
                                            xs: '55%',
                                            sm: '50%',
                                            md: '20px',
                                        },
                                        left: '20px',
                                    }}
                                    onClick={setUserCurrentLocation}
                                >
                                    <GpsFixedIcon color="primary" />
                                </IconButton>
                                <AddressForm
                                    deliveryAddress={formatted_address}
                                    personName={data?.data?.f_name}
                                    phone={data?.data?.phone}
                                    lat={location?.lat || ''}
                                    lng={location?.lng || ''}
                                    formSubmit={formSubmitHandler}
                                    isLoading={isLoading}
                                />
                            </CustomStackFullWidth>
                        </RTL>
                    </Stack>
                </Modal>
            )}
        </>
    )
}

export default React.memo(AddNewAddress)
