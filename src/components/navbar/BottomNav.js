import ChatIcon from '@mui/icons-material/Chat'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'
import HomeIcon from '@mui/icons-material/Home'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import {
    Badge,
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    styled,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import CustomDrawerWishlist from './CustomDrawerWishlist'

const BottomNav = (props) => {
    const { t } = useTranslation()
    const router = useRouter()
    const { setSideDrawerOpen } = props
    const { cartList } = useSelector((state) => state.cart)
    const [openWishlistModal, setOpenWishlistModal] = useState(false)

    let zoneid = undefined
    if (typeof window !== 'undefined') {
        zoneid = localStorage.getItem('zoneid')
    }
    let token = undefined
    if (typeof window != 'undefined') {
        token = localStorage.getItem('token')
    }
    const [value, setValue] = useState(0)

    const orangeColor = '#65748B'

    const MuiBottomNavigationAction = styled(BottomNavigationAction)(
        ({ theme }) => ({
            // color: '#ccc',
            '&.Mui-selected': {
                color: orangeColor,
            },
        })
    )
    const routeToWishList = (value) => {
        if (token) {
            router.push({
                pathname: '/info',
                query: {
                    page: value,
                },
            })
        } else toast.error(t('you are not logged in'))
    }

    return (
        <>
            <CustomDrawerWishlist
                openWishlistModal={openWishlistModal}
                setOpenWishlistModal={setOpenWishlistModal}
            />
            <Paper
                className="bottom-navigation-wrap"
                sx={{
                    display: { xs: 'block', md: 'none' },
                    py: 1,
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 999,
                }}
                elevation={3}
            >
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue)
                    }}
                >
                    <Link href="/home">
                        <MuiBottomNavigationAction
                            label="Home"
                            icon={<HomeIcon />}
                        />
                    </Link>

                    <MuiBottomNavigationAction
                        onClick={() => setOpenWishlistModal(!openWishlistModal)}
                        icon={
                            <Badge badgeContent={0} color="error">
                                <FavoriteBorderOutlinedIcon />
                            </Badge>
                        }
                    />

                    <MuiBottomNavigationAction
                        onClick={() => setSideDrawerOpen(true)}
                        // label="Cart"
                        icon={
                            <Badge
                                badgeContent={cartList?.length}
                                color="error"
                            >
                                <ShoppingCartOutlinedIcon />
                            </Badge>
                        }
                    />

                    <MuiBottomNavigationAction
                        onClick={() => routeToWishList('inbox')}
                        // label="Notification"
                        icon={
                            <Badge badgeContent={0} color="error">
                                <ChatIcon />
                            </Badge>
                        }
                    />
                </BottomNavigation>
            </Paper>
        </>
    )
}

export default BottomNav
