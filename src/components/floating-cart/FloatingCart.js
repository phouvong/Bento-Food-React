import React, { useEffect, useState } from 'react'
import { Box, Grid, Stack, Typography } from '@mui/material'
import delivery from '../../../public/static/bannerslider/delivery.png'
import Drawer from '@mui/material/Drawer'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import {
    calculateItemBasePrice,
    cartItemsTotalAmount,
    getAmount,
    getConvertDiscount,
    handleBadge,
    handleProductValueWithOutDiscount,
} from '@/utils/customFunctions'
import { setCartItemByDispatch, cart } from '@/redux/slices/cart'
import AuthModal from '../auth'
import { useQuery } from 'react-query'
import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { CustomTypographyBold } from '@/styled-components/CustomStyles.style'
import { useTranslation } from 'react-i18next'
import SimpleBar from 'simplebar-react'
import ProductUpdateModal from '../food-card/ProductUpdateModal'
import CustomImageContainer from '../CustomImageContainer'
import { useTheme } from '@mui/material/styles'
import { PrimaryButton } from '../products-page/FoodOrRestaurant'
import emptycart from '../../../public/static/emptycart.png'
import { RTL } from '../RTL/RTL'
import Cart from './Cart'
import GuestCheckoutModal from './GuestCheckoutModal'
import { getGuestId, getToken } from '../checkout-page/functions/getGuestUserId'
import {
    getSelectedAddons,
    getSelectedVariations,
} from '../navbar/second-navbar/SecondNavbar'
import CartContent from './CartContent'
import useGetAllCartList from '@/hooks/react-query/add-cart/useGetAllCartList'

const FloatingCart = (props) => {
    const { sideDrawerOpen, setSideDrawerOpen } = props
    const theme = useTheme()
    const { t } = useTranslation()
    const [openGuestModal, setOpenGuestModal] = useState(false)
    const router = useRouter()
    const dispatch = useDispatch()
    const { cartList } = useSelector((state) => state.cart)
    const [modalFor, setModalFor] = useState('sign-in')
    const [openModal, setOpenModal] = React.useState(false)

    const { global } = useSelector((state) => state.globalSettings)
    const token = getToken()
    const { isFilterDrawerOpen } = useSelector(
        (state) => state.searchFilterStore
    )

    let languageDirection
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }
    const [authModalOpen, setOpen] = useState(false)
    const handleOpenAuthModal = () => setOpen(true)
    const handleCloseAuthModal = () => setOpen(false)
    const productBaseUrl = global?.base_urls?.product_image_url
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint
    if (cartList?.length > 0) {
    }

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }

    const { data: restaurantData, refetch } = useQuery(
        [`restaurant-details`],
        () => RestaurantsApi.restaurantDetails(cartList[0]?.restaurant_id)
    )

    const handleCheckout = () => {
        const closeDrawers = () => {
            setSideDrawerOpen(false)
        }
        if (token) {
            const queryParams = { page: 'cart' }

            // Check if "isDineIn" is present in the current route's query
            if (router.query.isDineIn) {
                queryParams.isDineIn = router.query.isDineIn
            }

            // Push the route with query parameters
            router.push(
                {
                    pathname: '/checkout',
                    query: queryParams,
                },
                undefined,
                { shallow: true }
            )

            // router.push('/checkout?page=cart')
            closeDrawers()
        } else {
            const shouldOpenGuestModal = global?.guest_checkout_status === 1
            if (shouldOpenGuestModal) {
                setOpenGuestModal(true)
            } else {
                handleOpenAuthModal()
            }

            closeDrawers()
        }
    }
    useEffect(() => {
        refetch().then()
    }, [])

    const handleProductUpdateModal = (item) => {
        dispatch(setCartItemByDispatch(item))
        setOpenModal(true)
        setSideDrawerOpen(false)
    }
    const cartListSuccessHandler = (res) => {
        if (res) {
            const setItemIntoCart = () => {
                return res?.map((item) => ({
                    ...item?.item,
                    cartItemId: item?.id,
                    totalPrice:
                        getConvertDiscount(
                            item?.item?.discount,
                            item?.item?.discount_type,
                            handleProductValueWithOutDiscount(item?.item),
                            item?.item?.restaurant_discount
                        ) * item?.quantity,
                    selectedAddons: getSelectedAddons(item?.item?.addons),
                    quantity: item?.quantity,
                    variations: item?.item?.variations,
                    itemBasePrice: getConvertDiscount(
                        item?.item?.discount,
                        item?.item?.discount_type,
                        calculateItemBasePrice(
                            item?.item,
                            item?.item?.variations
                        ),
                        item?.item?.restaurant_discount
                    ),
                    selectedOptions: getSelectedVariations(
                        item?.item?.variations
                    ),
                }))
            }
            dispatch(cart(setItemIntoCart()))
        }
    }

    const { data: cartData, refetch: cartListRefetch } = useGetAllCartList(
        getGuestId(),
        cartListSuccessHandler
    )
    return (
        <>
            {authModalOpen && (
                <AuthModal
                    open={authModalOpen}
                    handleClose={handleCloseAuthModal}
                    modalFor={modalFor}
                    setModalFor={setModalFor}
                    cartListRefetch={cartListRefetch}
                />
            )}
            {!sideDrawerOpen && (
                <Box
                    className="cart__burger"
                    sx={{
                        position: 'fixed',
                        width: '85px',
                        height: '90px',
                        left: languageDirection === 'rtl' ? 10 : 'auto',
                        right: languageDirection === 'rtl' ? 'auto' : 10,
                        top: '38%',
                        zIndex: 1000000,
                        flexGrow: 1,
                        cursor: 'pointer',
                        display: {
                            xs: 'none',
                            sm: 'none',
                            md: isFilterDrawerOpen
                                ? 'none'
                                : cartList?.length === 0
                                ? 'none'
                                : 'inherit',
                        },
                    }}
                    onClick={() => setSideDrawerOpen(true)}
                >
                    <div>
                        <Cart />
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '35%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                                fontWeight: 'bold',
                            }}
                        >
                            {cartList?.length}
                            <Typography
                                sx={{
                                    lineHeight: 0.5,
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                }}
                            >
                                {t('Items')}
                            </Typography>
                        </Box>
                    </div>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '75px',
                            bottom: '6px',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: (theme) => theme.palette.neutral[100],
                            width: '100px',
                        }}
                    >
                        <Stack flexWrap="wrap">
                            <Typography
                                sx={{
                                    lineHeight: 0.5,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    fontSize: '13px',
                                }}
                                color={theme.palette.whiteContainer.main}
                            >
                                {getAmount(
                                    cartItemsTotalAmount(cartList),
                                    currencySymbolDirection,
                                    currencySymbol,
                                    digitAfterDecimalPoint
                                )}
                            </Typography>
                        </Stack>
                    </Box>
                </Box>
            )}
            <RTL direction={languageDirection}>
                <Drawer
                    anchor="right"
                    open={sideDrawerOpen}
                    onClose={() => setSideDrawerOpen(false)}
                    variant="temporary"
                    sx={{
                        zIndex: '1400',
                        '& .MuiDrawer-paper': {
                            width: {
                                xs: '90%',
                                sm: '50%',
                                md: '390px',
                            },
                        },
                    }}
                >
                    {cartList?.length === 0 ? (
                        <Stack
                            sx={{
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '20px',
                            }}
                            container
                        >
                            <CustomImageContainer
                                src={emptycart?.src}
                                height="250px"
                            />
                            <CustomTypographyBold align="center">
                                {t('Cart is Empty')}
                            </CustomTypographyBold>
                        </Stack>
                    ) : (
                        <>
                            <Stack
                                height="100%"
                                p="1rem"
                                justifyContent="start"
                                gap="2%"
                                marginTop={{
                                    xs: '20px',
                                    sm: '25px',
                                    md: '60px',
                                }}
                            >
                                <Stack gap="1rem">
                                    <Stack>
                                        <Typography
                                            sx={{
                                                textAlign: 'center',
                                                fontSize: '18px',
                                            }}
                                        >
                                            <Typography
                                                component="span"
                                                sx={{
                                                    color: (theme) =>
                                                        theme.palette.primary
                                                            .main,
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {cartList?.length} {t('Items')}
                                            </Typography>{' '}
                                            {t('in your cart')}
                                        </Typography>
                                        {restaurantData?.data
                                            ?.delivery_time && (
                                            <Typography
                                                sx={{
                                                    textAlign: 'center',
                                                    fontSize: '14px',
                                                }}
                                            >
                                                <img
                                                    style={{
                                                        marginBottom: '4px',
                                                    }}
                                                    src={delivery?.src}
                                                    loading="lazy"
                                                />
                                                <Typography
                                                    component="span"
                                                    sx={{
                                                        color: (theme) =>
                                                            theme.palette
                                                                .neutral[400],
                                                        marginLeft: '10px',
                                                        fontWeight: 600,
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {
                                                        restaurantData?.data
                                                            ?.delivery_time
                                                    }
                                                </Typography>
                                            </Typography>
                                        )}
                                    </Stack>
                                    <SimpleBar
                                        style={{
                                            height: '55vh',
                                            width: '100%',
                                        }}
                                    >
                                        <Grid container spacing={{ xs: 1 }}>
                                            {cartList?.map((item) => (
                                                <React.Fragment key={item.id}>
                                                    <CartContent
                                                        item={item}
                                                        handleProductUpdateModal={
                                                            handleProductUpdateModal
                                                        }
                                                        productBaseUrl={
                                                            productBaseUrl
                                                        }
                                                        t={t}
                                                    />
                                                </React.Fragment>
                                            ))}
                                        </Grid>
                                    </SimpleBar>
                                </Stack>
                                <Stack
                                    alignItems="center"
                                    spacing={2}
                                    position="sticky"
                                    marginTop="auto"
                                >
                                    <Stack
                                        borderRadius="5px"
                                        flexDirection="row"
                                        sx={{
                                            width: '100%',
                                            paddingTop: '10px',
                                            paddingBottom: '10px',
                                        }}
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <Typography
                                            fontSize="14px"
                                            fontWeight={500}
                                        >
                                            {t('Total Price')}
                                        </Typography>
                                        <Typography
                                            fontSize="15px"
                                            fontWeight={700}
                                        >
                                            {getAmount(
                                                cartItemsTotalAmount(cartList),
                                                currencySymbolDirection,
                                                currencySymbol,
                                                digitAfterDecimalPoint
                                            )}
                                        </Typography>
                                    </Stack>
                                    <Stack
                                        direction="row"
                                        width="100%"
                                        spacing={1}
                                    >
                                        <PrimaryButton
                                            onClick={handleCheckout}
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            borderRadius="7px"
                                        >
                                            {t('Proceed To Checkout')}
                                        </PrimaryButton>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </>
                    )}
                </Drawer>
            </RTL>
            {openGuestModal && (
                <GuestCheckoutModal
                    setModalFor={setModalFor}
                    handleOpenAuthModal={handleOpenAuthModal}
                    open={openGuestModal}
                    setOpen={setOpenGuestModal}
                    setSideDrawerOpen={setSideDrawerOpen}
                />
            )}
            {openModal && (
                <ProductUpdateModal
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    currencySymbol={currencySymbol}
                    currencySymbolDirection={currencySymbolDirection}
                    digitAfterDecimalPoint={digitAfterDecimalPoint}
                    handleBadge={handleBadge}
                />
            )}
        </>
    )
}

export default FloatingCart
