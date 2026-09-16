import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import Router from 'next/router'
import MapModal from '../landingpage/google-map/MapModal'
import { CustomToaster } from '../custom-toaster/CustomToaster'
import { footerColors } from './Footer.style'

const RouteLinks = ({ token, global, title, RouteLinksData }) => {
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
        color: footerColors.text,
        fontSize: '14px',
        lineHeight: 1.2,
        opacity: { xs: 1, md: 0.8 },
        cursor: 'pointer',
        textAlign: { xs: 'center', md: 'left' },
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-start' },
                gap: { xs: '8px', md: '16px' },
                width: '100%',
            }}
        >
            <Typography
                sx={{
                    color: footerColors.heading,
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '-0.48px',
                    textTransform: 'uppercase',
                }}
            >
                {t(title)}
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: { xs: 'center', md: 'flex-start' },
                    gap: { xs: '12px', md: '16px' },
                    width: '100%',
                }}
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
