import React, { useEffect, useState } from 'react'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { CustomTypography } from '../../custom-tables/Tables.style'
import { IconButton, Modal, Stack, Typography, alpha } from '@mui/material'
import { t } from 'i18next'
import { useTheme } from '@mui/material/styles'
import DeleteAddress from './DeleteAddress'
import { CustomDivWithBorder } from './Address.style'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import FmdGoodIcon from '@mui/icons-material/FmdGood'
import ApartmentIcon from '@mui/icons-material/Apartment'
import DeleteIcon from '../../../assets/images/icons/DeleteIcon'
import EditLocationOutlinedIcon from '@mui/icons-material/EditLocationOutlined'
import CustomPopover from '../../custom-popover/CustomPopover'
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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
//import EditLocationOutlinedIcon from '@mui/icons-material/EditLocationOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HomeIcon from '@mui/icons-material/Home';

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

const AddressCard = ({ address, refetch, isDefault, setIsDefault }) => {
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
    console.log({ address })
    //const { data, isError } = useQuery(['profile-info'], ProfileApi.profileInfo)
    useEffect(() => {
        if (address?.address_type === 'home' || address?.address_type === 'Home') {
            setAddressSymbol(
                <HomeIcon
                    sx={{
                        width: '20px',
                        height: '20px',
                        color: theme.palette.primary.main,
                    }}
                />
            )
        } else if (address.address_type === 'Office' || address.address_type === 'office') {
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
                p: '1rem',
                borderRadius: '10px',
                height: '100%',
                position: 'relative',
                '&:hover': {
                    borderColor: 'primary.main',
                },
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        sx={{
                            p: '12px',
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
                    <Stack>
                        <Typography
                            fontSize="14px"
                            fontWeight="600"
                            sx={{ textTransform: 'capitalize' }}
                        >
                            {t(address?.address_type)}
                            {isDefault === address?.id && (
                                <Chip
                                    label={t('Default')}
                                    color="primary"
                                    size="small"
                                    sx={{
                                        ml: '10px',
                                        fontSize: '12px',
                                        height: '16px',
                                        borderRadius: '2px',
                                        '& .MuiChip-label': {
                                            px: '5px',
                                        },
                                    }}
                                />
                            )}
                        </Typography>
                        <Typography
                            fontSize="14px"
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
                    sx={{
                        p: '5px',
                        position: 'absolute',
                        top: '10px',
                        right: '5px',
                    }}
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
            >
                <MenuItem onClick={handleEditAddress}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <EditLocationOutlinedIcon sx={{ fontSize: '18px' }} />
                        <Typography fontSize="14px" sx={{ color: 'text.primary' }}>
                            {t('Edit')}
                        </Typography>
                    </Stack>
                </MenuItem>
                {isDefault !== address?.id && (
                    <MenuItem onClick={() => handleSetDefault(address?.id)}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <CheckCircleOutlineIcon sx={{ fontSize: '18px' }} />
                            <Typography
                                fontSize="14px"
                                sx={{ color: 'text.primary' }}
                            >
                                {t('Set as Default')}
                            </Typography>
                        </Stack>
                    </MenuItem>
                )}
                <MenuItem
                    onClick={() => {
                        handleClose()
                        setOpenDelete(true)
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <DeleteOutlineIcon
                            sx={{ fontSize: '18px', color: 'error.main' }}
                        />
                        <Typography fontSize="14px" sx={{ color: 'error.main' }}>
                            {t('Delete')}
                        </Typography>
                    </Stack>
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
