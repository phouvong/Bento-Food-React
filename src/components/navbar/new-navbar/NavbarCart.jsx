import { Badge, Box, IconButton } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { setCartDrawerOpen } from '@/redux/slices/utils'

// Cart icon + count badge. Opens the shared cart drawer.
const NavbarCart = () => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const { cartGroups = [] } = useSelector((state) => state.cart)

    // cartGroups spans every restaurant — same source the cart drawer
    // reads, so the badge always matches what the drawer shows.
    const count =
        cartGroups?.reduce((sum, g) => sum + (g?.carts?.length || 0), 0) || 0

    return (
        <IconButton
            onClick={() => dispatch(setCartDrawerOpen(true))}
            aria-label={t('Cart')}
            sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                color: (theme) => theme.palette.text.primary,
                flexShrink: 0,
            }}
        >
            <Badge
                badgeContent={count}
                overlap="circular"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                    '& .MuiBadge-badge': {
                        minWidth: 16,
                        height: 20,
                        padding: '0 4px',
                        fontSize: 11,
                        fontWeight: 600,
                        lineHeight: 1,
                        backgroundColor: (theme) => theme.palette.primary.main,
                        color: (theme) => theme.palette.primary.contrastText,
                        border: (theme) =>
                            `2px solid ${theme.palette.background.paper}`,
                    },
                }}
            >
                <Box
                    component="i"
                    className="fi fi-rr-shopping-cart"
                    sx={{ fontSize: 20, lineHeight: 1, display: 'flex' }}
                />
            </Badge>
        </IconButton>
    )
}

export default NavbarCart
