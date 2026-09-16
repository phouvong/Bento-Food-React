import React, { useState } from 'react'
import {
    Button,
    Dialog,
    IconButton,
    Radio,
    Stack,
    Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

// Matches the items of global settings' `active_payment_method_list`; only the
// fields this modal reads are typed, extra backend fields pass through untouched.
export interface PaymentGateway {
    gateway: string
    gateway_title?: string
    gateway_image_full_url?: string
}

// Generic over the gateway item so `onProceed` hands back the exact object the
// parent supplied (including untyped backend fields), not a narrowed copy.
interface PayDigitallyModalProps<G extends PaymentGateway> {
    open: boolean
    onClose: () => void
    gateways: G[]
    // Preformatted with getAmount by the parent so currency config stays in one place.
    totalAmount: string
    onProceed: (gateway: G) => void
    // True while the pay-digitally request is in flight — disables Proceed
    // so the redirect can't be requested twice.
    proceedLoading?: boolean
}

const PayDigitallyModal = <G extends PaymentGateway>({
    open,
    onClose,
    gateways,
    totalAmount,
    onProceed,
    proceedLoading = false,
}: PayDigitallyModalProps<G>) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const [selected, setSelected] = useState<G | null>(null)

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '480px',
                    margin: '16px',
                },
            }}
        >
            <Stack padding={{ xs: '16px', sm: '24px' }} gap="16px">
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    gap="10px"
                >
                    <Stack gap="2px">
                        <Typography
                            fontSize="16px"
                            fontWeight={700}
                            color={theme.palette.neutral[1000]}
                        >
                            {t('Complete Payment by Digitally')}
                        </Typography>
                        <Typography
                            fontSize="12px"
                            fontWeight={400}
                            color={theme.palette.neutral[500]}
                        >
                            {t(
                                'Pay online using your preferred payment method.'
                            )}
                        </Typography>
                    </Stack>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            width: '28px',
                            height: '28px',
                            border: `1px solid ${theme.palette.divider}`,
                            color: theme.palette.neutral[500],
                        }}
                    >
                        <CloseIcon sx={{ fontSize: '16px' }} />
                    </IconButton>
                </Stack>
                <Stack
                    gap="10px"
                    padding="15px"
                    borderRadius="10px"
                    sx={{
                        // Dark palette's neutral[300] is a light text tone,
                        // not a surface — swap to the dark card surface.
                        backgroundColor:
                            theme.palette.mode === 'dark'
                                ? theme.palette.neutral[200]
                                : theme.palette.neutral[300],
                    }}
                >
                    <Typography
                        fontSize="14px"
                        fontWeight={600}
                        color={theme.palette.neutral[1000]}
                    >
                        {t('Choose Payment Method')}
                    </Typography>
                    {gateways?.map((item) => (
                        <Stack
                            key={item.gateway}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            gap="10px"
                            padding="12px 14px"
                            borderRadius="8px"
                            onClick={() => setSelected(item)}
                            sx={{
                                backgroundColor: theme.palette.neutral[100],
                                cursor: 'pointer',
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                gap="12px"
                            >
                                {item.gateway_image_full_url && (
                                    <Image
                                        src={item.gateway_image_full_url}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        alt={item.gateway}
                                        style={{
                                            width: 'auto',
                                            height: '24px',
                                            maxWidth: '90px',
                                            objectFit: 'contain',
                                        }}
                                    />
                                )}
                                <Typography
                                    fontSize="13px"
                                    fontWeight={500}
                                    color={theme.palette.neutral[1000]}
                                >
                                    {item.gateway_title ??
                                        item.gateway?.replaceAll('_', ' ')}
                                </Typography>
                            </Stack>
                            <Radio
                                checked={selected?.gateway === item.gateway}
                                onChange={() => setSelected(item)}
                                sx={{
                                    padding: 0,
                                    color: theme.palette.neutral[400],
                                    '& .MuiSvgIcon-root': {
                                        fontSize: '22px',
                                    },
                                }}
                            />
                        </Stack>
                    ))}
                </Stack>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Typography
                        fontSize="14px"
                        fontWeight={500}
                        color={theme.palette.neutral[1000]}
                    >
                        {t('Total')}
                    </Typography>
                    <Typography
                        fontSize="18px"
                        fontWeight={700}
                        color={theme.palette.neutral[1000]}
                    >
                        {totalAmount}
                    </Typography>
                </Stack>
                <Button
                    variant="contained"
                    fullWidth
                    disabled={!selected || proceedLoading}
                    onClick={() => selected && onProceed(selected)}
                    sx={{
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '15px',
                        fontWeight: 600,
                        boxShadow: 'none',
                    }}
                >
                    {t('Proceed')}
                </Button>
            </Stack>
        </Dialog>
    )
}

export default PayDigitallyModal
