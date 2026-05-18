import { Box, Stack, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { CustomTypographyGray } from '../../error/Errors.style'
const LoyalityPage = ({ data }) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const isDebit = data?.loyality?.transaction_type === 'point_to_wallet'
    const amountValue = isDebit ? data?.loyality?.debit : data?.loyality?.credit

    return (
        <Box
            sx={{
                backgroundColor:
                    theme.palette.mode === 'dark'
                        ? (theme) => theme.palette.cardBackground1
                        : (theme) => alpha(theme.palette.neutral[200], 0.5),
                borderRadius: '10px',
                padding: '12px 14px',
                height:"100%",
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
            >
                <Stack spacing={0.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.99995 1.79883C5.4776 1.79883 1.79846 5.47805 1.79846 10.0004C1.79846 14.5227 5.4776 18.2019 9.99995 18.2019C14.5222 18.2019 18.2014 14.5226 18.2014 10.0004C18.2014 5.47816 14.5222 1.79883 9.99995 1.79883ZM9.99995 16.4472C6.44522 16.4472 3.55311 13.5551 3.55311 10.0004C3.55311 6.44566 6.44522 3.55344 9.99995 3.55344C13.5547 3.55344 16.4468 6.44562 16.4468 10.0004C16.4468 13.5551 13.5547 16.4472 9.99995 16.4472ZM9.99995 4.72852C7.09303 4.72852 4.72811 7.09344 4.72811 10.0004C4.72811 12.9073 7.09299 15.2721 9.99995 15.2721C12.907 15.2721 15.2718 12.9073 15.2718 10.0004C15.2718 7.09336 12.907 4.72852 9.99995 4.72852ZM10.8129 12.755H10.5874V13.0785C10.5874 13.403 10.3244 13.6659 9.99995 13.6659C9.67545 13.6659 9.41245 13.403 9.41245 13.0785V12.755H9.24143C8.60178 12.755 8.01092 12.3802 7.7342 11.804C7.59381 11.5118 7.71737 11.1605 8.00956 11.0201C8.30182 10.8797 8.65311 11.0034 8.7935 11.2955C8.87581 11.4668 9.05073 11.58 9.24143 11.58H10.8129C11.0864 11.58 11.309 11.3574 11.309 11.0839C11.309 10.8105 11.0864 10.5878 10.8129 10.5878H9.18694C8.26549 10.5878 7.51584 9.8382 7.51584 8.91676C7.51584 7.99527 8.26545 7.24563 9.18694 7.24563H9.41241V6.92219C9.41241 6.59766 9.67542 6.33473 9.99991 6.33473C10.3244 6.33473 10.5874 6.59766 10.5874 6.92219V7.24563H10.7584C11.398 7.24563 11.9887 7.62059 12.2655 8.19664C12.4059 8.48891 12.2826 8.84023 11.9903 8.98063C11.6981 9.12098 11.3467 8.99734 11.2064 8.70523C11.124 8.53391 10.9492 8.4207 10.7585 8.4207H9.18698C8.91346 8.4207 8.69092 8.64328 8.69092 8.9168C8.69092 9.19023 8.91354 9.41289 9.18698 9.41289H10.813C11.7344 9.41289 12.484 10.1625 12.484 11.084C12.484 12.0054 11.7344 12.755 10.8129 12.755Z" fill={isDebit ? theme.palette.error.main : '#04BB7B'} />
                        </svg>
                        <Typography fontWeight="500" fontSize="18px">
                            {isDebit ? '-' : '+'} {amountValue}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={.5} alignItems="center">
                        <CustomTypographyGray
                            textTransform="capitalize"
                            sx={{ fontSize: '13px', fontWeight: '500' }}
                        >
                            {t(
                                data?.loyality?.transaction_type?.replaceAll(
                                    '_',
                                    ' '
                                )
                            )}
                        </CustomTypographyGray>
                        {data?.loyality?.reference && (
                            <CustomTypographyGray
                                sx={{ fontSize: '12px', fontWeight: '500' }}
                            >
                                Order # {data?.loyality?.reference}
                            </CustomTypographyGray>
                        )}
                    </Stack>
                </Stack>
                <Stack alignItems="flex-end" spacing={0.5}>
                     <CustomTypographyGray
                        sx={{ fontSize: '12px', fontWeight: '400' }}
                    >
                        {data?.loyality?.created_at}
                    </CustomTypographyGray>
                    <Typography
                        textTransform="capitalize"
                        sx={{ fontSize: '13px', fontWeight: '500' }}
                        color={
                            isDebit
                                ? theme.palette.error.main
                                : theme.palette.success.main
                        }
                    >
                        {isDebit ? t('debit') : t('credit')}
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    )
}

export default LoyalityPage
