import React from 'react'
import CustomContainer from '@/components/container'
import { alpha, Grid, Typography, useMediaQuery, Box } from '@mui/material'
import CustomImageContainer from '@/components/CustomImageContainer'
import { useTheme } from '@mui/styles'
import DollarSignHighlighter from '@/components/DollarSignHighlighter'
import CustomNextImage from '@/components/CustomNextImage'

const AvailableZoneSection = ({ landingPageData }) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const isMd = useMediaQuery(theme.breakpoints.down('md'))
    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }
    return (
        <CustomContainer>
            <Grid
                sx={{
                    paddingTop: { xs: '50px', md: '60px' },
                    paddingBottom: { xs: '10px', md: '60px' },
                }}
                container
                alignItems="center"
                justifyContent="center"
                spacing={{ xs: 3, md: 4 }}
            >
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={6}
                    align={
                        isSmall
                            ? 'center'
                            : languageDirection === 'rtl'
                            ? 'right'
                            : 'left'
                    }
                >
                    <CustomNextImage src={landingPageData?.available_zone_image_full_url} width={isMd ? 300 : 440} height={isMd ? 250 : 380} objectFit="contain" />
                </Grid>
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={6}
                    align={isSmall ? 'center' : 'left'}
                >
                    <Typography
                        fontSize={{ xs: '1.2rem', md: '30px' }}
                        fontWeight={{ xs: '600', md: '700' }}
                        color={theme.palette.neutral[1000]}
                        marginBottom={{ xs: '8px', md: '12px' }}
                        component="h2"
                    >
                        <DollarSignHighlighter
                            text={landingPageData?.available_zone_title}
                        />
                    </Typography>
                    <Typography
                        fontSize={{ xs: '14px', md: '16px' }}
                        fontWeight={{ xs: '400', md: '400' }}
                        color={theme.palette.neutral[400]}
                        paddingTop={isSmall ? '10px' : '0rem'}
                        component="p"
                    >
                        {landingPageData?.available_zone_short_description}
                    </Typography>
                    <Box sx={{ position: 'relative', marginTop: '35px' }}>
                        {/* Scrollable container with custom scrollbar */}
                        <Box
                            sx={{
                                maxHeight: 200,
                                overflowY: 'auto',
                                paddingRight: '10px',
                                '&::-webkit-scrollbar': {
                                    width: '3px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: '#f0f0f0',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: '#c1c1c1',
                                    borderRadius: '3px',
                                },
                                '&::-webkit-scrollbar-thumb:hover': {
                                    backgroundColor: '#003638',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                    maxWidth: '543px',
                                    paddingBottom: '35px',
                                }}
                            >
                                {landingPageData?.available_zone_list?.map(
                                    (zone) => (
                                        <Box
                                            sx={{
                                                borderRadius: '10px',
                                                border: '1px solid',
                                                borderColor: alpha(
                                                    theme.palette.neutral[400],
                                                    0.2
                                                ),
                                                backgroundColor: (theme) =>
                                                    theme.palette.neutral[100],
                                                padding: '8px 30px',
                                                fontSize: '18px',
                                                fontWeight: 500,
                                                textAlign: 'center',
                                                textDecoration: 'none',
                                                color: (theme) =>
                                                    theme.palette.neutral[1000],
                                                '&:hover': {
                                                    boxShadow: `0px 4px 12px 0px ${alpha(
                                                        theme.palette
                                                            .neutral[1000],
                                                        0.1
                                                    )}`,
                                                    color: (theme) =>
                                                        theme.palette.primary
                                                            .main,
                                                },
                                            }}
                                            component="h3"
                                        >
                                            {zone?.display_name}
                                        </Box>
                                    )
                                )}
                            </Box>
                        </Box>

                        {/* The gradient overlay at the bottom */}
                        <Box
                            sx={{
                                position: 'absolute',
                                height: '62px',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                background: `linear-gradient(180deg, ${alpha(
                                    theme.palette.neutral[1800],
                                    0.0
                                )} 43.03%,  ${alpha(
                                    theme.palette.neutral[1800],
                                    0.72
                                )} 55.48%,  ${alpha(
                                    theme.palette.neutral[1800],
                                    0.9
                                )} 100%)`,
                                pointerEvents: 'none',
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </CustomContainer>
    )
}

export default AvailableZoneSection
