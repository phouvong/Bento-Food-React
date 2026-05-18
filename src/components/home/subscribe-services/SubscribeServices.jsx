import { useState } from 'react'
import Router from 'next/router'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Box, Button, InputBase, Stack, Typography, alpha } from '@mui/material'
import { styled } from '@mui/material/styles'
import SendIcon from '@mui/icons-material/Send'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'

import { usePostNewsletterEmail } from '@/hooks/react-query/newsletter/usePostNewsletterEmail'
import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import { onErrorResponse } from '@/components/ErrorResponse'
import { RouteLinksData } from '@/components/footer/RouteLinksData'

const NewsletterCard = styled(Box)(({ theme }) => ({
    borderRadius: 20,
    padding: '24px 28px',
    [theme.breakpoints.down('sm')]: {
        padding: '12px',
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    flexWrap: 'wrap',
    position: 'relative',
    overflow: 'hidden',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    background:
        theme.palette.mode === 'dark'
            ? `linear-gradient(120deg, ${alpha(
                  theme.palette.primary.main,
                  0.12
              )} 0%, ${theme.palette.background.paper} 100%)`
            : `linear-gradient(120deg, ${alpha(
                  theme.palette.primary.main,
                  0.08
              )} 0%, ${theme.palette.background.paper} 100%)`,
    boxShadow: theme.shadows[1],
    '&::after': {
        content: '""',
        position: 'absolute',
        right: -40,
        top: -40,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(
            theme.palette.primary.main,
            0.15
        )} 0%, transparent 70%)`,
        pointerEvents: 'none',
    },
}))

const NewsForm = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.palette.neutral[200],
    borderRadius: 999,
    padding: 5,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
    width: '100%',
    maxWidth: 460,
    position: 'relative',
    zIndex: 1,
}))

const ServiceGrid = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
    '& > *': {
        flex: '1 1 calc(25% - 9px)',
        minWidth: 220,
        maxWidth: 'calc(25% - 9px)',
    },
    [theme.breakpoints.down('md')]: {
        '& > *': {
            flex: '1 1 calc(50% - 6px)',
            maxWidth: 'calc(50% - 6px)',
        },
    },
    [theme.breakpoints.down('sm')]: {
        '& > *': {
            flex: '1 1 100%',
            maxWidth: '100%',
        },
    },
}))

const ServiceCard = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.neutral[200],
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 14,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.06),
    },
    '&:hover .svc-chev': {
        color: theme.palette.primary.main,
        transform: 'translateX(2px)',
    },
}))

const ServiceIcon = styled(Box)(({ theme }) => ({
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    '& svg': { fontSize: 20 },
}))

const SERVICE_ICONS = {
    restaurant_owner: <StorefrontOutlinedIcon />,
    delivery_man: <TwoWheelerOutlinedIcon />,
    profile: <PersonOutlineOutlinedIcon />,
    helpandsupport: <HelpOutlineOutlinedIcon />,
}

const SERVICE_SUBTITLE = {
    restaurant_owner: 'Partner with us',
    delivery_man: 'Earn on your schedule',
    profile: 'Manage your account',
    helpandsupport: "We're here 24/7",
}

const SubscribeServices = () => {
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)
    const { token } = useSelector((state) => state.userToken)
    const { landingPageData } = useSelector((state) => state.storedData)
    const { userData } = useSelector((state) => state.user)
    const [email, setEmail] = useState(userData?.email || '')
    const { mutate, isLoading } = usePostNewsletterEmail()

    const handleSubscribe = (e) => {
        e?.preventDefault()
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            CustomToaster('error', 'Please enter a valid email address')
            return
        }
        mutate(
            { email },
            {
                onSuccess: (res) => {
                    CustomToaster(
                        'success',
                        res?.message || 'Subscribed successfully'
                    )
                    setEmail('')
                },
                onError: onErrorResponse,
            }
        )
    }

    const handleServiceClick = (item) => {
        if (item.value === 'profile') {
            if (token) {
                Router.push(
                    { pathname: '/info', query: { page: 'profile' } },
                    undefined,
                    { shallow: true }
                )
            } else {
                CustomToaster('error', 'You must be login to access this page.')
            }
        } else if (
            item.value === 'restaurant_owner' ||
            item.value === 'delivery_man'
        ) {
            Router.push(item.link)
        } else {
            Router.push(item.link)
        }
    }

    const visibleServices = RouteLinksData.filter((item) => {
        if (
            item.value === 'delivery_man' &&
            global?.toggle_dm_registration === false
        ) {
            return false
        }
        if (
            item.value === 'restaurant_owner' &&
            global?.toggle_restaurant_registration === false
        ) {
            return false
        }
        return true
    })

    return (
        <Box
            component="section"
            sx={{
                px: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 2, md: 4 },
               
            }}
        >
            <NewsletterCard>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography
                        sx={{
                            fontSize: { xs: '18px', md: '20px' },
                            fontWeight: 800,
                            letterSpacing: '-0.01em',
                            color: (theme) => theme.palette.text.primary,
                            mb: '4px',
                        }}
                    >
                        {landingPageData?.news_letter_title || t("Let's Connect!")}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '13.5px',
                            color: (theme) => theme.palette.text.secondary,
                        }}
                    >
                        {landingPageData?.news_letter_sub_title ||
                            t(
                                'Stay up to date with restaurants around you. Subscribe with email.'
                            )}
                    </Typography>
                </Box>

                <NewsForm component="form" onSubmit={handleSubscribe}>
                    <InputBase
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('Your Email Address')}
                        sx={{
                            flex: 1,
                            px: '14px',
                            fontSize: '13px',
                            color: (theme) => theme.palette.text.primary,
                        }}
                        inputProps={{ 'aria-label': t('Your Email Address') }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                        sx={{
                            borderRadius: 999,
                            px: { xs: '10px', sm: '18px' },
                            py: '10px',
                            minWidth: { xs: 'unset', sm: 'auto' },
                            fontSize: '13px',
                            fontWeight: 600,
                            color: (theme) =>
                                theme.palette.primary.contrastText,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                        }}
                    >
                        <SendIcon sx={{ fontSize: 16, transform: 'rotate(-45deg)' }} />
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                            {t('Subscribe')}
                        </Box>
                    </Button>
                </NewsForm>
            </NewsletterCard>

            <ServiceGrid>
                {visibleServices.map((item) => (
                    <ServiceCard
                        key={item.value}
                        onClick={() => handleServiceClick(item)}
                        role="button"
                        tabIndex={0}
                    >
                        <ServiceIcon>{SERVICE_ICONS[item.value]}</ServiceIcon>
                        <Stack spacing={0} sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {t(item.name)}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: (theme) =>
                                        theme.palette.text.secondary,
                                }}
                            >
                                {t(SERVICE_SUBTITLE[item.value] || '')}
                            </Typography>
                        </Stack>
                    </ServiceCard>
                ))}
            </ServiceGrid>
        </Box>
    )
}

export default SubscribeServices
