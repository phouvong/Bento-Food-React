import { Stack, Typography, useMediaQuery } from '@mui/material'
import CustomContainer from '../container'
import 'simplebar/dist/simplebar.min.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { useTheme } from '@emotion/react'
import CustomNextImage from '@/components/CustomNextImage'
import { Box } from '@mui/system'
import {
    CustomImageGridBox,
} from '@/components/landingpage/Landingpage.style'
import { useTranslation } from 'react-i18next'

const DailyFreshChoice = ({ gallery_section }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const galleryImages = Object.keys(gallery_section || {})
        .filter((key) => key.startsWith("gallery_image_") && key.endsWith("_full_url"))
        .map((key) => gallery_section[key])
        .filter(Boolean); // removes null/undefined values if any



    return (
        <CustomContainer>
            <Stack mt={8} alignItems="center" mb={4}>
                <Typography
                    fontSize={{ xs: '1.5rem', md: '30px' }}
                    fontWeight={{ xs: '600', md: '700' }}
                    color={theme.palette.neutral[1000]}
                    marginBottom={{ xs: '8px', md: '12px' }}
                    textAlign="center"
                    component="h2"
                >
                    {gallery_section?.gallery_section_title || t('Daily Fresh Choice')}
                </Typography>
                <Typography
                    fontSize={{ xs: '14px', md: '16px' }}
                    fontWeight={{ xs: '400', md: '400' }}
                    textAlign="center"
                    color={theme.palette.neutral[400]}
                    paddingTop={isSmall ? '10px' : '0rem'}
                    component="p"
                >
                    {gallery_section?.gallery_section_sub_title || t('Explore our diverse menu with daily fresh choices, crafted to satisfy every craving.')}
                </Typography>
            </Stack>
            <CustomImageGridBox>
                {galleryImages &&
                    galleryImages.length > 0 &&
                    galleryImages?.map((item, index) => (
                        <Box
                            key={index}
                        >
                            <CustomNextImage
                                aspectRatio="1"
                                src={item}
                                width={index === 0 || index === 5 ? 500 : 240}
                                height={index === 0 || index === 5 ? 500 : 240}
                                alt={`Food-${index}`}
                                objectFit="cover"
                                borderRadius={index === 0 || index === 5 ? (isSmall ? "10px" : "20px") : (isSmall ? "5px" : "10px")}
                            />
                        </Box>
                    ))}
            </CustomImageGridBox>
        </CustomContainer>
    )
}

export default DailyFreshChoice;
