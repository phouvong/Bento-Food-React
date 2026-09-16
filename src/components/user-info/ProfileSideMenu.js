import React from 'react'
import { t } from 'i18next'
import NextLink from 'next/link'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import CustomerInfo from './CustomerInfo'
import MenuBar from './MenuBar'
import { RTL } from '../RTL/RTL'
import { Breadcrumbs, Link, Stack, Typography } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

// Same fi-rr-* Flaticon uicon set used in the navbar AccountPopover menu.
export const tabData = [
    {
        id: 1,
        label: 'My Profile',
        value: 'profile',
        icon: 'fi-rr-circle-user',
    },
    {
        id: 2,
        label: 'Orders',
        value: 'order',
        icon: 'fi-rr-receipt',
    },
    {
        id: 3,
        label: 'Coupons',
        value: 'coupons',
        icon: 'fi-rr-ticket',
    },
    {
        id: 4,
        label: 'Wish List',
        value: 'wishlist',
        icon: 'fi-rr-heart',
    },
    {
        id: 5,
        label: 'Wallets',
        value: 'wallets',
        icon: 'fi-rr-wallet',
    },
    {
        id: 6,
        label: 'Subscription Plan',
        value: 'subscription',
        icon: 'fi-rr-crown',
    },
    {
        id: 7,
        label: 'Loyalty Points',
        value: 'loyalty',
        icon: 'fi-rr-badge',
    },
    {
        id: 8,
        label: 'Referral Code',
        value: 'referral',
        icon: 'fi-rr-share',
    },
    {
        id: 9,
        label: 'Inbox',
        value: 'inbox',
        icon: 'fi-rr-messages',
    },

    {
        id: 10,
        label: 'Settings',
        value: 'settings',
        icon: 'fi-rr-settings',
    },
]

const ProfileSideMenu = ({
    onClose,
    sidedrawer,
    page,
    setAttributeId,
    isAuthenticated,
}) => {
    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }

    const currentTab = tabData.find((item) => item.value === page)
    const breadcrumbLabel =
        currentTab?.id === 1 ? t('Profile') : t(currentTab?.label || '')

    return (
        <RTL direction={languageDirection}>
            <CustomStackFullWidth
                sx={{
                    position: 'sticky',
                    top: { xs: '90px', md: '88px' },
                    zIndex: 9,
                }}
            >
                <Stack
                    padding="1rem"
                    sx={{
                        borderRadius: '16px',
                        backgroundColor: (theme) =>
                            theme.palette.neutral[1800],
                        paddingTop: '24px',
                        paddingBottom: '25px',
                    }}
                >
                    <CustomStackFullWidth gap="24px">
                        <CustomStackFullWidth gap="16px">
                            <Breadcrumbs
                                separator={
                                    <NavigateNextIcon sx={{ fontSize: 14 }} />
                                }
                                sx={{
                                    fontSize: '14px',
                                    color: (theme) =>
                                        theme.palette.text.secondary,
                                    '& .MuiBreadcrumbs-separator': {
                                        mx: '4px',
                                    },
                                }}
                            >
                                <Link
                                    component={NextLink}
                                    href="/home"
                                    underline="hover"
                                    color="text.secondary"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: 'inherit',
                                    }}
                                >
                                    <HomeIcon sx={{ fontSize: 14 }} />
                                    {t('Home')}
                                </Link>
                                <Typography
                                    color="text.secondary"
                                    fontSize="inherit"
                                >
                                    {breadcrumbLabel}
                                </Typography>
                            </Breadcrumbs>
                            {isAuthenticated && <CustomerInfo />}
                        </CustomStackFullWidth>
                        <MenuBar
                            setAttributeId={setAttributeId}
                            tabData={tabData}
                            onClose={onClose}
                            sidedrawer={sidedrawer}
                            page={page}
                            isAuthenticated={isAuthenticated}
                        />
                    </CustomStackFullWidth>
                </Stack>
            </CustomStackFullWidth>
        </RTL>
    )
}

export default ProfileSideMenu
