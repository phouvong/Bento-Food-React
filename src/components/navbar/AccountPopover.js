import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import { Box, Popover, Stack, Typography, alpha } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useQueryClient } from 'react-query'

import { setWelcomeModal } from '@/redux/slices/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { removeToken } from '@/redux/slices/userToken'
import { clearWishList } from '@/redux/slices/wishList'
import CustomDialogConfirm from '../custom-dialog/confirm/CustomDialogConfirm'

// requireAuth: unauthenticated click opens the login modal instead of navigating.
// hiddenKey: matches a global config flag this item disappears for (0 = off).
// path: items that don't go through /info?page= — same destinations the old
// TopNav "Track Order" / "Help" text links used.
export const menuData = [
    { id: 1, label: 'My Orders', value: 'order', icon: 'fi-rr-receipt', requireAuth: true },
    { id: 2, label: 'Profile', value: 'profile', icon: 'fi-rr-circle-user', requireAuth: true },
    { id: 3, label: 'Wallets', value: 'wallets', icon: 'fi-rr-wallet', requireAuth: true, hiddenKey: 'customer_wallet_status' },
    { id: 4, label: 'Inbox', value: 'inbox', icon: 'fi-rr-messages', requireAuth: true },
    { id: 5, label: 'Track Order', path: '/tracking', icon: 'fi-rr-biking-mountain', requireAuth: false },
    { id: 6, label: 'Wish List', value: 'wishlist', icon: 'fi-rr-heart', requireAuth: true },
    { id: 7, label: 'Coupons', value: 'coupons', icon: 'fi-rr-ticket', requireAuth: true },
    { id: 8, label: 'Loyalty Points', value: 'loyalty', icon: 'fi-rr-badge', requireAuth: true, hiddenKey: 'loyalty_point_status' },
    { id: 9, label: 'Subscription Plan', value: 'subscription', icon: 'fi-rr-crown', requireAuth: true, proOnly: true },
    { id: 10, label: 'Referral Code', value: 'referral', icon: 'fi-rr-share', requireAuth: true, hiddenKey: 'ref_earning_status' },
    { id: 11, label: 'Help', path: '/help-and-support', icon: 'fi-rr-interrogation', requireAuth: false },
    { id: 12, label: 'Settings', value: 'settings', icon: 'fi-rr-settings', requireAuth: false },
]

export const AccountPopover = (props) => {
    const [openModal, setOpenModal] = useState(false)
    const [isLogoutLoading, setIsLogoutLoading] = useState(false)
    const { global } = useSelector((state) => state.globalSettings)
    const isProCustomer = global?.pro_member_status
    const router = useRouter()
    const { t } = useTranslation()
    const {
        cartListRefetch,
        anchorEl,
        onClose,
        open,
        token,
        onSignInClick,
        ...other
    } = props
    const dispatch = useDispatch()
    const queryClient = useQueryClient()

    const handleLogout = async () => {
        setIsLogoutLoading(true)
        try {
            setTimeout(() => {
                localStorage.removeItem('token')
                dispatch(removeToken())
                dispatch(setWelcomeModal(false))
                dispatch(clearWishList([]))
                cartListRefetch?.()
                queryClient.invalidateQueries('cart-item')
                queryClient.invalidateQueries('cart-item-restaurant')
                queryClient.removeQueries(['address-list'])
                queryClient.removeQueries(['profile-info'])
                setOpenModal(false)
                setIsLogoutLoading(false)
                onClose?.()
                if (router.pathname === '/') {
                    router.push('/')
                } else if (
                    router.pathname === '/info' ||
                    router.pathname === '/checkout'
                ) {
                    router.push('/home')
                }
            }, 500)
        } catch (err) {
            setIsLogoutLoading(false)
        }
    }

    const handleItemClick = (item) => {
        if (item.requireAuth && !token) {
            onClose?.()
            onSignInClick?.()
            return
        }
        onClose?.()
        if (item.path) {
            router.push(item.path)
        } else {
            router.push({ pathname: '/info', query: { page: item.value } })
        }
    }

    const rowSx = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        px: '12px',
        py: '8px',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
        },
    }

    return (
        <>
            <Popover
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                onClose={onClose}
                open={open}
                disableScrollLock
                slotProps={{
                    paper: {
                        sx: {
                            width: 300,
                            mt: '8px',
                            p: '12px',
                            borderRadius: '12px',
                            boxShadow: '0px 16px 32px rgba(0,0,0,0.15)',
                        },
                    },
                }}
                {...other}
            >
                <Stack sx={{ gap: '4px' }}>
                    {menuData.map((item) => {
                        if (item.hiddenKey && global?.[item.hiddenKey] === 0)
                            return null
                        if (item.proOnly && !isProCustomer) return null
                        return (
                            <Box
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                sx={rowSx}
                            >
                                <Box
                                    component="i"
                                    className={`fi ${item.icon}`}
                                    sx={{
                                        fontSize: 16,
                                        lineHeight: 1,
                                        display: 'flex',
                                        flexShrink: 0,
                                        color: (theme) =>
                                            theme.palette.text.secondary,
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: 16,
                                        fontWeight: 400,
                                        lineHeight: 1.1,
                                        letterSpacing: '-0.48px',
                                        textTransform: 'capitalize',
                                        color: (theme) =>
                                            theme.palette.text.primary,
                                    }}
                                >
                                    {t(item.label)}
                                </Typography>
                            </Box>
                        )
                    })}
                </Stack>

                <Box
                    onClick={() => {
                        if (token) {
                            setOpenModal(true)
                        } else {
                            onClose?.()
                            onSignInClick?.()
                        }
                    }}
                    sx={{
                        mt: '12px',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: (theme) =>
                            token
                                ? theme.palette.neutral[200]
                                : theme.palette.primary.main,
                        transition: 'opacity 0.15s ease',
                        '&:hover': { opacity: 0.9 },
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 16,
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: '-0.48px',
                            textTransform: 'capitalize',
                            color: (theme) =>
                                token
                                    ? theme.palette.text.primary
                                    : theme.palette.primary.contrastText,
                        }}
                    >
                        {token ? t('Log Out') : t('Login/Signup')}
                    </Typography>
                </Box>
            </Popover>
            <CustomDialogConfirm
                isLoading={isLogoutLoading}
                dialogTexts={t('Are you sure you want to  logout?')}
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSuccess={handleLogout}
            />
        </>
    )
}

AccountPopover.propTypes = {
    anchorEl: PropTypes.any,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    token: PropTypes.string,
    onSignInClick: PropTypes.func,
}
