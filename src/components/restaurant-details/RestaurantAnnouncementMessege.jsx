import { Box, Stack, Typography, useMediaQuery } from '@mui/material'
import CampaignIcon from '@mui/icons-material/Campaign'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'

const BgBox = styled(Box)(({ theme }) => ({
    margin: '0px !important',
    backgroundPosition: 'center',
    backgroundColor: theme.palette.customColor.eleven,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    display: 'flex',
    alignItems: 'center',
}))

const normalStyle = {
    textAlign: 'center',
}

const RestaurantAnnouncementMessege = ({ storeAnnouncement }) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

    const duration = Math.max(8, storeAnnouncement?.length * 0.15)

    const shouldScroll = isSmall
        ? storeAnnouncement?.length > 35
        : storeAnnouncement?.length > 150

    const containerSx = {
        height: '60px',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }

    const marqueeBase = {
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        gap: isSmall ? '8px' : '12px',
        position: 'absolute',
        top: 0,
        height: '100%',
    }

    return (
        <BgBox>
            <Stack sx={containerSx}>
                {shouldScroll ? (
                    <>
                        {/* First scrolling copy */}
                        <Box
                            sx={{
                                ...marqueeBase,
                                animation: `scroll ${duration}s linear infinite`,
                                '@keyframes scroll': {
                                    '0%': { transform: 'translateX(100%)' },
                                    '100%': { transform: 'translateX(-100%)' },
                                },

                            }}
                        >
                            <CampaignIcon sx={{ color: theme.palette.whiteContainer.main }} />
                            <Typography
                                fontSize="16px"
                                fontWeight="500"
                                textTransform="capitalize"
                                sx={{ color: theme.palette.whiteContainer.main }}
                            >
                                {storeAnnouncement}
                            </Typography>
                        </Box>

                        {/* Second copy: hidden until halfway through */}
                        <Box
                            sx={{
                                ...marqueeBase,
                                opacity: 0, // hidden initially
                                animation: `scroll2 ${duration}s linear infinite`,
                                animationDelay: `${duration / 2}s`,
                                '@keyframes scroll2': {
                                    '0%': { transform: 'translateX(100%)', opacity: 0 },
                                    '5%': { opacity: 1 }, // fade in when starts scrolling
                                    '100%': { transform: 'translateX(-100%)', opacity: 1 },
                                },
                            }}
                        >
                            <CampaignIcon sx={{ color: theme.palette.whiteContainer.main }} />
                            <Typography
                                fontSize="16px"
                                fontWeight="500"
                                textTransform="capitalize"
                                sx={{ color: theme.palette.whiteContainer.main }}
                            >
                                {storeAnnouncement}
                            </Typography>
                        </Box>
                    </>
                ) : (
                    <Stack direction="row" spacing={1} sx={normalStyle}>
                        <CampaignIcon sx={{ color: theme.palette.whiteContainer.main }} />
                        <Typography
                            fontSize="16px"
                            fontWeight="500"
                            textTransform="capitalize"
                            sx={{ color: theme.palette.whiteContainer.main }}
                        >
                            {storeAnnouncement}
                        </Typography>
                    </Stack>
                )}
            </Stack>
        </BgBox>
    )
}

export default RestaurantAnnouncementMessege
