import React, { useEffect, useState } from 'react'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
    CustomTextField,
    CustomTypographyBold,
} from '@/styled-components/CustomStyles.style'
import {
    Grid,
    Typography,
    useMediaQuery,
    Box,
    Stack,
    styled,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useDebouncedCallback } from 'use-debounce'
import { useTheme } from '@mui/styles'

export const CustomBoxForTips = styled(Box)(({ theme, active }) => ({
    paddingInline: '10px',
    height: '50px',
    width: 'auto',
    minWidth: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid ',
    borderColor: theme.palette.primary.main,
    cursor: 'pointer',
    borderRadius: '5px',
    background: active && theme.palette.primary.main,
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
        height: '30px',
        paddingInline: '5px',
    },
}))

const DeliveryManTips = ({ deliveryTip, setDeliveryTip, tripsData }) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const [fieldValue, setFieldValue] = useState(deliveryTip)
    const deliveryTips = [0, 10, 15, 20, 40]
    const { t } = useTranslation()
    const debounced = useDebouncedCallback(
        // function
        (value) => {
            if (value > -1) {
                setFieldValue(value)
            }
        },
        100
    )
    const handleClickOnTips = useDebouncedCallback(
        // function
        (value) => {
            setFieldValue(value)
        },
        // delay in ms
        100
    )
    useEffect(() => {
        setDeliveryTip(fieldValue)
    }, [fieldValue])

    return (
        <CustomPaperBigCard>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <CustomTypographyBold>
                        {t('Delivery Man Tips')}
                    </CustomTypographyBold>
                </Grid>
                <Grid item md={12} xs={12}>
                    <CustomTextField
                        type="number"
                        InputProps={{
                            inputProps: { min: 0 },
                        }}
                        onKeyPress={(event) => {
                            if (event?.key === '-' || event?.key === '+') {
                                event.preventDefault()
                            }
                        }}
                        label={t('Amount')}
                        value={fieldValue}
                        fullWidth
                        onChange={(e) => debounced(e.target.value)}
                    />
                </Grid>
                <Grid item md={12} xs={12}>
                    <CustomStackFullWidth
                        direction="row"
                        alignItems={!isSmall && 'center'}
                        gap="10px"
                        flexWrap="wrap"
                    >
                        {deliveryTips.map((item, index) => {
                            return (
                                <Stack key={index} alignItems="flex-start">
                                    <CustomBoxForTips
                                        onClick={() => handleClickOnTips(item)}
                                        active={item === deliveryTip}
                                    >
                                        <Typography
                                            fontSize={
                                                item === deliveryTip
                                                    ? '14px'
                                                    : '12px'
                                            }
                                            textTransform="capitalize"
                                            fontWeight="600"
                                            color={
                                                item === deliveryTip
                                                    ? theme.palette
                                                          .whiteContainer.main
                                                    : theme.palette.primary.main
                                            }
                                        >
                                            {index === 0 ? t('not now') : item}
                                        </Typography>
                                        {tripsData?.most_tips_amount === item &&
                                            !isSmall && (
                                                <Stack
                                                    position="absolute"
                                                    bottom="0px"
                                                    alignItems="center"
                                                    width="100%"
                                                    backgroundColor={
                                                        theme.palette.primary
                                                            .main
                                                    }
                                                >
                                                    <Typography
                                                        color={
                                                            theme.palette
                                                                .whiteContainer
                                                                .main
                                                        }
                                                        fontSize="8px"
                                                    >
                                                        {t('Most Tipped')}
                                                    </Typography>
                                                </Stack>
                                            )}
                                    </CustomBoxForTips>
                                    {tripsData?.most_tips_amount === item &&
                                        isSmall && (
                                            <Typography
                                                color={
                                                    theme.palette.primary.main
                                                }
                                                fontSize="8px"
                                            >
                                                {t('Most Tipped')}
                                            </Typography>
                                        )}
                                </Stack>
                            )
                        })}
                    </CustomStackFullWidth>
                </Grid>
            </Grid>
        </CustomPaperBigCard>
    )
}

DeliveryManTips.propTypes = {}

export default DeliveryManTips
