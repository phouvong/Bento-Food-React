import React, { useEffect, useRef, useState } from 'react'
import RoomIcon from '@mui/icons-material/Room'
import { Stack, Typography, Tooltip, ClickAwayListener } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import AddressReselectPopover from './AddressReselectPopover'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { setClearCart } from '@/redux/slices/cart'
import { alpha, styled } from '@mui/material/styles'
import { useGeolocated } from 'react-geolocated'
import { setOpenMapDrawer, setUserLocationUpdate } from '@/redux/slices/global'
import MapModal from '@/components/landingpage/google-map/MapModal'
export const AddressTypographyGray = styled(Typography)(({ theme }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '1',
    WebkitBoxOrient: 'vertical',
    maxWidth: '189px',
    marginInlineStart: '5px',
    wordBreak: 'break-all',
    color: theme.palette.neutral[1000],
    fontSize: '13px',
}))
const AddressReselect = ({ location, isSticky }) => {
    const [mapOpen, setMapOpen] = useState(false)
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const { openMapDrawer, userLocationUpdate } = useSelector(
        (state) => state.globalSettings
    )
    const [address, setAddress] = useState(null)
    const [tooltipOpen, setTooltipOpen] = useState(true)
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const anchorRef = useRef(null)

    useEffect(() => {
        if (address) {
            localStorage.setItem('location', address?.address)
            const values = { lat: address?.lat, lng: address?.lng }
            localStorage.setItem('currentLatLng', JSON.stringify(values))
            if (address.zone_ids && address.zone_ids.length > 0) {
                const value = [address.zone_ids]
                localStorage.setItem('zoneid', JSON.stringify(address.zone_ids))
                toast.success(t('New delivery address selected.'))
                handleClosePopover()
                dispatch(setClearCart())
                dispatch(setUserLocationUpdate(!userLocationUpdate))
                router.push('/home')
            }
        }
    }, [address])

    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 5000,
            isGeolocationEnabled: true,
        })

    useEffect(() => {
        // Hide tooltip when isSticky is true, show when false
        setTooltipOpen(!isSticky)
    }, [isSticky])

    useEffect(() => {
        // Show tooltip again when route changes
        if (!location) {
            setTooltipOpen(true)
        }
    }, [router.pathname, location])

    useEffect(() => {
        // Close tooltip when scrolling down, show when scrolling back to top
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setTooltipOpen(false)
            } else if (window.scrollY === 0 && !location && !isSticky) {
                setTooltipOpen(true)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [location, isSticky])

    const handleClosePopover = () => {
        dispatch(setOpenMapDrawer(false))
        setMapOpen(false)
    }
    const handleClickToLandingPage = () => {
        if (router.pathname === '/') {
            setOpen(true)
        } else {
            dispatch(setOpenMapDrawer(true))
        }
    }

    const handleModalClose = () => setOpen(false)
    const handleClose = () => {
        setOpen(false)
        if (router.pathname !== '/') {
            handleModalClose()
        }
    }

    const handleTooltipClose = () => {
        setTooltipOpen(false)
    }

    return (
        <>
            {!location ? (
                <ClickAwayListener onClickAway={handleTooltipClose}>
                    <Tooltip
                        title={t("Please setup your location to view available restaurants and foods in your area")}
                        arrow
                        placement="top"
                        open={tooltipOpen}
                        disableHoverListener
                        disableFocusListener
                        disableTouchListener
                        TransitionProps={{ timeout: 0 }}
                        slotProps={{
                            popper: {
                                sx: {
                                    zIndex: 9999,
                                    left: { xs: '26px !important', sm: 'auto' },
                                }
                            },
                            tooltip: {
                                sx: {
                                    textAlign: "center",
                                    bgcolor: theme => alpha(theme.palette.neutral[1000], .8),
                                    color: theme => theme.palette.neutral[100],
                                    textTransform: 'none',
                                    fontSize: '13px',
                                    padding: '10px',
                                    maxWidth: '350px',
                                    '& .MuiTooltip-arrow': {
                                        color: theme => alpha(theme.palette.neutral[1000], .8),

                                    },
                                },
                            },
                        }}
                    >
                        <Stack
                            direction="row"
                            onClick={handleClickToLandingPage}
                            alignItems="center"
                            gap="5px"
                            sx={{
                                cursor: 'pointer',
                                color: (theme) => theme.palette.neutral[1000],
                                minWidth: "174px"
                            }}
                        >
                            <RoomIcon
                                fontSize="small"
                                color="primary"
                                style={{ width: '16px', height: '16px' }}
                            />
                            <AddressTypographyGray align="left">
                                {t('Select your location')}
                            </AddressTypographyGray>
                            <KeyboardArrowDownIcon sx={{ minWidth: "10px" }} />
                        </Stack>
                    </Tooltip>
                </ClickAwayListener>
            ) : (
                <Stack
                    sx={{
                        color: (theme) => theme.palette.neutral[1000],
                        cursor: 'pointer',
                    }}
                    direction="row"
                    onClick={handleClickToLandingPage}
                    ref={anchorRef}
                    alignItems="center"
                    gap="5px"
                    minWidth="174px"
                >
                    <RoomIcon
                        fontSize="small"
                        color="primary"
                        style={{ width: '16px', height: '16px' }}
                    />
                    <AddressTypographyGray align="left">
                        {location}
                    </AddressTypographyGray>
                    <KeyboardArrowDownIcon sx={{ minWidth: "10px", fontSize: "1rem" }} />
                </Stack>
            )}
            <AddressReselectPopover
                anchorEl={anchorRef.current}
                onClose={handleClosePopover}
                open={openMapDrawer}
                t={t}
                address={address}
                setAddress={setAddress}
                mapOpen={mapOpen}
                setMapOpen={setMapOpen}
                coords={coords}
            />
            {open && <MapModal open={open} handleClose={handleClose} />}
        </>
    )
}

AddressReselect.propTypes = {}

export default AddressReselect
