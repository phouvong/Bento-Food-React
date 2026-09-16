import React, { useEffect, useState } from 'react'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { CustomTypography } from '../../custom-tables/Tables.style'
import { IconButton, Modal, Stack, Typography, alpha } from '@mui/material'
import { t } from 'i18next'
import { useTheme } from '@mui/material/styles'
import DeleteAddress from './DeleteAddress'
import { CustomDivWithBorder } from './Address.style'
import FmdGoodIcon from '@mui/icons-material/FmdGood'
import ApartmentIcon from '@mui/icons-material/Apartment'
import { RTL } from '../../RTL/RTL'
import MapWithSearchBox from '../../google-map/MapWithSearchBox'
import AddressForm from './AddressForm'
import { useMutation, useQuery } from 'react-query'
import { AddressApi } from '@/hooks/react-query/config/addressApi'
import { useDispatch, useSelector } from 'react-redux'
import { ProfileApi } from '@/hooks/react-query/config/profileApi'
import CloseIcon from '@mui/icons-material/Close'
import toast from 'react-hot-toast'
import { setLocation } from '@/redux/slices/addressData'
import { onErrorResponse } from '@/components/ErrorResponse'
import { setGuestUserInfo } from '@/redux/slices/guestUserInfo'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Menu, MenuItem, Box, Chip } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'

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

const AddressCard = ({ address, refetch, isDefault, setIsDefault, onEdit }) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const [open, setOpen] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [addressSymbol, setAddressSymbol] = useState('')
    const [rerenderMap, setRerenderMap] = useState(false)
    const languageDirection = localStorage.getItem('direction')
    const { token } = useSelector((state) => state.userToken)
    const { location, formatted_address } = useSelector(
        (state) => state.addressData
    )
    //const { data, isError } = useQuery(['profile-info'], ProfileApi.profileInfo)
    useEffect(() => {
        if (
            address?.address_type === 'home' ||
            address?.address_type === 'Home'
        ) {
            setAddressSymbol(
                <HomeIcon
                    sx={{
                        width: '20px',
                        height: '20px',
                        color: theme.palette.primary.main,
                    }}
                />
            )
        } else if (
            address.address_type === 'Office' ||
            address.address_type === 'office'
        ) {
            setAddressSymbol(
                <ApartmentIcon
                    sx={{
                        width: '20px',
                        height: '20px',
                        color: theme.palette.primary.main,
                    }}
                />
            )
        } else {
            setAddressSymbol(
                <FmdGoodIcon
                    sx={{
                        width: '20px',
                        height: '20px',
                        color: theme.palette.primary.main,
                    }}
                />
            )
        }
    }, [])

    const { mutate, isLoading, error } = useMutation(
        'address-update',
        AddressApi.editAddress,
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

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }
    const handleEditAddress = () => {
        handleClose()
        if (onEdit) {
            onEdit(address)
            return
        }
        dispatch(
            setLocation({ lat: address?.latitude, lng: address?.longitude })
        )
        setRerenderMap((prev) => !prev)
        setOpen(true)
    }
    const handleDeleteClick = () => {
        // We will keep the Popover logic for delete confirmation if it's already there,
        // or we can just trigger the deletion logic.
        // The previous code used handleClick for the DeleteIcon to open CustomPopover.
        // I will keep that logic.
    }
    const handleSetDefault = (id) => {
        handleClose()
        setIsDefault(id)
    }
    const formSubmitHandler = (values) => {
        let newData = {
            ...values,
            id: address?.id,
        }
        if (token) {
            mutate(newData)
        } else {
            dispatch(setGuestUserInfo(newData))
            setOpen(false)
        }
    }
    const convertPhoneNumber = (phoneNumber) => {
        if (phoneNumber.charAt(0) === '+') {
            return phoneNumber
        } else {
            return `+${phoneNumber}`
        }
    }

    return (
        <CustomDivWithBorder
            sx={{
                p: '16px',
                height: '100%',
                transition: 'border-color .15s ease',
                '&:hover': {
                    borderColor: 'primary.main',
                },
            }}
        >
            <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                gap="8px"
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    gap="12px"
                    minWidth={0}
                >
                    <Box
                        sx={{
                            width: '44px',
                            height: '44px',
                            flexShrink: 0,
                            borderRadius: '50%',
                            backgroundColor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.primary.main, 0.1)
                                    : theme.palette.sectionBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {addressSymbol}
                    </Box>
                    <Stack minWidth={0} gap="2px">
                        <Stack
                            direction="row"
                            alignItems="center"
                            flexWrap="wrap"
                            gap="8px"
                        >
                            <Typography
                                fontSize="14px"
                                fontWeight="600"
                                sx={{ textTransform: 'capitalize' }}
                            >
                                {t(address?.address_type)}
                            </Typography>
                            {isDefault === address?.id && (
                                <Chip
                                    label={t('Default')}
                                    color="primary"
                                    size="small"
                                    sx={{
                                        fontSize: '12px',
                                        height: '18px',
                                        borderRadius: '4px',
                                        '& .MuiChip-label': {
                                            px: '6px',
                                        },
                                    }}
                                />
                            )}
                        </Stack>
                        <Typography
                            fontSize="13px"
                            fontWeight="400"
                            color={theme.palette.neutral[500]}
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: '2',
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            {address?.address}
                        </Typography>
                    </Stack>
                </Stack>
                <IconButton
                    onClick={handleClick}
                    sx={{ p: '4px', flexShrink: 0 }}
                >
                    <MoreVertIcon sx={{ fontSize: '20px' }} />
                </IconButton>
            </Stack>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: '4px',
                            minWidth: '180px',
                            borderRadius: '12px',
                            p: '6px',
                        },
                    },
                }}
            >
                <MenuItem
                    onClick={handleEditAddress}
                    sx={{
                        alignItems: 'center',
                        gap: '10px',
                        px: '10px',
                        py: '9px',
                        borderRadius: '8px',
                        color: 'text.primary',
                        '&:hover': {
                            backgroundColor: (theme) =>
                                theme.palette.neutral[200],
                        },
                    }}
                >
                    <i
                        className="fi fi-rr-map-marker-edit"
                        style={{
                            fontSize: '16px',
                            lineHeight: 1,
                            display: 'inline-flex',
                        }}
                    />
                    <Typography fontSize="14px" fontWeight={500}>
                        {t('Edit')}
                    </Typography>
                </MenuItem>
                {isDefault !== address?.id && (
                    <MenuItem
                        onClick={() => handleSetDefault(address?.id)}
                        sx={{
                            alignItems: 'center',
                            gap: '10px',
                            px: '10px',
                            py: '9px',
                            borderRadius: '8px',
                            color: 'text.primary',
                            '&:hover': {
                                backgroundColor: (theme) =>
                                    theme.palette.neutral[200],
                            },
                        }}
                    >
                        <i
                            className="fi fi-br-badge-check"
                            style={{
                                fontSize: '16px',
                                lineHeight: 1,
                                display: 'inline-flex',
                            }}
                        />
                        <Typography fontSize="14px" fontWeight={500}>
                            {t('Set as Default')}
                        </Typography>
                    </MenuItem>
                )}
                <MenuItem
                    onClick={() => {
                        handleClose()
                        setOpenDelete(true)
                    }}
                    sx={{
                        alignItems: 'center',
                        gap: '10px',
                        px: '10px',
                        py: '9px',
                        borderRadius: '8px',
                        color: 'error.main',
                        '&:hover': {
                            backgroundColor: (theme) =>
                                alpha(theme.palette.error.main, 0.08),
                        },
                    }}
                >
                    <i
                        className="fi fi-rr-trash"
                        style={{
                            fontSize: '16px',
                            lineHeight: 1,
                            display: 'inline-flex',
                        }}
                    />
                    <Typography fontSize="14px" fontWeight={500}>
                        {t('Delete')}
                    </Typography>
                </MenuItem>
            </Menu>

            {openDelete && (
                <Modal
                    open={openDelete}
                    onClose={() => setOpenDelete(false)}
                    aria-labelledby="delete-address-modal"
                >
                    <Stack
                        sx={{
                            ...style,
                            p: '2rem',
                            width: { xs: '90%', sm: '400px' },
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                        spacing={2}
                    >
                        <DeleteAddress
                            addressId={address?.id}
                            refetch={refetch}
                            handleClose={() => setOpenDelete(false)}
                        />
                    </Stack>
                </Modal>
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
                                flexDirection={{ xs: 'column', sm: 'row' }}
                                gap="15px"
                            >
                                <MapWithSearchBox />
                                <AddressForm
                                    deliveryAddress={formatted_address}
                                    personName={address?.contact_person_name}
                                    phone={address?.contact_person_number}
                                    lat={
                                        address?.latitude || location?.lat || ''
                                    }
                                    lng={
                                        address?.longitude ||
                                        location?.lng ||
                                        ''
                                    }
                                    formSubmit={formSubmitHandler}
                                    isLoading={isLoading}
                                    editAddress={true}
                                    address={address}
                                />
                            </CustomStackFullWidth>
                        </RTL>
                    </Stack>
                </Modal>
            )}
        </CustomDivWithBorder>
    )
}

export default AddressCard
