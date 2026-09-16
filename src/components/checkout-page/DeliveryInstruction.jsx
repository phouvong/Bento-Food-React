import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Stack, Typography } from '@mui/material'
import { CustomPaperBigCard } from '@/styled-components/CustomStyles.style'
import Slider from '@/components/slider/SlickToSwiper'
import { deliveryInstructions } from './demo'

const sliderSettings = {
    slidesToShow: 'auto',
    infinite: false,
    dots: false,
    arrows: false,
}

const DeliveryInstruction = ({ selected, onSelect }) => {
    const { t } = useTranslation()

    if (!deliveryInstructions?.length) return null

    const handleSelect = (value) => {
        onSelect?.(selected === value ? null : value)
    }

    return (
        <CustomPaperBigCard nopadding="true" noboxshadow="true">
            <Stack sx={{ gap: '12px', py: '16px', pl: '16px', pr: 0 }}>
                <Stack
                    direction="row"
                    alignItems="baseline"
                    gap="4px"
                    sx={{ pr: '16px' }}
                >
                    <Typography
                        sx={{
                            fontSize: '16px',
                            fontWeight: 700,
                            letterSpacing: '-0.48px',
                            color: 'text.primary',
                        }}
                    >
                        {t('Delivery Instruction')}
                    </Typography>
                    <Typography
                        sx={{ fontSize: '13px', color: 'text.secondary' }}
                    >
                        ({t('Optional')})
                    </Typography>
                </Stack>
                <Box
                    sx={{
                        '& .swiper': { py: '2px' },
                        '& .swiper-slide': { width: 'auto' },
                    }}
                >
                    <Slider {...sliderSettings} gap={10}>
                        {deliveryInstructions.map((instruction) => {
                            const isSelected = selected === instruction
                            return (
                                <Box
                                    key={instruction}
                                    onClick={() => handleSelect(instruction)}
                                    sx={{
                                        cursor: 'pointer',
                                        px: '16px',
                                        py: '8px',
                                        borderRadius: '24px',
                                        whiteSpace: 'nowrap',
                                        backgroundColor: isSelected
                                            ? 'primary.main'
                                            : (theme) =>
                                                  theme.palette.neutral[200],
                                        transition:
                                            'background-color 0.15s ease',
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            letterSpacing: '-0.42px',
                                            color: isSelected
                                                ? 'primary.contrastText'
                                                : 'text.primary',
                                        }}
                                    >
                                        {t(instruction)}
                                    </Typography>
                                </Box>
                            )
                        })}
                    </Slider>
                </Box>
            </Stack>
        </CustomPaperBigCard>
    )
}

DeliveryInstruction.propTypes = {}

export default DeliveryInstruction
