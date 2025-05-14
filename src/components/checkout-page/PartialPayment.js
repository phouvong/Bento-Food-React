import React from 'react'
import partialImage from './assets/partail.png'
import { alpha, Button, Typography, Stack, IconButton } from '@mui/material'
import PartialSvg from './assets/PartialSvg'
import { t } from 'i18next'
import { useTheme } from '@emotion/react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { getAmount } from '@/utils/customFunctions'
import CloseIcon from '@mui/icons-material/Close';

const PartialPayment = ({
    handlePartialPayment,
    usePartialPayment,
    walletBalance,
    removePartialPayment,
    switchToWallet,
    remainingBalance,
    totalAmount,
    global,
    paymentMethod,
    offLineWithPartial,
}) => {
    const theme = useTheme()
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }
    return (
        <CustomStackFullWidth
            sx={{
               flexDirection:"row",
                padding: ' 6px 10px',
                
                borderRadius: '8px',
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.neutral[600], 0.2),
                alignItems: 'center',
            
            }}
        >
            <CustomStackFullWidth direction="row" spacing={1} alignItems="center">
                <PartialSvg />
                <Stack>
                    <Typography
                        fontSize="10px"
                        fontWeight="500"
                        color={theme.palette.neutral[600]}
                    >
                        {   paymentMethod === 'wallet' && switchToWallet ? t('Remaining Balance') : t('Wallet Balance')}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                        fontSize="17px"
                        fontWeight="600"
                        color={theme.palette.neutral[900]}
                    >
                        {paymentMethod === 'wallet' && switchToWallet ? getAmount(
                            walletBalance-totalAmount,
                            currencySymbolDirection,
                            currencySymbol,
                            digitAfterDecimalPoint
                        ) : getAmount(
                            walletBalance,
                            currencySymbolDirection,
                            currencySymbol,
                            digitAfterDecimalPoint
                        )}
                    </Typography>
                    {!offLineWithPartial &&
                !usePartialPayment &&
                !switchToWallet ?null:(
                    <Typography fontSize="12px" fontWeight="400" color={theme.palette.primary.main} >({t("Applied")})</Typography>
                )}
                    </Stack>
                </Stack>
            </CustomStackFullWidth>
            <CustomStackFullWidth
                direction="row"
                justifyContent="end"
                alignItems="end"
            >
               
                {!offLineWithPartial &&
                !usePartialPayment &&
                !switchToWallet ? (
                    <Button variant="outlined" onClick={handlePartialPayment} sx={{
                        color: theme.palette.primary.main,
                        padding: '5px 10px',
                        fontSize: '12px',
                    }}>
                        {t('Apply')}
                    </Button>
                ) : (
                    <IconButton
                        onClick={removePartialPayment}
                        sx={{
                            color: theme.palette.error.main,
                            backgroundColor: (theme) =>
                                theme.palette.neutral[100],
                        }}
                    >
                        <CloseIcon fontSize="12px" />
                    </IconButton>
                )}
            </CustomStackFullWidth>
        </CustomStackFullWidth>
    )
}

export default PartialPayment
