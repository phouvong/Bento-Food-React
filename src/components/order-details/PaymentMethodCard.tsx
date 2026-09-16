import React from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import Image, { type StaticImageData } from 'next/image'
import money from '../checkout-page/assets/fi_2704332.png'
import wallet from '../checkout-page/assets/wallet.png'
import walletPayment from '../checkout-page/assets/walletpayment.png'
import PartialSvg from '../checkout-page/assets/PartialSvg'

// Known methods keep autocomplete; `string & {}` leaves the union open because the
// value comes from the backend and new gateways must not break rendering.
type PaymentMethod =
    | 'cash_on_delivery'
    | 'digital_payment'
    | 'wallet'
    | 'partial_payment'
    | (string & {})

// Icon lookup is Partial: any method without a mapped asset falls back to the money icon.
// partial_payment renders PartialSvg below instead — the raster icon it used to map to
// was too low-res to read clearly at this size.
const METHOD_ICONS: Partial<Record<PaymentMethod, StaticImageData>> = {
    cash_on_delivery: money,
    digital_payment: walletPayment,
    wallet: wallet,
}

interface PaymentMethodCardProps {
    method: PaymentMethod
    // Preformatted by the parent with getAmount so currency config stays in one place.
    amount: string
    showPayDigitally?: boolean
    onPayDigitally?: () => void
}

const PaymentMethodCard = ({
    method,
    amount,
    showPayDigitally = false,
    onPayDigitally,
}: PaymentMethodCardProps) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const icon = METHOD_ICONS[method] ?? money

    return (
        <Stack
            gap="12px"
            padding="15px"
            borderRadius="10px"
            sx={{
                // Dark palette's neutral[300] is a light text tone, not a
                // surface — swap to the dark card surface there.
                backgroundColor:
                    theme.palette.mode === 'dark'
                        ? theme.palette.neutral[200]
                        : theme.palette.neutral[300],
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap="10px"
            >
                <Stack direction="row" alignItems="center" gap="12px">
                    {method === 'partial_payment' ? (
                        <Box
                            sx={{
                                width: { xs: 26, sm: 32 },
                                height: { xs: 26, sm: 32 },
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '& svg': { width: '100%', height: '100%' },
                            }}
                        >
                            <PartialSvg size={32} />
                        </Box>
                    ) : (
                        <Image
                            src={icon}
                            width={32}
                            height={32}
                            alt={method}
                            style={{ objectFit: 'contain' }}
                        />
                    )}
                    <Typography
                        fontSize="16px"
                        fontWeight={600}
                        color={theme.palette.neutral[1000]}
                        sx={{ textTransform: 'capitalize' }}
                    >
                        {t(method?.replaceAll('_', ' '))}
                    </Typography>
                </Stack>
                <Typography
                    fontSize="16px"
                    fontWeight={700}
                    color={theme.palette.neutral[1000]}
                >
                    {amount}
                </Typography>
            </Stack>
            {showPayDigitally && (
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    gap="10px"
                    padding="15px"
                    borderRadius="10px"
                    sx={{ backgroundColor: theme.palette.neutral[100] }}
                >
                    <Stack gap="2px">
                        <Typography
                            fontSize="15px"
                            fontWeight={600}
                            color={theme.palette.neutral[1000]}
                        >
                            {t('No Cash In Your Hand?')}
                        </Typography>
                        <Typography
                            fontSize="13px"
                            fontWeight={400}
                            color={theme.palette.neutral[400]}
                        >
                            {t('Select Any Digital Gateways To Pay')}
                        </Typography>
                    </Stack>
                    <Button
                        variant="contained"
                        onClick={onPayDigitally}
                        sx={{
                            borderRadius: '8px',
                            padding: '10px 22px',
                            fontSize: '14px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            boxShadow: 'none',
                            flexShrink: 0,
                        }}
                    >
                        {t('Pay Digitally')}
                    </Button>
                </Stack>
            )}
        </Stack>
    )
}

export default PaymentMethodCard
