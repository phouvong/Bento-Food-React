import React from 'react'
import CustomContainer from '@/components/container'
import { alpha, Grid, Typography, useMediaQuery, Box } from '@mui/material'
import { useTheme } from '@mui/styles'
import DollarSignHighlighter from '@/components/DollarSignHighlighter'
import { t } from 'i18next'
import HeroLocationForm from '@/components/landingpage/HeroLocationForm'

const AvailableZoneSection = ({ landingPageData }) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

    return (
        <CustomContainer>
            <Grid
                container
                alignItems="center"
                justifyContent="center"
                sx={{
                    paddingTop: { xs: '50px', md: '60px' },
                    paddingBottom: { xs: '10px', md: '60px' },
                    gap: { xs: 3, md: 4 }, // 24px–32px gap between items
                }}
            >
                {/* Title and Description */}
                <Grid item xs={12} mb="1.3rem">
                    <Typography
                        fontSize={{ xs: '1.5rem', md: '30px' }}
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
                        fontWeight="400"
                        color={theme.palette.neutral[400]}
                        paddingTop={isSmall ? '10px' : '0rem'}
                        component="p"
                    >
                        {landingPageData?.available_zone_short_description}
                    </Typography>
                </Grid>

                {/* LEFT — Available Zone List with BG Image */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        position: 'relative',
                        backgroundImage:
                            landingPageData?.available_zone_image_full_url
                                ? `url(${landingPageData?.available_zone_image_full_url})`
                                : 'none',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        minHeight:"240px"
                    }}
                >
                    {/* Semi-transparent layer to make text readable */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            // backgroundColor: alpha(theme.palette.common.white, 0.7),
                            //backdropFilter: 'blur(3px)',
                        }}
                    />

                    {/* Scrollable Content */}
                    <Box
                        sx={{
                            position: 'relative',
                            maxHeight: 250,
                            overflowY: 'auto',
                            p: 2,
                            zIndex: 2,
                            '&::-webkit-scrollbar': { width: '3px' },
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
                                pb: '35px',
                            }}
                        >
                            {landingPageData?.available_zone_list?.map(
                                (zone, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            borderRadius: '10px',
                                            border: '1px solid',
                                            borderColor: alpha(
                                                theme.palette.neutral[400],
                                                0.2
                                            ),
                                            backgroundColor:
                                                theme.palette.neutral[100],
                                            padding: '8px 30px',
                                            fontSize: '18px',

                                            textAlign: 'center',
                                            color: alpha(
                                                theme.palette.neutral[1000],
                                                0.9
                                            ),
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: `0px 4px 12px 0px ${alpha(
                                                    theme.palette.neutral[1000],
                                                    0.1
                                                )}`,
                                                color: theme.palette.primary
                                                    .main,
                                                backgroundColor:
                                                    theme.palette.common.white,
                                            },
                                        }}
                                    >
                                        {zone?.display_name}
                                    </Box>
                                )
                            )}
                        </Box>
                    </Box>
                </Grid>
                {landingPageData?.available_zone_location_picker_status ? (
                    <Grid
                        item
                        xs={12}
                        md={5.5}
                        align="center"
                        sx={{
                            backgroundColor: theme.palette.neutral[200],
                            padding: '1.8rem',
                            borderRadius: '12px',
                        }}
                    >
                        <Typography
                            fontSize="1.5rem"
                            fontWeight="600"
                            mb={1}
                            color={theme.palette.neutral[1000]}
                        >
                            {
                                landingPageData?.available_zone_location_picker_title
                            }
                        </Typography>
                        <Typography
                            fontSize="14px"
                            color={theme.palette.neutral[500]}
                        >
                            {
                                landingPageData?.available_zone_location_picker_description
                            }
                        </Typography>
                        <HeroLocationForm mobileview="false" />
                    </Grid>
                ) : null}

                {/* RIGHT — Call to Action */}
            </Grid>
        </CustomContainer>
    )
}

export default AvailableZoneSection
