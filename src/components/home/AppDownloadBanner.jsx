import { useState } from 'react'
import { Box, IconButton, Stack, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { t } from 'i18next'
import CloseIcon from '@mui/icons-material/Close'
import QRCodeClient from '../landingpage/QRCodeClient'
import { HOME_SECTION_SPACING } from './homeSectionSpacing'

const SPACING = HOME_SECTION_SPACING.appDownloadBanner

// Desktop: #242424, 16px radius. Mobile: #303030, no radius (edge-to-edge) — per Figma.
const CARD_BG = { xs: '#303030', md: '#242424' }

const StoreButton = ({ href, iconSrc, iconAlt, iconStyle, label }) => (
    <Stack
        component="a"
        href={href}
        target="_blank"
        rel="noreferrer"
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap={{ xs: '5px', md: '6px' }}
        sx={{
            cursor: 'pointer',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            px: { xs: '10px', md: '12px' },
            py: { xs: '7px', md: '8px' },
            textDecoration: 'none',
        }}
    >
        <Box
            component="img"
            src={iconSrc}
            alt={iconAlt}
            sx={{ width: { xs: '16px', md: '20px' }, height: { xs: '16px', md: '20px' }, ...iconStyle }}
        />
        <Typography
            sx={{
                fontSize: { xs: '12px', md: '14px' },
                fontWeight: 600,
                letterSpacing: { xs: '-0.24px', md: '-0.42px' },
                lineHeight: 1.2,
                color: '#303030',
                whiteSpace: 'nowrap',
            }}
        >
            {label}
        </Typography>
    </Stack>
)

const AppDownloadBanner = ({
    downloadAppData,
    playStoreLink,
    appStoreLink,
}) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const [isVisible, setIsVisible] = useState(true)
    const title =
        downloadAppData?.react_download_apps_title ||
        t('Download app to enjoy more!')
    const playStoreStatus =
        downloadAppData?.react_download_apps_play_store
            ?.react_download_apps_play_store_status
    const appStoreStatus =
        downloadAppData?.react_download_apps_app_store
            ?.react_download_apps_link_status
    const resolvedPlayStoreLink =
        downloadAppData?.react_download_apps_play_store
            ?.react_download_apps_play_store_link || playStoreLink
    const resolvedAppStoreLink =
        downloadAppData?.react_download_apps_app_store
            ?.react_download_apps_link || appStoreLink
    const showPlayStoreButton =
        (playStoreStatus ? playStoreStatus === '1' : true) &&
        Boolean(resolvedPlayStoreLink)
    const showAppStoreButton =
        (appStoreStatus ? appStoreStatus === '1' : true) &&
        Boolean(resolvedAppStoreLink)

    if (!isVisible || (!showPlayStoreButton && !showAppStoreButton)) return null

    return (
        <Box
            sx={{
                mt: SPACING.pt,
                mb: SPACING.pb,
                px: { xs: '16px', md: '48px' },
                py: { xs: '24px', md: '32px' },
                borderRadius: { xs: 0, md: '16px' },
                background: CARD_BG,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'url(/static/banners/app-download-banner-bg.svg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center right',
                    backgroundRepeat: 'no-repeat',
                    pointerEvents: 'none',
                },
            }}
        >
            <IconButton
                onClick={() => setIsVisible(false)}
                aria-label="close app download banner"
                sx={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    color: '#ffffff',
                    p: '12px',
                    zIndex: 2,
                }}
            >
                <CloseIcon sx={{ fontSize: '20px' }} />
            </IconButton>

            <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems="center"
                justifyContent="space-between"
                gap={{ xs: '32px', md: '12px' }}
                sx={{ position: 'relative', zIndex: 1 }}
            >
                <Stack
                    gap={{ xs: '16px', md: '16px' }}
                    alignItems={{ xs: 'center', md: 'flex-start' }}
                    sx={{ width: { xs: '100%', md: 'auto' }, flex: { md: 1 } }}
                >
                    <Typography
                        sx={{
                            fontWeight: 700,
                            lineHeight: 1.1,
                            color: '#ffffff',
                            textAlign: { xs: 'center', md: 'left' },
                            fontSize: { xs: '20px', md: '24px' },
                            letterSpacing: { xs: '-0.6px', md: '-1.2px' },
                        }}
                    >
                        {title}
                    </Typography>
                    <Stack
                        direction="row"
                        gap={{ xs: '16px', md: '12px' }}
                        alignItems="center"
                        justifyContent="center"
                    >
                        {showPlayStoreButton && (
                            <StoreButton
                                href={resolvedPlayStoreLink}
                                iconSrc="/static/playstore 1.png"
                                iconAlt="Google Play"
                                label={t('Google Play')}
                            />
                        )}
                        {showAppStoreButton && (
                            <StoreButton
                                href={resolvedAppStoreLink}
                                iconSrc="/static/Group (2).png"
                                iconAlt="Apple"
                                iconStyle={{ filter: 'brightness(0)' }}
                                label={t('App Store')}
                            />
                        )}
                    </Stack>
                </Stack>

                {!isSmall && (
                    <Box
                        sx={{
                            width: '110px',
                            height: '110px',
                            flexShrink: 0,
                            border: '1px solid rgba(0,0,0,0.2)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <QRCodeClient
                            size={90}
                            playStoreLink={resolvedPlayStoreLink}
                            appStoreLink={resolvedAppStoreLink}
                        />
                    </Box>
                )}
            </Stack>
        </Box>
    )
}

export default AppDownloadBanner
