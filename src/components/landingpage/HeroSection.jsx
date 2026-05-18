import React, { memo } from 'react'
import { Stack, Box, Typography, alpha } from '@mui/material'
import ImageNotFound from '../../../public/static/no-image-found.svg'
import { useTheme } from '@mui/material/styles'
import HeroLocationForm from './HeroLocationForm'
import CustomContainer from '../container'
import CustomNextImage from '@/components/CustomNextImage'
import BoltIcon from '@mui/icons-material/Bolt'
import { useTranslation } from 'react-i18next'

const HeroSection = (props) => {
    const {
        handleModalClose,
        banner_section_title,
        banner_section_subTitle,
        banner_section_image,
        place_holder_search_text
    } = props
    const theme = useTheme();
    const { t } = useTranslation()

    return (
        <CustomContainer>
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    borderRadius: '22px',
                    overflow: 'hidden',
                    minHeight: { xs: '320px', md: '350px' },
                    height: { xs: '320px', md: '400px' },
                    marginTop: { xs: '24px', md: '24px' },
                    boxShadow: '0 14px 34px rgba(15,23,42,.10)',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        zIndex: -1,
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0,
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background:
                                'radial-gradient(80% 120% at 10% 50%, rgba(20,15,10,.55) 0%, rgba(20,15,10,.25) 55%, rgba(20,15,10,0) 80%), linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,.45) 100%)',
                        },
                        img: {
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover',
                        },
                    }}
                >
                    <CustomNextImage
                        src={banner_section_image}
                        altSrc={ImageNotFound}
                        width={1920}
                        height={350}
                        priority={true}
                    />
                </Box>

                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: {
                            xs: '20px 16px',
                            sm: '32px',
                            md: '40px 56px',
                        },
                        maxWidth: { xs: '100%', md: '780px' },
                    }}
                >
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignSelf: 'flex-start',
                            width: 'fit-content',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'rgba(255,255,255,.14)',
                            backdropFilter: 'blur(6px)',
                            border: '1px solid rgba(255,255,255,.24)',
                            borderRadius: '999px',
                            padding: '6px 12px',
                            fontWeight: 600,
                            fontSize: '12px',
                            color: '#fff',
                            letterSpacing: '0.02em',
                            mb: '18px',
                        }}
                    >
                        <BoltIcon sx={{ color: '#FFD7A8', fontSize: '14px' }} />
                        {t('Fresh · Fast · Nearby')}
                    </Box>

                    <Typography
                        component="h1"
                        sx={{
                            fontSize: { xs: '24px', sm: '32px', md: '40px' },
                            lineHeight: 1.1,
                            letterSpacing: '-0.02em',
                            fontWeight: 800,
                            color: theme.palette.whiteText.main,
                            textShadow: '0 4px 24px rgba(0,0,0,.35)',
                            margin: '0 0 8px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {banner_section_title}
                    </Typography>

                    <Typography
                        component="p"
                        sx={{
                            fontSize: { xs: '13px', sm: '14px' },
                            lineHeight: 1.5,
                            color: 'rgba(255,255,255,.88)',
                            maxWidth: '560px',
                            margin: '0 0 18px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {banner_section_subTitle}
                    </Typography>

                    <Box
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: '16px',
                            padding: { xs: '8px', sm: '14px' },
                            boxShadow: '0 20px 50px rgba(15,23,42,.22)',
                            maxWidth: '620px',
                        }}
                    >
                        <HeroLocationForm
                            fromHero="true"
                            height="41px"
                            mobileview="true"
                            handleModalClose={handleModalClose}
                            place_holder_search_text={
                                place_holder_search_text
                            }
                        />
                    </Box>
                </Box>
            </Box>
        </CustomContainer>
    )
}

export default memo(HeroSection)
