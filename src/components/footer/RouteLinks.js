import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import Router from 'next/router'
import MapModal from '../landingpage/google-map/MapModal'
import { CustomToaster } from '../custom-toaster/CustomToaster'

const RouteLinks = ({ token, global, title, RouteLinksData, isCenter }) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)

    const handleClose = () => {
        setOpen(false)
    }

    const handleClick = (href, value) => {
        if (value === 'loyalty' || value === 'wallets') {
            if (token) {
                Router.push(
                    { pathname: '/info', query: { page: value } },
                    undefined,
                    { shallow: true }
                )
            } else {
                CustomToaster('error', 'You must be login to access this page.')
            }
        } else if (value === 'popular' || value === 'latest') {
            Router.push({ pathname: '/home', query: { restaurantType: value } })
        } else if (value === 'most-reviewed') {
            Router.push({ pathname: '/home', query: { page: value } })
        } else if (value === 'cuisines') {
            Router.push(href)
        } else if (value === 'restaurant_owner') {
            window.open(href)
        } else if (value === 'delivery_man') {
            window.open(href)
        } else if (value === 'track_order') {
            Router.push(href)
        } else {
            Router.push(href, undefined, { shallow: true })
        }
    }

    const handleClickToRoute = (href) => {
        Router.push(href, undefined, { shallow: true })
    }

    const linkSx = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: '#94A3B8',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'color .15s ease, transform .15s ease',
        alignSelf: isCenter ? 'center' : 'flex-start',
        '&::before': {
            content: '""',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: theme.palette.primary.main,
            opacity: 0,
            transition: 'opacity .15s ease',
            flexShrink: 0,
        },
        '&:hover': {
            color: '#fff',
            transform: 'translateX(3px)',
        },
        '&:hover::before': {
            opacity: 1,
        },
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isCenter ? 'center' : 'flex-start',
            }}
        >
            {/* Column heading */}
            <Box sx={{ position: 'relative', pb: '10px', mb: '18px' }}>
                <Typography
                    sx={{
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 800,
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                    }}
                >
                    {t(title)}
                </Typography>
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: isCenter ? '50%' : 0,
                        transform: isCenter ? 'translateX(-50%)' : 'none',
                        width: '22px',
                        height: '2px',
                        background: theme.palette.primary.main,
                        borderRadius: '999px',
                    }}
                />
            </Box>

            {/* Links */}
            <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
                {RouteLinksData.map((item, index) => (
                    <Box
                        key={index}
                        sx={linkSx}
                        onClick={() => handleClick(item.link, item.value)}
                    >
                        {t(item.name)}
                    </Box>
                ))}

                {title === 'Other' &&
                    global?.refund_policy_status !== 0 && (
                        <Box
                            sx={linkSx}
                            onClick={() =>
                                handleClickToRoute('/refund-policy')
                            }
                        >
                            {t('Refund Policy')}
                        </Box>
                    )}

                {title === 'Other' &&
                    global?.cancellation_policy_status !== 0 && (
                        <Box
                            sx={linkSx}
                            onClick={() =>
                                handleClickToRoute('/cancellation-policy')
                            }
                        >
                            {t('Cancellation Policy')}
                        </Box>
                    )}
            </Box>

            {open && (
                <MapModal
                    redirectUrl={{}}
                    open={open}
                    handleClose={handleClose}
                />
            )}
        </Box>
    )
}

export default RouteLinks
