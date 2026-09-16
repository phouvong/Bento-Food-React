import { Box, Button, Stack, Tooltip, Typography, styled } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'
import { HOME_SECTION_SPACING } from '../homeSectionSpacing'

const SPACING = HOME_SECTION_SPACING.referFriend

const ReferIconSvg = () => (
    <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g clipPath="url(#clip0_300_41374)">
            <path
                d="M14.3912 17.156C14.1018 16.5771 14.3365 15.8732 14.9153 15.5837L24.0365 11.0232C24.6153 10.7337 25.3192 10.9683 25.6087 11.5472C25.8982 12.1261 25.6635 12.83 25.0847 13.1195L15.9635 17.68C15.3866 17.9685 14.6816 17.7368 14.3912 17.156Z"
                fill="#8979DB"
            />
            <path
                d="M24.0365 28.9768L14.9153 24.4163C14.3364 24.1268 14.1018 23.4229 14.3913 22.844C14.6807 22.2651 15.3847 22.0304 15.9635 22.3199L25.0847 26.8805C25.6636 27.1699 25.8982 27.8739 25.6088 28.4528C25.3189 29.0324 24.6146 29.2659 24.0365 28.9768Z"
                fill="#8979DB"
            />
            <path
                d="M2.59297 26.1911H14.8133C16.413 24.6121 17.4062 22.42 17.4062 19.9999C17.4062 15.201 13.502 11.2968 8.70312 11.2968C3.90422 11.2968 0 15.201 0 20C0 22.42 0.993203 24.6121 2.59297 26.1911Z"
                fill="#2974FF"
            />
            <path
                d="M8.70314 23.6823C10.7368 23.6823 12.3854 22.0337 12.3854 20C12.3854 17.9664 10.7368 16.3177 8.70314 16.3177C6.66948 16.3177 5.02087 17.9664 5.02087 20C5.02087 22.0337 6.66948 23.6823 8.70314 23.6823Z"
                fill="white"
            />
            <path
                d="M2.59296 26.1912C4.16553 27.7433 6.32421 28.7031 8.70311 28.7031C11.082 28.7031 13.2407 27.7433 14.8133 26.1912C13.19 24.5908 10.9927 23.6823 8.70311 23.6823C6.4135 23.6823 4.21624 24.5908 2.59296 26.1912Z"
                fill="white"
            />
            <path
                d="M25.1867 14.8943H37.407C39.0068 13.3153 40 11.1231 40 8.70312C40 3.90422 36.0958 0 31.2969 0C26.498 0 22.5938 3.90422 22.5938 8.70312C22.5938 11.1231 23.587 13.3153 25.1867 14.8943Z"
                fill="#E15412"
            />
            <path
                d="M31.2969 12.3854C33.3305 12.3854 34.9792 10.7368 34.9792 8.70314C34.9792 6.66948 33.3305 5.02087 31.2969 5.02087C29.2632 5.02087 27.6146 6.66948 27.6146 8.70314C27.6146 10.7368 29.2632 12.3854 31.2969 12.3854Z"
                fill="white"
            />
            <path
                d="M25.1867 14.8943C26.7593 16.4465 28.918 17.4062 31.2969 17.4062C33.6758 17.4062 35.8344 16.4465 37.407 14.8943C35.7837 13.294 33.5865 12.3854 31.2969 12.3854C29.0073 12.3855 26.8101 13.294 25.1867 14.8943Z"
                fill="white"
            />
            <path
                d="M25.1867 37.488H37.407C39.0068 35.909 40 33.7169 40 31.2969C40 26.498 36.0958 22.5938 31.2969 22.5938C26.498 22.5938 22.5938 26.498 22.5938 31.2969C22.5938 33.7169 23.587 35.909 25.1867 37.488Z"
                fill="#FF9D26"
            />
            <path
                d="M31.2969 34.9792C33.3305 34.9792 34.9792 33.3305 34.9792 31.2969C34.9792 29.2632 33.3305 27.6146 31.2969 27.6146C29.2632 27.6146 27.6146 29.2632 27.6146 31.2969C27.6146 33.3305 29.2632 34.9792 31.2969 34.9792Z"
                fill="white"
            />
            <path
                d="M25.1867 37.488C26.7593 39.0402 28.918 40 31.2969 40C33.6758 40 35.8344 39.0402 37.407 37.488C35.7837 35.8877 33.5865 34.9791 31.2969 34.9791C29.0073 34.9791 26.8101 35.8877 25.1867 37.488Z"
                fill="white"
            />
        </g>
        <defs>
            <clipPath id="clip0_300_41374">
                <rect width="40" height="40" fill="white" />
            </clipPath>
        </defs>
    </svg>
)

const ReferHeader = styled(Stack)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '12px',
    backgroundColor: theme.palette.referBanner.bg,
    padding: '12px 20px 12px 16px',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    '&::before': {
        content: '""',
        position: 'absolute',
        right: '-59px',
        top: '-20px',
        width: '119px',
        height: '119px',
        borderRadius: '90px',
        background: alpha(theme.palette.text.primary, 0.05),
        pointerEvents: 'none',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        right: '28px',
        bottom: '-74px',
        width: '105px',
        height: '106px',
        borderRadius: '80px',
        background: alpha(theme.palette.text.primary, 0.05),
        pointerEvents: 'none',
    },
    [theme.breakpoints.up('sm')]: {
        padding: '24px 32px',
        gap: '16px',
    },
}))

// Refer-a-friend promo strip. The old FindNearbyReferStrip paired this with a
// "Find Nearby" card in a two-column grid — that half is removed in the
// redesign (nearby restaurants now live in their own dine-in drawer flow
// elsewhere on the page), so this is a standalone, always-full-width banner.
const ReferFriendCard = () => {
    const { t } = useTranslation()
    const theme = useTheme()
    const router = useRouter()
    const { global } = useSelector((state) => state.globalSettings)

    const showRefer =
        global?.ref_earning_status && global?.ref_earning_exchange_rate !== 0

    const handleReferClick = () => {
        const token = getToken()
        if (token) {
            router.push('/info?page=referral')
        } else {
            toast.error(t('please login first'))
        }
    }

    if (!showRefer) return null

    const titleText = `${t('Earn ')}${global?.currency_symbol ?? ''}${
        global?.ref_earning_exchange_rate ?? ''
    } · ${t('Refer a Friend')}`
    const subtitleText = `${t(
        'Refer your code to your friends and get'
    )} ${global?.currency_symbol ?? ''}${
        global?.ref_earning_exchange_rate ?? ''
    } ${t('for every referral!')}`

    return (
        <ReferHeader sx={{ mt: SPACING.pt, mb: SPACING.pb }}>
            <Box
                sx={{
                    zIndex: 1,
                    flexShrink: 0,
                    width: { xs: '32px', sm: '40px' },
                    height: { xs: '32px', sm: '40px' },
                    '& svg': { width: '100%', height: '100%' },
                }}
            >
                <ReferIconSvg />
            </Box>
            <Stack gap="4px" sx={{ zIndex: 1, flex: 1, minWidth: 0 }}>
                <Tooltip
                    title={titleText}
                    enterTouchDelay={0}
                    leaveTouchDelay={2500}
                    placement="top"
                    arrow
                    slotProps={{ tooltip: { sx: { fontSize: '11px' } } }}
                >
                    <Typography
                        fontSize={{ xs: '14px', sm: '24px' }}
                        fontWeight={700}
                        color={theme.palette.referBanner.title}
                        letterSpacing={{ xs: '-0.42px', sm: '-0.6px' }}
                        lineHeight={1.1}
                        component="h3"
                        noWrap
                    >
                        {titleText}
                    </Typography>
                </Tooltip>
                <Tooltip
                    title={subtitleText}
                    enterTouchDelay={0}
                    leaveTouchDelay={2500}
                    placement="bottom"
                    arrow
                    slotProps={{ tooltip: { sx: { fontSize: '11px' } } }}
                >
                    <Typography
                        fontSize={{ xs: '12px', sm: '16px' }}
                        color={theme.palette.referBanner.subtitle}
                        letterSpacing={{ xs: '-0.36px', sm: '-0.48px' }}
                        lineHeight={1.2}
                        component="p"
                        noWrap
                    >
                        {subtitleText}
                    </Typography>
                </Tooltip>
            </Stack>
            <Button
                variant="contained"
                onClick={handleReferClick}
                sx={{
                    zIndex: 1,
                    flexShrink: 0,
                    height: { xs: 'auto', sm: '40px' },
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.common.white,
                    borderRadius: { xs: '4px', sm: '8px' },
                    fontWeight: { xs: 600, sm: 700 },
                    fontSize: { xs: '12px', sm: '16px' },
                    letterSpacing: { xs: '-0.24px', sm: '-0.48px' },
                    px: { xs: '8px', sm: '16px' },
                    py: { xs: '6px', sm: '8px' },
                    minWidth: 0,
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                    },
                }}
            >
                {t('Refer Now')}
            </Button>
        </ReferHeader>
    )
}

export default ReferFriendCard
