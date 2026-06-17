import React, { useEffect, useState } from 'react'
import { IconButton, Stack, Typography, useMediaQuery } from '@mui/material'
import CustomSideDrawer from '../side-drawer/CustomSideDrawer'
import { useTheme } from '@mui/material/styles'
import ProfileSideMenu from './ProfileSideMenu'
import { t } from 'i18next'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import { useDispatch, useSelector } from 'react-redux'
import { setEditProfile } from '@/redux/slices/editProfile'
import { RTL } from '../RTL/RTL'

const SideDrawer = ({ page, setAttributeId }) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const [pageTitle, setPageTitle] = useState(page)
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const [languageDirection, setLanguageDirection] = useState('ltr')
    const { isEditProfile } = useSelector((state) => state.isEditProfile)
    const [open, setOpen] = useState(false)
    useEffect(() => {
        if (page === 'profile') {
            if (isEditProfile === true) {
                setPageTitle('Edit Profile')
            } else {
                setPageTitle('My Profile')
            }
        } else if (page === 'coupons') {
            setPageTitle('My Coupons')
        } else if (
            page === 'order' ||
            page === 'order?flag=success' ||
            page === 'order?flag=cancel'
        ) {
            setPageTitle('Order')
        } else {
            dispatch(setEditProfile(false))
            setPageTitle(page)
        }
    }, [page, pageTitle, isEditProfile])

    useEffect(() => {
        if (localStorage.getItem('direction')) {
            setLanguageDirection(localStorage.getItem('direction'))
        }
    }, [])

    return (
        <>
            {languageDirection && (
                <CustomStackFullWidth>
                    {/* App-bar style mobile header. Layout: back-button slot
                        (left, fixed width) / centered title / menu button
                        (right, fixed width). Equal-width side slots keep
                        the title visually centered even when the back arrow
                        isn't rendered. Subtle bottom border anchors it as a
                        distinct section header. */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            px: '12px',
                            // Tight top spacing — sits flush below the
                            // location bar / app header rather than floating
                            // with extra room above the title.
                            py: '4px',
                            minHeight: 44,
                            width: '100%',
                            borderBottom: (theme) =>
                                `1px solid ${theme.palette.divider}`,
                            backgroundColor: (theme) =>
                                theme.palette.background.paper,
                        }}
                    >
                        {/* Menu (hamburger) on the LEFT — standard mobile
                            pattern. Back arrow (edit profile) takes the
                            right slot. */}
                        <Stack
                            direction="row"
                            sx={{ width: 40, justifyContent: 'flex-start' }}
                        >
                            <IconButton
                                onClick={() => setOpen(true)}
                                size="small"
                                aria-label={t('Open menu')}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    color: (theme) =>
                                        theme.palette.primary.main,
                                }}
                            >
                                {/* MenuOpenIcon (hamburger + chevron) is
                                    visually distinct from the plain
                                    `MenuIcon` used in the global app
                                    header — keeps the two affordances
                                    from looking identical. */}
                                <MenuOpenIcon sx={{ fontSize: 24 }} />
                            </IconButton>
                        </Stack>
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            color={theme.palette.neutral[900]}
                            align="center"
                            sx={{
                                flex: 1,
                                fontSize: { xs: '16px', sm: '18px' },
                                lineHeight: 1.2,
                                textTransform: 'capitalize',
                            }}
                        >
                            {t(pageTitle)}
                        </Typography>
                        <Stack
                            direction="row"
                            sx={{ width: 40, justifyContent: 'flex-end' }}
                        >
                            {isSmall && isEditProfile === true && (
                                <IconButton
                                    onClick={() =>
                                        dispatch(setEditProfile(false))
                                    }
                                    size="small"
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        color: (theme) =>
                                            theme.palette.primary.main,
                                    }}
                                >
                                    <ArrowBackIosNewIcon
                                        sx={{ fontSize: 16 }}
                                    />
                                </IconButton>
                            )}
                        </Stack>
                    </Stack>
                    <RTL direction={languageDirection}>
                        <CustomSideDrawer
                            open={open}
                            onClose={() => setOpen(false)}
                            anchor={
                                languageDirection === 'rtl' ? 'right' : 'left'
                            }
                        >
                            <ProfileSideMenu
                                onClose={() => setOpen(false)}
                                sidedrawer="true"
                                page={page}
                                setAttributeId={setAttributeId}
                            />
                        </CustomSideDrawer>
                    </RTL>
                </CustomStackFullWidth>
            )}
        </>
    )
}
export default SideDrawer
