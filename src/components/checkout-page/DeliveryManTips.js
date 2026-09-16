import React, { useEffect, useRef, useState } from 'react'
import {
    CustomPaperBigCard,
    CustomTextField,
} from '@/styled-components/CustomStyles.style'
import {
    Checkbox,
    FormControlLabel,
    Typography,
    useMediaQuery,
    Box,
    Stack,
    styled,
    alpha,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useDebouncedCallback } from 'use-debounce'
import { useTheme } from '@mui/styles'
import cookie from 'js-cookie'
import { getAmount } from '@/utils/customFunctions'
import { getGuestId } from './functions/getGuestUserId'
import Slider from '@/components/slider/SlickToSwiper'

const sliderSettings = {
    slidesToShow: 'auto',
    infinite: false,
    dots: false,
    arrows: false,
}

export const CustomBoxForTips = styled(Box)(({ theme, active }) => ({
    paddingInline: '16px',
    height: '44px',
    width: 'auto',
    minWidth: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '8px',
    backgroundColor: active
        ? theme.palette.primary.main
        : theme.palette.neutral[200],
    flexShrink: 0,
    transition: 'background-color 0.15s ease',
    [theme.breakpoints.down('sm')]: {
        height: '38px',
        paddingInline: '10px',
    },
}))

const CustomBoxForMostTipped = styled(Box)(({ theme, active }) => ({
    height: '44px',
    width: 'auto',
    minWidth: '50px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    cursor: 'pointer',
    borderRadius: '8px',
    backgroundColor: active
        ? theme.palette.primary.main
        : theme.palette.neutral[200],
    flexShrink: 0,
    transition: 'background-color 0.15s ease',
    [theme.breakpoints.down('sm')]: {
        height: '38px',
    },
}))

const deliveryTips = [0, 10, 15, 20, 40]

const DeliveryManTips = ({
    deliveryTip,
    setDeliveryTip,
    tripsData,
    global,
    customerData,
}) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const { t } = useTranslation()

    const [fieldValue, setFieldValue] = useState(deliveryTip || 0)
    const [customOpen, setCustomOpen] = useState(
        !deliveryTips.includes(deliveryTip || 0)
    )
    const [saveForLater, setSaveForLater] = useState(false)
    const ready = useRef(false)

    const customerId = customerData?.data?.id
    const guestId = getGuestId()
    const cookieKey = customerId
        ? `dm_tip_pref_${customerId}`
        : guestId
            ? `dm_tip_pref_guest_${guestId}`
            : null

    const debounced = useDebouncedCallback((value) => {
        if (value > -1) {
            setFieldValue(value)
        }
    }, 100)
    const handleClickOnTips = useDebouncedCallback((value) => {
        setCustomOpen(false)
        setFieldValue(value)
        if (value === deliveryTips[0]) {
            setSaveForLater(false)
        }
    }, 100)

    useEffect(() => {
        setDeliveryTip(fieldValue)
    }, [fieldValue])

    useEffect(() => {
        if (!cookieKey) {
            ready.current = true
            return
        }
        const saved = cookie.get(cookieKey)
        const savedAmount = Number(saved)
        if (saved !== undefined && Number.isFinite(savedAmount)) {
            setFieldValue(savedAmount)
            setCustomOpen(!deliveryTips.includes(savedAmount))
            setSaveForLater(true)
        }
        ready.current = true
    }, [cookieKey])

    useEffect(() => {
        if (!ready.current || !cookieKey) return
        if (saveForLater) {
            cookie.set(cookieKey, String(fieldValue), { expires: 365 })
        } else {
            cookie.remove(cookieKey)
        }
    }, [saveForLater, fieldValue, cookieKey])

    const currencySymbol = global?.currency_symbol || '$'
    const currencySymbolDirection = global?.currency_symbol_direction || 'left'
    const digitAfterDecimalPoint =
        Number.parseInt(global?.digit_after_decimal_point, 10) || 0

    const formatTipAmount = (amount) =>
        getAmount(
            amount,
            currencySymbolDirection,
            currencySymbol,
            digitAfterDecimalPoint
        )

    const isNotNowActive = !customOpen && fieldValue === deliveryTips[0]

    const saveForLaterCheckbox = !isNotNowActive && (
        <FormControlLabel
            onChange={(e) => setSaveForLater(e.target.checked)}
            checked={saveForLater}
            control={<Checkbox size="small" />}
            labelPlacement="start"
            label={
                <Typography
                    sx={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'text.primary',
                    }}
                >
                    {t('Save It For Later')}
                </Typography>
            }
            sx={{ m: 0, gap: '4px' }}
        />
    )

    return (
        <CustomPaperBigCard nopadding="true" noboxshadow="true">
            <Stack sx={{ gap: '16px', py: '16px', pl: '16px', pr: 0 }}>
                <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    gap="12px"
                    sx={{ pr: '16px' }}
                >
                    <Stack sx={{ gap: '2px' }}>
                        <Typography
                            sx={{
                                fontSize: '16px',
                                fontWeight: 700,
                                letterSpacing: '-0.48px',
                                color: 'text.primary',
                            }}
                        >
                            {t('Delivery Tips')}
                        </Typography>
                        <Typography
                            sx={{ fontSize: '13px', color: 'text.secondary' }}
                        >
                            {t(
                                'Your provided tips will 100% goes to deliveryman.'
                            )}
                        </Typography>
                    </Stack>
                    {!isSmall && saveForLaterCheckbox}
                </Stack>

                <Box
                    sx={{
                        '& .swiper': { py: '2px' },
                        '& .swiper-slide': { width: 'auto' },
                    }}
                >
                <Slider {...sliderSettings} gap={10}>
                    <CustomBoxForTips
                        onClick={() => handleClickOnTips(deliveryTips[0])}
                        active={!customOpen && fieldValue === deliveryTips[0]}
                    >
                        <Typography
                            fontSize="14px"
                            fontWeight={600}
                            textTransform="capitalize"
                            color={
                                !customOpen && fieldValue === deliveryTips[0]
                                    ? theme.palette.whiteContainer.main
                                    : theme.palette.text.primary
                            }
                        >
                            {t('Not Now')}
                        </Typography>
                    </CustomBoxForTips>
                    <CustomBoxForTips
                        onClick={() => setCustomOpen(true)}
                        active={customOpen}
                    >
                        <Typography
                            fontSize="14px"
                            fontWeight={600}
                            textTransform="capitalize"
                            color={
                                customOpen
                                    ? theme.palette.whiteContainer.main
                                    : theme.palette.text.primary
                            }
                        >
                            {t('Custom')}
                        </Typography>
                    </CustomBoxForTips>
                    {deliveryTips.slice(1).map((item) => {
                        const active = !customOpen && item === fieldValue
                        const isMostTipped =
                            tripsData?.most_tips_amount === item

                        if (isMostTipped) {
                            return (
                                <CustomBoxForMostTipped
                                    key={item}
                                    onClick={() => handleClickOnTips(item)}
                                    active={active}
                                >
                                    <Stack
                                        sx={{
                                            flex: '3 0 0',
                                            width: '100%',
                                            paddingInline: '10px',
                                        }}
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Typography
                                            fontSize="14px"
                                            fontWeight={700}
                                            color={
                                                active
                                                    ? theme.palette
                                                          .whiteContainer.main
                                                    : theme.palette.text
                                                          .primary
                                            }
                                        >
                                            {formatTipAmount(item)}
                                        </Typography>
                                    </Stack>
                                    <Stack
                                        sx={{
                                            flex: '2 0 0',
                                            width: '100%',
                                            backgroundColor: active
                                                ? alpha(
                                                      theme.palette
                                                          .whiteContainer.main,
                                                      0.2
                                                  )
                                                : alpha(
                                                      theme.palette.info.main,
                                                      0.14
                                                  ),
                                        }}
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Typography
                                            fontSize="9px"
                                            fontWeight={500}
                                            color={
                                                active
                                                    ? theme.palette
                                                          .whiteContainer.main
                                                    : theme.palette.info.main
                                            }
                                        >
                                            {t('Most Tipped')}
                                        </Typography>
                                    </Stack>
                                </CustomBoxForMostTipped>
                            )
                        }

                        return (
                            <CustomBoxForTips
                                key={item}
                                onClick={() => handleClickOnTips(item)}
                                active={active}
                            >
                                <Typography
                                    fontSize="14px"
                                    fontWeight={600}
                                    color={
                                        active
                                            ? theme.palette.whiteContainer
                                                  .main
                                            : theme.palette.text.primary
                                    }
                                >
                                    {formatTipAmount(item)}
                                </Typography>
                            </CustomBoxForTips>
                        )
                    })}
                </Slider>
                </Box>

                {customOpen && (
                    <Box sx={{ pr: '16px' }}>
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
                    </Box>
                )}

                {isSmall && (
                    <Box sx={{ pr: '16px' }}>{saveForLaterCheckbox}</Box>
                )}
            </Stack>
        </CustomPaperBigCard>
    )
}

DeliveryManTips.propTypes = {}

export default DeliveryManTips
