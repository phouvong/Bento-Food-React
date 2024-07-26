import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {
    Grid,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { useTheme } from '@mui/material/styles'
import { t } from 'i18next'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '../../../styled-components/CustomStyles.style'
import { getAmount } from '../../../utils/customFunctions'
import Meta from '../../Meta'
import HowItWorks from './HowItWorks'
import ReferAFriend from './ReferAFriend'
import { CodePreviewWrapper } from './ReferralCode.style'
import ReferralShare from './ReferralShare'

const ReferCodePage = () => {
    const theme = useTheme()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const [tooltipOpen, setTooltipOpen] = useState(false)
    const { global } = useSelector((state) => state.globalSettings)
    const { userData } = useSelector((state) => state.user)
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }
    const referral = t('referral')
    const get = t('Get')
    const join = t('on joining')
    const copyReferCode = async (text) => {
        if (typeof window !== undefined) {
            await window.navigator.clipboard.writeText(text)
        }
    }

    const handleTooltipClose = () => {
        setTooltipOpen(false)
    }

    const handleTooltipOpen = async (refer_code) => {
        setTooltipOpen(true)
        await copyReferCode(refer_code)
        CustomToaster('success', t('Referral Code Copied'))
    }
    const referImage1 = <ReferAFriend />
    return (
        <>
            <Meta
                title={` My Referral -${global?.business_name}`}
                description=""
                keywords=""
            />
            <CustomPaperBigCard
                padding={isXSmall ? '1rem' : '30px 40px'}
                sx={{ minHeight: !isXSmall ? '558px' : '450px' }}
            >
                <CustomStackFullWidth
                    my="2rem"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Grid
                        container
                        justifyContent="center"
                        alignItems="center"
                        spacing={{ xs: 1, md: 2 }}
                    >
                        <Grid xs={12} sm={12} md={12} height="100%">
                            <CustomStackFullWidth
                                alignItems="center"
                                justifyContent="center"
                                spacing={1}
                                height="100%"
                                p="1rem"
                            >
                                <Stack
                                    width="100%"
                                    alignItems="center"
                                    maxWidth="420px"
                                >
                                    <ReferAFriend />
                                </Stack>
                                <Typography
                                    fontSize={{
                                        xs: '14px',
                                        sm: '16px',
                                        md: '16px',
                                    }}
                                    // width="323px"
                                    align="center"
                                >
                                    <Typography component="span">
                                        {t(
                                            'Refer your code to your friends and get'
                                        )}
                                    </Typography>
                                    <Typography
                                        component="span"
                                        fontWeight="700"
                                        marginRight="2px"
                                        marginLeft="2px"
                                    >
                                        {`${get} ${getAmount(
                                            global?.ref_earning_exchange_rate,
                                            currencySymbolDirection,
                                            currencySymbol,
                                            digitAfterDecimalPoint
                                        )} ${join}`}
                                    </Typography>
                                    <Typography component="span">
                                        {t('for every referral!')}
                                    </Typography>
                                </Typography>
                            </CustomStackFullWidth>
                        </Grid>

                        <Grid xs={12} md={12} align="center">
                            <Stack
                                sx={{ p: '1rem' }}
                                gap={{ xs: '10px', sm: '15px', md: '20px' }}
                                maxWidth="450px"
                                width="100%"
                                justifyContent="center"
                            >
                                <CodePreviewWrapper
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Typography
                                        fontWeight="600"
                                        color={theme.palette.primary.main}
                                    >
                                        {userData.ref_code}{' '}
                                    </Typography>
                                    <Stack>
                                        <ClickAwayListener
                                            onClickAway={handleTooltipClose}
                                        >
                                            <Tooltip
                                                placement="top"
                                                PopperProps={{
                                                    disablePortal: true,
                                                }}
                                                onClose={handleTooltipClose}
                                                open={tooltipOpen}
                                                disableFocusListener
                                                disableHoverListener
                                                disableTouchListener
                                                title={t('Copied')}
                                            >
                                                {/*<Button onClick={handleTooltipOpen}>Click</Button>*/}
                                                <IconButton
                                                    onClick={() =>
                                                        handleTooltipOpen(
                                                            userData.ref_code
                                                        )
                                                    }
                                                >
                                                    <Stack>
                                                        <ContentCopyIcon
                                                            sx={{
                                                                color: theme
                                                                    .palette
                                                                    .primary
                                                                    .main,
                                                            }}
                                                            style={{
                                                                fontSize: 16,
                                                                textAlign:
                                                                    'right',
                                                            }}
                                                        />
                                                        {/*<Typography color={theme.palette.neutral[1000]} variant="subtitle2">{t("Tap to copy")}</Typography>*/}
                                                    </Stack>
                                                </IconButton>
                                            </Tooltip>
                                        </ClickAwayListener>
                                    </Stack>
                                </CodePreviewWrapper>
                                <Typography>{t('OR SHARE')}</Typography>
                                <ReferralShare
                                    referralCode={userData.ref_code}
                                    configData={global}
                                    size={isXSmall ? 30 : 40}
                                />
                            </Stack>
                        </Grid>
                        <Grid xs={12} md={12} align="center" padding="0 10px">
                            <HowItWorks configData={global} />
                        </Grid>
                    </Grid>
                </CustomStackFullWidth>
            </CustomPaperBigCard>
        </>
    )
}
export default ReferCodePage
