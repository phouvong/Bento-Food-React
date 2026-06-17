import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { getAmount } from '@/utils/customFunctions'
import { Grid, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { t } from 'i18next'
import { CustomTypographyGray } from '../../error/Errors.style'

const WalletsPage = (props) => {
    const {
        data,
        currencySymbolDirection,
        currencySymbol,
        digitAfterDecimalPoint,
        isLoading,
    } = props
    const theme = useTheme()
    const languageDirection = localStorage.getItem('direction')
    const debit = data?.debit + data?.admin_bonus
    const credit = data?.credit + data?.admin_bonus
    // Debit-type transactions all share the same UI treatment (minus sign,
    // error color, "debit" label) — listing them in one set keeps the
    // ternaries below in sync and avoids missing a spot when a new debit
    // category is added (e.g. `pro_subscription`).
    const isDebit =
        data?.transaction_type === 'order_place' ||
        data?.transaction_type === 'partial_payment' ||
        data?.transaction_type === 'pro_subscription'
    return (
        <>
            <Grid
                container
                item
                sm={12}
                md={12}
                xs={12}
                padding={{ xs: '.6rem', md: '1rem' }}
                justifyContent="space-between"
                sx={{
                    backgroundColor:
                        theme.palette.mode === 'dark'
                            ? (theme) => theme.palette.cardBackground1
                            : (theme) => theme.palette.neutral[200],
                    marginBottom: '5px',
                    borderRadius: '10px',
                }}
            >
                <Grid item md={7} xs={4.5}>
                    <CustomStackFullWidth>
                        <Stack
                            flexDirection="row"
                            gap="8px"
                            alignItems="center"
                        >
                            <Typography
                                fontSize="20px"
                                fontWeight={600}
                                color={
                                    isDebit
                                        ? theme.palette.error.main
                                        : theme.palette.success.main
                                }
                            >
                                {isDebit ? '-' : '+'}
                            </Typography>
                            <Typography
                                fontWeight="700"
                                fontSize={{ xs: '16px', sm: '20px' }}
                            >
                                {getAmount(
                                    isDebit ? debit : credit,
                                    currencySymbolDirection,
                                    currencySymbol,
                                    digitAfterDecimalPoint
                                )}
                            </Typography>
                        </Stack>
                        {data?.transaction_type === 'add_fund' ? (
                            <CustomTypographyGray
                                textTransform="capitalize"
                                sx={{
                                    fontSize: { xs: '12px', sm: '13px' },
                                    fontWeight: '400',
                                }}
                            >
                                {t('added via')}{' '}
                                {t(data?.reference).replaceAll('_', ' ')} (
                                {t('bonus')}:
                                {getAmount(
                                    data?.admin_bonus,
                                    currencySymbolDirection,
                                    currencySymbol,
                                    digitAfterDecimalPoint
                                )}
                                )
                            </CustomTypographyGray>
                        ) : (
                            <CustomTypographyGray
                                textTransform="capitalize"
                                sx={{ fontSize: '13px', fontWeight: '400' }}
                            >
                                {t(data?.transaction_type).replaceAll('_', ' ')}
                            </CustomTypographyGray>
                        )}
                    </CustomStackFullWidth>
                </Grid>
                <Grid item md={5} xs={7.5} sm={7.5}>
                    <Stack
                        justifyContent="flex-end"
                        alignItems="end"
                        flexWrap="wrap"
                    >
                        <Typography
                            textTransform="capitalize"
                            fontSize="13px"
                            color={
                                isDebit
                                    ? theme.palette.error.main
                                    : theme.palette.success.main
                            }
                            paddingRight={
                                languageDirection === 'rtl' ? '24px' : '0px'
                            }
                        >
                            {isDebit ? t('debit') : t('credit')}
                        </Typography>
                        <CustomTypographyGray
                            sx={{ fontSize: '13px', fontWeight: '400' }}
                        >
                            {data?.created_at}
                        </CustomTypographyGray>
                    </Stack>
                </Grid>
            </Grid>
        </>
    )
}

export default WalletsPage
