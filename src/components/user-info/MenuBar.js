import React, { useState } from 'react'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { Box, List, MenuItem, Typography } from '@mui/material'
import { t } from 'i18next'
import Router, { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { useQueryClient } from 'react-query'
import { useTheme } from '@mui/material/styles'
import { isGuestAccessiblePage } from './infoPageAccess'
import { setWelcomeModal } from '@/redux/slices/utils'
import { removeToken } from '@/redux/slices/userToken'
import { clearWishList } from '@/redux/slices/wishList'
import CustomDialogConfirm from '../custom-dialog/confirm/CustomDialogConfirm'

const MenuBar = ({
    tabData,
    onClose,
    sidedrawer,
    page,
    setAttributeId,
    isAuthenticated,
}) => {
    const theme =useTheme()
    const router = useRouter()
    const dispatch = useDispatch()
    const queryClient = useQueryClient()
    const { global } = useSelector((state) => state.globalSettings)
    const { userData } = useSelector((state) => state.user)
    const isProCustomer =  global?.pro_member_status
    const [openLogoutModal, setOpenLogoutModal] = useState(false)
    const [isLogoutLoading, setIsLogoutLoading] = useState(false)
    const handleLogout = async () => {
        setIsLogoutLoading(true)
        try {
            setTimeout(() => {
                localStorage.removeItem('token')
                dispatch(removeToken())
                dispatch(setWelcomeModal(false))
                dispatch(clearWishList([]))
                queryClient.invalidateQueries('cart-item')
                queryClient.invalidateQueries('cart-item-restaurant')
                queryClient.removeQueries(['address-list'])
                queryClient.removeQueries(['profile-info'])
                setOpenLogoutModal(false)
                setIsLogoutLoading(false)
                sidedrawer === 'true' && onClose()
                router.push('/home')
            }, 500)
        } catch (err) {
            setIsLogoutLoading(false)
        }
    }
    const handleClick = (item) => {
        setAttributeId('')
        Router.push(
            {
                pathname: '/info',
                query: { page: item?.value },
            },
            undefined,
            { shallow: true }
        )
        sidedrawer === 'true' && onClose()
    }
    return (
        <>
        <List padding="0">
            {tabData.map((item, index) => {
                if (
                    (global?.customer_wallet_status === 0 && item.id === 5) ||
                    (global?.loyalty_point_status === 0 && item.id === 6) ||
                    (global?.ref_earning_status === 0 && item.id === 7) ||
                    (item.id === 6 && !isProCustomer)
                ) {
                    return null
                } else {
                    const isSelected = item.value === page
                    const isLocked =
                        isAuthenticated === false &&
                        !isGuestAccessiblePage(item.value)
                    return (
                        <MenuItem
                            key={index}
                            selected={isSelected}
                            onClick={() => handleClick(item)}
                            disableGutters="true"
                            sx={{
                                paddingY: '0px',
                                marginBottom: { xs: '8px', md: '12px' },
                                borderRadius: '4px',
                                '&:hover': {
                                    backgroundColor: (theme) =>
                                        theme.palette.neutral[100],
                                },
                                '&.Mui-selected, &.Mui-selected:hover': {
                                    backgroundColor: (theme) =>
                                        theme.palette.neutral[100],
                                },
                            }}
                        >
                            <CustomStackFullWidth
                                direction="row"
                                alignItems="center"
                                gap="8px"
                                padding={{ xs: '6px 10px', md: '8px 12px' }}
                            >
                                <Box
                                    component="i"
                                    className={`fi ${item.icon}`}
                                    sx={{
                                        fontSize: { xs: '14px', md: '16px' },
                                        lineHeight: 1,
                                        display: 'flex',
                                        flexShrink: 0,
                                        color: theme.palette.text.primary,
                                    }}
                                />
                                <Typography
                                    color={theme.palette.text.primary}
                                    fontWeight={isSelected ? 700 : 400}
                                    lineHeight="1.1"
                                    sx={{
                                        fontSize: { xs: '14px', md: '16px' },
                                        letterSpacing: '-0.48px',
                                        flexGrow: 1,
                                    }}
                                >
                                    {t(item.label.replaceAll('-', ' '))}
                                </Typography>
                                {isLocked && (
                                    <Box
                                        component="i"
                                        className="fi fi-rr-lock"
                                        aria-label={t('Login required')}
                                        sx={{
                                            fontSize: { xs: '12px', md: '14px' },
                                            lineHeight: 1,
                                            display: 'flex',
                                            flexShrink: 0,
                                            color: theme.palette.text.secondary,
                                        }}
                                    />
                                )}
                            </CustomStackFullWidth>
                        </MenuItem>
                    )
                }
            })}
            {isAuthenticated && (
                <MenuItem
                    onClick={() => setOpenLogoutModal(true)}
                    disableGutters="true"
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        paddingY: '0px',
                        marginBottom: { xs: '8px', md: '12px' },
                        borderRadius: '4px',
                        '&:hover': {
                            backgroundColor: (theme) =>
                                theme.palette.neutral[100],
                        },
                    }}
                >
                    <CustomStackFullWidth
                        direction="row"
                        alignItems="center"
                        gap="8px"
                        padding={{ xs: '6px 10px', md: '8px 12px' }}
                    >
                        <Box
                            component="i"
                            className="fi fi-rr-sign-out-alt"
                            sx={{
                                fontSize: { xs: '14px', md: '16px' },
                                lineHeight: 1,
                                display: 'flex',
                                flexShrink: 0,
                                color: theme.palette.error.main,
                            }}
                        />
                        <Typography
                            color={theme.palette.error.main}
                            fontWeight={400}
                            lineHeight="1.1"
                            sx={{
                                fontSize: { xs: '14px', md: '16px' },
                                letterSpacing: '-0.48px',
                                flexGrow: 1,
                            }}
                        >
                            {t('Log Out')}
                        </Typography>
                    </CustomStackFullWidth>
                </MenuItem>
            )}
        </List>
        <CustomDialogConfirm
            isLoading={isLogoutLoading}
            dialogTexts={t('Are you sure you want to  logout?')}
            open={openLogoutModal}
            onClose={() => setOpenLogoutModal(false)}
            onSuccess={handleLogout}
        />
        </>
    )
}

export default MenuBar
