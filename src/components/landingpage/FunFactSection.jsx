import React, { useRef } from 'react'
import { Stack, Typography, useMediaQuery } from '@mui/material'
import {
    CustomStackFullWidth,
    SliderCustom,
} from '@/styled-components/CustomStyles.style'
import { CustomTypography } from '../custom-tables/Tables.style'
import { useTheme } from '@mui/material/styles'
import CustomContainer from '../container'
import 'simplebar/dist/simplebar.min.css'
import { RTL } from '../RTL/RTL'
import LandingFeatureSvg from './Landingfeature'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import { landingFeatureSettings } from './landingFeatureSettings'
import LandingFeatureSvg1 from './link-section/LandingFeatureSvg1'
import CustomNextImage from '@/components/CustomNextImage'

const FunFactSection = ({ react_feature }) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const isMd = useMediaQuery(theme.breakpoints.down('md'))
    const discountRef = useRef(null)
    let languageDirection = undefined

    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }

    const mainComponent = () => {
        return (
            <CustomStackFullWidth sx={{ marginTop: '50px' }}>
                <SliderCustom
                    languageDirection={languageDirection}
                    isCenter={true}
                    gap="0px"
                >
                    <Slider {...landingFeatureSettings} ref={discountRef}>
                        {react_feature?.map((item, index) => {
                            return (
                                <Stack
                                    key={index}
                                    position="relative"
                                    paddingRight={{
                                        xs: '15px',
                                        sm: '20px',
                                    }}
                                >
                                    <Stack
                                        direction="column"
                                        alignItems="center"
                                        spacing={1}
                                        flexWrap="wrap"
                                    >
                                        <CustomNextImage
                                            src={item?.image_full_url}
                                            width={isMd ? 60 : 121}
                                            height={isMd ? 60 : 140}
                                            priority={true}
                                            objectFit='contain'
                                        />
                                        <CustomTypography
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: {
                                                    xs: '14px',
                                                    md: '16px',
                                                },
                                            }}
                                            component="h2"
                                        >
                                            {item?.title}
                                        </CustomTypography>
                                        {item?.sub_title && (
                                            <Typography
                                                fontSize={{
                                                    xs: '10px',
                                                    sm: '14px',
                                                    md: '14px',
                                                }}
                                                textAlign="center"
                                                fontWeight="400"
                                                color={
                                                    theme.palette
                                                        .neutral[600]
                                                }
                                                component="p"
                                            >
                                                {item?.sub_title}
                                            </Typography>
                                        )}
                                    </Stack>

                                    {index % 2 === 0
                                        ? react_feature.length - 1 !==
                                              index && (
                                              <Stack
                                                  position="absolute"
                                                  left="54%"
                                                  top={
                                                      isSmall
                                                          ? '-14px'
                                                          : '37px'
                                                  }
                                                  maxWidth={{
                                                      xs: '177px',
                                                      sm: '344px',
                                                      md: '344px',
                                                  }}
                                                  width="100%"
                                              >
                                                  <LandingFeatureSvg width="100%" />
                                              </Stack>
                                          )
                                        : react_feature.length - 1 !==
                                              index && (
                                              <Stack
                                                  position="absolute"
                                                  left="59%"
                                                  top={
                                                      isSmall
                                                          ? '-11px'
                                                          : '35px'
                                                  }
                                                  maxWidth={{
                                                      xs: '162px',
                                                      sm: '309px',
                                                      md: '309px',
                                                  }}
                                                  width="100%"
                                              >
                                                  <LandingFeatureSvg1 width="100%" />
                                              </Stack>
                                          )}
                                </Stack>
                            )
                        })}
                    </Slider>
                </SliderCustom>
            </CustomStackFullWidth>
        )
    }
    return (
        <CustomContainer>
            {react_feature?.length > 3 ? (
                <>{mainComponent()}</>
            ) : (
                <RTL direction={languageDirection}> {mainComponent()}</RTL>
            )}
        </CustomContainer>
    )
}

export default FunFactSection
