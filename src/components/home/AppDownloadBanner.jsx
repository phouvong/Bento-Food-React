import { useState } from 'react'
import { Box, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { t } from 'i18next'
import AndroidIcon from '@mui/icons-material/Android'
import AppleIcon from '@mui/icons-material/Apple'
import CloseIcon from '@mui/icons-material/Close'
import CustomImage from '@/components/CustomNextImage'
import QRCodeClient from '../landingpage/QRCodeClient'


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
        t('Unlock Exclusive App Rewards - Download Now')
    const imageSrc =
        downloadAppData?.react_download_apps_image_full_url ||
        '/static/banners/scan-to-download-phone-only.svg'
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
    const showPlayStoreButton = (playStoreStatus
        ? playStoreStatus === '1'
        : true) && Boolean(resolvedPlayStoreLink)
    const showAppStoreButton = (appStoreStatus ? appStoreStatus === '1' : true) &&
        Boolean(resolvedAppStoreLink)

    if (!isVisible || (!showPlayStoreButton && !showAppStoreButton)) return null

    const storeButtonSx = {
        cursor: 'pointer',
        backgroundColor: '#1d1d1d',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '6px',
        px: { xs: 1, sm: 1.1 },
        py: { xs: 0.6, sm: 0.8 },
        textDecoration: 'none',
        boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
    }

    return (
        <Box
            sx={{
                mt: 4,
                mb: 3,
                px: { xs: 1.5, sm: 2 },
                py: { xs: 1.4, sm: 1.4 },
                borderRadius: { xs: '12px', sm: '14px' },
                background: '#111111',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <IconButton
                onClick={() => setIsVisible(false)}
                aria-label="close app download banner"
                sx={{
                    position: 'absolute',
                    right: 6,
                    top: 6,
                    color: '#ffffff',
                    p: 0.5,
                    zIndex: 2,
                }}
            >
                <CloseIcon sx={{ fontSize: '16px' }} />
            </IconButton>

            {/* Mobile layout */}
            {isSmall ? (
                <Stack direction="row" alignItems="center" gap={1.5} pr={3}>
                    {/* Left: text + buttons */}
                    <Stack flex={1} gap={1} minWidth={0} overflow="hidden">
                        <Typography
                            color="#ffffff"
                            fontWeight={700}
                            lineHeight={1.3}
                            fontSize="12px"
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                            }}
                        >
                            {title}
                        </Typography>
                        <Stack direction="row" gap={0.8}>
                            {showAppStoreButton && (
                                <Stack
                                    component="a"
                                    href={resolvedAppStoreLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="center"
                                    gap={0.5}
                                    sx={storeButtonSx}
                                >
                                     <img src="/static/Group (2).png" alt="Apple" style={{ width: '20px', height: '22px' }} />
                                    <Stack spacing={0.1}>
                                        <Typography sx={{ fontSize: '6px', lineHeight: 1, color: 'rgba(255,255,255,0.7)' }}>
                                            {t('Download on')}
                                        </Typography>
                                        <Typography sx={{ fontSize: '10px', lineHeight: 1, color: '#ffffff', fontWeight: 700 }}>
                                            {t('App Store')}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            )}
                            {showPlayStoreButton && (
                                <Stack
                                    component="a"
                                    href={resolvedPlayStoreLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="center"
                                    gap={0.5}
                                    sx={storeButtonSx}
                                >
                                    <img src="/static/playstore 1.png" alt="Google Play" style={{ width: '16px', height: '16px' }} />
                                    <Stack spacing={0.1}>
                                        <Typography sx={{ fontSize: '6px', lineHeight: 1, color: 'rgba(255,255,255,0.7)' }}>
                                            {t('GET IT ON')}
                                        </Typography>
                                        <Typography sx={{ fontSize: '10px', lineHeight: 1, color: '#ffffff', fontWeight: 700 }}>
                                            {t('Google Play')}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            )}
                        </Stack>
                    </Stack>

                    {/* Right: QR code */}
                    <Stack alignItems="center" gap={0.5} flexShrink={0} pt={{xs:"1rem",sm:"0rem"}}>
                        <Box
                            sx={{
                                width: '72px',
                                height: '72px',
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: '4px',
                            }}
                        >
                            <QRCodeClient
                                size={60}
                                playStoreLink={resolvedPlayStoreLink}
                                appStoreLink={resolvedAppStoreLink}
                            />
                        </Box>
                        <Typography sx={{ fontSize: '9px',marginTop:"10px", color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.2 }}>
                            {t('Scan to')}<br />{t('Download')}
                        </Typography>
                    </Stack>
                </Stack>
            ) : (
                /* Desktop layout */
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={2.5}
                >
                    <Stack direction="row" alignItems="center" gap={1.5} flex={1} minWidth={0}>
                        <Box
                            sx={{
                                width: '100px',
                                height: '100px',
                                border: '2px solid rgba(255,255,255,0.5)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                p: '4px',
                            }}
                        >
                            <QRCodeClient
                                size={82}
                                playStoreLink={resolvedPlayStoreLink}
                                appStoreLink={resolvedAppStoreLink}
                            />
                        </Box>
                        <Stack gap={1} minWidth={0}>
                            <Typography
                                color="#ffffff"
                                fontWeight={700}
                                lineHeight={1.25}
                                fontSize={{ sm: '18px', md: '20px' }}
                            >
                                {title}
                            </Typography>
                            <Stack direction="row" gap={0.8} mt="5px">
                                {showPlayStoreButton && (
                                    <Stack
                                        component="a"
                                        href={resolvedPlayStoreLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="center"
                                        gap={0.5}
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '3px',
                                            px: 1.1,
                                            py: 1,
                                            textDecoration: 'none',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                        }}
                                    >
                                       <img src="/static/playstore 1.png" alt="Google Play" style={{ width: '16px', height: '16px' }} />
                                        <Stack spacing={0.2}>
                                            <Typography sx={{ fontSize: '8px', lineHeight: 1, color: '#4a4a4a' }}>
                                                {t('GET IT ON')}
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', lineHeight: 1, color: '#1d1d1d', fontWeight: 700 }}>
                                                {t('Google Play')}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                )}
                                {showAppStoreButton && (
                                    <Stack
                                        component="a"
                                        href={resolvedAppStoreLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="center"
                                        gap={0.5}
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '3px',
                                            px: 1.1,
                                            py: 1,
                                            textDecoration: 'none',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                        }}
                                    >
                                        <img src="/static/Group (2).png" alt="Apple" style={{ width: '20px', height: '22px' }} />
                                        <Stack spacing={0.2}>
                                            <Typography sx={{ fontSize: '8px', lineHeight: 1, color: '#4a4a4a' }}>
                                                {t('Download on')}
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', lineHeight: 1, color: '#1d1d1d', fontWeight: 700 }}>
                                                {t('App Store')}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                )}
                            </Stack>
                        </Stack>
                    </Stack>

                    <Stack direction="row" alignItems="center" marginInlineEnd="20px">
                        <Stack justifyContent="space-between" sx={{ height: '66px' }}>
                            <Typography sx={{ fontSize: '18px', lineHeight: 1 }}>{'🌮'}</Typography>
                            <Typography sx={{ fontSize: '18px', lineHeight: 1 }}>{'🍔'}</Typography>
                        </Stack>
                        <CustomImage
                            src={imageSrc}
                            alt={t('Scan to Download')}
                            width={86}
                            height={118}
                            objectFit="contain"
                        />
                        <Stack justifyContent="space-between" sx={{ height: '66px' }}>
                            <Typography sx={{ fontSize: '18px', lineHeight: 1 }}>{'🌯'}</Typography>
                            <Typography sx={{ fontSize: '18px', lineHeight: 1 }}>{'🍟'}</Typography>
                        </Stack>
                    </Stack>
                </Stack>
            )}
        </Box>
    )
}

export default AppDownloadBanner
