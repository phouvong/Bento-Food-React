import { useRef, useState } from 'react'
import { Avatar, Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import AuthModal from '@/components/auth'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'
import { AccountPopover } from '@/components/navbar/AccountPopover'

// Login / profile pill (Figma node 343:53156, mart NewNavBar geometry).
// Logged out  -> user icon + "Login", opens the auth modal.
// Logged in   -> avatar (icon fallback) + first name, opens AccountPopover.
const NavbarProfile = ({ cartListRefetch }) => {
    const { t } = useTranslation()
    const { userData } = useSelector((state) => state.user)
    const token = getToken()

    const anchorRef = useRef(null)
    const [openPopover, setOpenPopover] = useState(false)
    const [authModalOpen, setAuthModalOpen] = useState(false)
    const [modalFor, setModalFor] = useState('sign-in')

    const handleClick = () => setOpenPopover(true)

    const handleCloseAuthModal = () => {
        setAuthModalOpen(false)
        setModalFor('sign-in')
    }

    const firstName =
        userData?.f_name || userData?.name?.split(' ')?.[0] || t('User')

    return (
        <>
            <Box
                ref={anchorRef}
                onClick={handleClick}
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: 36,
                    pl: '4px',
                    pr: '12px',
                    borderRadius: '8px',
                    backgroundColor: (theme) => theme.palette.primary.main,
                    cursor: 'pointer',
                    flexShrink: 0,
                    overflow: 'hidden',
                    transition: 'opacity .18s ease',
                    '&:hover': { opacity: 0.9 },
                }}
            >
                <Box
                    sx={{
                        width: token ? 28 : 36,
                        height: token ? 28 : 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        ...(token
                            ? { mr: '5px', ...(userData?.image_full_url && { p: '3px' }) }
                            : { p: '8px' }),
                    }}
                >
                    {token && userData?.image_full_url ? (
                        <Avatar
                            alt={firstName}
                            src={userData.image_full_url}
                            sx={{ width: '100%', height: '100%' }}
                        />
                    ) : (
                        <Box
                            component="i"
                            className="fi fi-rr-circle-user"
                            sx={{
                                fontSize: 16,
                                lineHeight: 1,
                                display: 'flex',
                                color: (theme) =>
                                    theme.palette.primary.contrastText,
                            }}
                        />
                    )}
                </Box>

                <Typography
                    sx={{
                        fontSize: token ? 15 : 14,
                        fontWeight: token ? 700 : 600,
                        lineHeight: 1.2,
                        letterSpacing: '-0.42px',
                        color: (theme) => theme.palette.primary.contrastText,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        ...(token && { maxWidth: 100 }),
                    }}
                >
                    {token ? firstName : t('Login')}
                </Typography>
            </Box>

            <AccountPopover
                anchorEl={anchorRef.current}
                open={openPopover}
                onClose={() => setOpenPopover(false)}
                cartListRefetch={cartListRefetch}
                token={token}
                onSignInClick={() => setAuthModalOpen(true)}
            />
            <AuthModal
                cartListRefetch={cartListRefetch}
                open={authModalOpen}
                modalFor={modalFor}
                setModalFor={setModalFor}
                handleClose={handleCloseAuthModal}
            />
        </>
    )
}

export default NavbarProfile
