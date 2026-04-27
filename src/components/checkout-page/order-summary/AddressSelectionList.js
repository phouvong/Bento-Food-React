import React from 'react'
import List from '@mui/material/List'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import ListItemText from '@mui/material/ListItemText'
import {
    alpha,
    ListItemButton,
    Typography,
    Stack,
    Box,
    Button,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import ApartmentIcon from '@mui/icons-material/Apartment'
import FmdGoodIcon from '@mui/icons-material/FmdGood'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import CustomAlert from '../../alert/CustomAlert'
import CustomCheckOutShimmer from '../../CustomShimmerForCheckout/CustomCheckOutShimmer'
import { useTheme } from '@mui/material/styles'
import CustomImageContainer from '@/components/CustomImageContainer'
import noAddress from '../assets/no-address.png'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

const AddressSelectionList = (props) => {
    const theme = useTheme()
    const {
        renderOnNavbar,
        selectedAddress,
        data,
        allAddress,
        handleLatLng,
        t,
        isRefetching,
        maxHeight,
        onUseCurrentLocation,
        onSetFromMap,
    } = props
    console.log({renderOnNavbar});
    
    const handleClick = (adres) => {
        handleLatLng(adres)
    }
    const hasAddressItems = Boolean(data && allAddress?.length > 0)

    const iconHandler = (addressType = '') => {
        const normalizedType = addressType?.toLowerCase()
        if (normalizedType === 'home') {
            return (
                <HomeIcon
                    sx={{
                        width: '20px',
                        height: '20px',
                        color: theme.palette.primary.main,
                    }}
                />
            )
        } else if (normalizedType === 'office') {
            return (
                <ApartmentIcon
                    sx={{
                        width: '20px',
                        height: '20px',
                        color: theme.palette.primary.main,
                    }}
                />
            )
        } else {
            return (
                <FmdGoodIcon
                    sx={{
                        width: '20px',
                        height: '20px',
                        color: theme.palette.primary.main,
                    }}
                />
            )
        }
    }

    const listContent = (
        <List
            sx={{
                width: '100%',
                marginTop: '.3rem',
                paddingInlineEnd:  '0px',
            }}
        >
            {data &&
                allAddress?.length > 0 &&
                allAddress?.map((adres, index, array) => (
                    <React.Fragment
                        key={adres?.id ?? `${adres?.address}-${index}`}
                    >
                        <ListItemButton
                            onClick={() => handleClick(adres)}
                            alignItems="flex-start"
                            sx={{
                                padding: '10px',
                                border: '1px solid',
                                borderColor: (theme) =>
                                    adres.id === selectedAddress?.id
                                        ? theme.palette.primary.main
                                        : theme.palette.neutral[200],
                                borderRadius: '10px',
                                cursor: 'pointer',
                                marginBottom:
                                    index !== array.length - 1
                                        ? '1rem'
                                        : undefined,
                                width: '100%',
                                gap: '10px',
                                '&:hover': {
                                    backgroundColor: alpha(
                                        theme.palette.primary.main,
                                        0.2
                                    ),
                                },
                            }}
                            selected={adres.id === selectedAddress?.id}
                        >
                            <CustomStackFullWidth
                                direction="row"
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        p: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? alpha(
                                                    theme.palette.primary.main,
                                                    0.1
                                                )
                                                : theme.palette.sectionBg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginInlineEnd: '1rem',
                                    }}
                                >
                                    {iconHandler(adres?.address_type)}
                                </Box>
                                <ListItemText
                                    primary={
                                        <Typography
                                            textTransform="capitalize"
                                            fontSize="14px"
                                            fontWeight="500"
                                        >
                                            {t(adres.address_type)}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            noWrap

                                            fontSize="12px"
                                            maxWidth="300px"
                                            color={theme.palette.neutral[400]}
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {adres.address}
                                        </Typography>
                                    }
                                />
                                {adres?.id === selectedAddress?.id && (
                                    <CheckCircleIcon
                                        sx={{
                                            color: theme.palette.primary.main,
                                            fontSize: '20px',
                                            marginInlineStart: '8px',
                                            flexShrink: 0,
                                        }}
                                    />
                                )}
                            </CustomStackFullWidth>
                        </ListItemButton>
                    </React.Fragment>
                ))}

            {renderOnNavbar === 'true' ? (
                <>
                    {!isRefetching && allAddress?.length === 0 && (
                        <CustomAlert
                            type="info"
                            text={t('No saved addresses found to select.')}
                        />
                    )}
                </>
            ) : (
                <>
                    {!isRefetching && allAddress?.length === 0 && (
                        <CustomStackFullWidth
                            spacing={3}
                            alignItems="center"
                            justifyContent="center"
                        >
                            <CustomImageContainer
                                width="120px"
                                height="117px"
                                objectFit="contain"
                                src={noAddress.src}
                            />
                            <Stack
                                maxWidth="206px"
                                width="100%"
                                alignItems="center"
                            >
                                <Typography fontSize="1rem" fontWeight="600">
                                    {t('Oops!')}
                                </Typography>
                                <Typography
                                    fontSize="12px"
                                    color={theme.palette.neutral[400]}
                                >
                                    {t(
                                        'You don’t have any saved address yet. please save address to continue'
                                    )}
                                </Typography>
                            </Stack>

                        </CustomStackFullWidth>
                    )}
                </>
            )}
            {renderOnNavbar !== 'true' && <Stack
                direction="column"
                spacing={1}
                width="100%"
                justifyContent="center"
                alignItems="center"
                marginTop={allAddress?.length > 0 ? '1rem' : '0'}
            >
                <Button
                    variant="contained"
                    startIcon={<GpsFixedIcon />}
                    onClick={onUseCurrentLocation}
                    disabled={!onUseCurrentLocation}
                    fullWidth
                    sx={{
                        borderRadius: '16px',
                        backgroundColor: (theme) =>
                            theme.palette.neutral[300],
                        color: (theme) =>
                            theme.palette.neutral[1000],
                        fontWeight: 400,
                        textTransform: 'none',
                        boxShadow: 'none',
                        py: 1.2,
                        '& .MuiButton-startIcon': {
                            color: (theme) =>
                                theme.palette.primary.main,
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
                    onClick={onSetFromMap}
                    disabled={!onSetFromMap}
                    fullWidth
                    sx={{
                        borderRadius: '16px',
                        color: (theme) =>
                            theme.palette.primary.main,
                        fontWeight: 400,
                        textTransform: 'none',
                        fontSize: '16px',
                        mt: 0.5,
                        '& .MuiButton-startIcon': {
                            color: (theme) =>
                                theme.palette.primary.main,
                        },
                    }}
                >
                    {t('Set from map')}
                </Button>
            </Stack>}
            {!data && <CustomCheckOutShimmer />}
        </List>
    )

    return (
        <CustomStackFullWidth minWidth="300px">
            {hasAddressItems ? (
                <SimpleBar style={{ maxHeight: maxHeight ?? 300, width: '100%' }}>
                    {listContent}
                </SimpleBar>
            ) : (
                <Box width="100%">{listContent}</Box>
            )}
        </CustomStackFullWidth>
    )
}

AddressSelectionList.propTypes = {}

export default AddressSelectionList
