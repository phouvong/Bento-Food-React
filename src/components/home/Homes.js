import { BannerApi } from '@/hooks/react-query/config/bannerApi'
import { CampaignApi } from '@/hooks/react-query/config/campaignApi'
import {
    MostReviewedApi,
    PopularFoodNearbyApi,
} from '@/hooks/react-query/config/productsApi'
import { useWishListGet } from '@/hooks/react-query/config/wish-list/useWishListGet'
import {
    setFilterbyByCuisineDispatch,
    setFilterbyByDispatch,
    setFoodOrRestaurant,
} from '@/redux/slices/searchFilter'
import {
    setCuisineData,
    setSearchTagData,
    setSelectedName,
    setSelectedValue,
} from '@/redux/slices/searchTagSlice'
import {
    setAddStores,
    setBanners,
    setBestReviewedFood,
    setCampaignFoods,
    setPopularFood,
} from '@/redux/slices/storedData'
import { setTrackOrderStoreData, setWelcomeModal } from '@/redux/slices/utils'
import { setWishList } from '@/redux/slices/wishList'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import mapIcon from '../../../public/mapDine.png'
import {
    Typography,
    Box,
    Stack,
    IconButton,
    SwipeableDrawer,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { t } from 'i18next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { onSingleErrorResponse } from '../ErrorResponse'
import PushNotificationLayout from '../PushNotificationLayout'
import CashBackPopup from '../cash-back-popup/CashBackPopup'
import CustomContainer from '../container'
import CustomModal from '../custom-modal/CustomModal'
import ProductSearchPage from '../products-page/ProductSearchPage'
import Banner from './Banner'
import DifferentFoodCompontent from './DefferntFoodCompontent'
import NewRestaurant from './NewRestaurant'
import PromotionalBanner from './PromotionalBanner'
import Restaurant from './Restaurant'
import SearchFilterTag from './Search-filter-tag/SearchFilterTag'
import Cuisines from './cuisines'
import FeatureCatagories from './featured-categories/FeatureCatagories'
import VisitAgain, { Puller } from './visit-again'
import AddsSection from '@/components/home/add-section'
import { useGetAdds } from '@/hooks/react-query/useGetAdds'
import { PrimaryButton } from '@/components/products-page/FoodOrRestaurant'
import useMediaQuery from '@mui/material/useMediaQuery'
import DineIn from '@/components/home/dine-in'
import NearByRestaurant from '@/components/home/visit-again/NearByRestaurant'
import CloseIcon from '@mui/icons-material/Close'
import CustomImageContainer from '@/components/CustomImageContainer'

const Homes = ({ configData }) => {
    const theme = useTheme()
    const [fetchedData, setFetcheedData] = useState({})
    const { userData } = useSelector((state) => state.user)
    const [sort_by, setSort_by] = useState('')
    const [openDineInRes, setOpenDineInRes] = useState(false)
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const [openDrawer, setOpenDrawer] = useState(false)

    const drawerBleeding = 0
    const { searchTagData, cuisineData } = useSelector(
        (state) => state.searchTags
    )
    const router = useRouter()
    const { query, page, restaurantType, tags } = router.query
    const {
        campaignFoods,
        banners,
        bestReviewedFoods,
        popularFood,
        addStores,
    } = useSelector((state) => state.storedData)

    const { welcomeModal, isNeedLoad } = useSelector((state) => state.utilsData)
    const dispatch = useDispatch()
    const onSuccessHandler = (response) => {
        setFetcheedData(response)
        dispatch(setWishList(fetchedData))
    }
    const { refetch } = useWishListGet(onSuccessHandler)
    let getToken = undefined
    if (typeof window !== 'undefined') {
        getToken = localStorage.getItem('token')
    }
    useEffect(() => {
        if (getToken) {
            refetch().then()
        }
    }, [getToken, fetchedData])

    const {
        data,
        refetch: refetchBannerData,
        isFetched
    } = useQuery(['banner-image'], BannerApi.bannerList, {
        enabled: false,
        staleTime: 1000 * 60 * 8,
        onError: onSingleErrorResponse,
    })

    const {
        data: campaignData,
        refetch: refetchCampaignData,
        isLoading: campaignIsloading,
    } = useQuery(['campaign'], CampaignApi.campaign, {
        enabled: false,
        onError: onSingleErrorResponse,
        staleTime: 1000 * 60 * 8,
        cacheTime: 8 * 60 * 1000,
    })
    const {
        data: mostReviewedData,
        refetch: refetchMostReviewed,
        isLoading,
    } = useQuery(['most-review-product'], MostReviewedApi.reviewed, {
        enabled: false,
        onError: onSingleErrorResponse,
    })
    const {
        data: addData,
        isLoading: addIsLoading,
        refetch: addRefetch,
    } = useGetAdds()
    const {
        isLoading: isLoadingNearByPopularRestaurantData,
        data: nearByPopularRestaurantData,
        refetch: refetchNearByPopularRestaurantData,
    } = useQuery(['popular-food'], PopularFoodNearbyApi.popularFood, {
        enabled: false,
        onError: onSingleErrorResponse,
    })

    const apiRefetch = async () => {
            if (
                (banners?.banners?.length === 0 &&
                    banners?.campaigns?.length === 0) ||
                isNeedLoad
            ) {
                await refetchBannerData()
            }
            if (addStores?.length === 0 || isNeedLoad) {
                await addRefetch()
            }

            if (campaignFoods?.length === 0 || isNeedLoad) {
                await refetchCampaignData()
            }
            if (bestReviewedFoods?.length === 0 || isNeedLoad) {
                await refetchMostReviewed()
            }
            if (popularFood?.length === 0 || isNeedLoad) {
                await refetchNearByPopularRestaurantData()
            }
        }
    useEffect(() => {
        apiRefetch()
    }, [])

    useEffect(() => {
        if (addData) {
            dispatch(setAddStores(addData))
        }
        if (campaignData?.data) {
            dispatch(setCampaignFoods(campaignData?.data))
        }
        if (data) {
            dispatch(setBanners(data?.data))
        }
        if (mostReviewedData) {
            dispatch(setBestReviewedFood(mostReviewedData?.data?.products))
        }
        if (nearByPopularRestaurantData) {
            dispatch(
                setPopularFood(nearByPopularRestaurantData?.data?.products)
            )
        }
    }, [
        campaignData,
        data,
        mostReviewedData,
        nearByPopularRestaurantData,
        addData,
    ])

    useEffect(() => {
        const activeFilters = searchTagData.filter(
            (item) => item.isActive === true
        )
        if (activeFilters?.length > 0) {
            if (router.asPath === '/home') {
                const newArr = searchTagData.map((item) => ({
                    ...item,
                    isActive: false,
                }))
                dispatch(
                    setCuisineData(
                        cuisineData?.map((item) => {
                            return {
                                ...item,
                                isActive: false,
                            }
                        })
                    )
                )
                dispatch(setFilterbyByCuisineDispatch([]))
                dispatch(setSearchTagData(newArr))
                dispatch(setFoodOrRestaurant('products'))
                dispatch(setSelectedValue(''))
                dispatch(setSelectedName(''))

                setSort_by('')
            }
        }
        dispatch(setFilterbyByDispatch(activeFilters))
        dispatch(setTrackOrderStoreData(null))
    }, [tags, page, restaurantType, query])

    const handleCloseWelcomeModal = () => {
        dispatch(setWelcomeModal(false))
    }
    const toggleDrawer = () => () => {
        setOpenDrawer(!openDrawer)
    }

    return (
        <PushNotificationLayout>
            <CustomContainer>
                <CustomStackFullWidth
                    sx={{
                        marginTop: { xs: '60px', md: '130px' },
                        marginBottom: '10px',
                        direction: 'row',
                    }}
                >
                    <Stack
                        direction="row"
                        width="100%"
                        justifyContent="space-between"
                    >
                        <Typography
                            fontSize={{ xs: '16px', md: '20px' }}
                            fontWeight={{
                                xs: '500',
                                md: '700',
                            }}
                            color={theme.palette.neutral[1000]}
                            component="h1"
                        >
                            {t('Find Best Restaurants and Foods')}
                        </Typography>

                        <>
                            {restaurantType === 'dine-in' && (
                                <>
                                    {isXSmall ? (
                                        <PrimaryButton
                                            backgroundColor={
                                                theme.palette.primary.main
                                            }
                                            variant="contained"
                                            onClick={() => {
                                                setOpenDrawer(true)
                                            }}
                                        >
                                            <CustomImageContainer
                                                src={mapIcon?.src}
                                                alt="map"
                                                width="24px"
                                                height="24px"
                                            />
                                        </PrimaryButton>
                                    ) : (
                                        <PrimaryButton
                                            backgroundColor={
                                                theme.palette.primary.main
                                            }
                                            variant="contained"
                                            onClick={() => {
                                                setOpenDineInRes(true)
                                            }}
                                            sx={{
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: '5px',
                                            }}
                                        >
                                            <CustomImageContainer
                                                src={mapIcon?.src}
                                                alt="map"
                                                width="24px"
                                                height="24px"
                                            />
                                            {t('View From Map')}
                                        </PrimaryButton>
                                    )}
                                </>
                            )}
                        </>
                    </Stack>
                </CustomStackFullWidth>
            </CustomContainer>
            <SearchFilterTag
                sort_by={sort_by}
                setSort_by={setSort_by}
                tags={tags}
                query={query}
                page={page}
                restaurantType={restaurantType}
            />
            {query || page || restaurantType || tags ? (
                <CustomContainer>
                    <ProductSearchPage
                        tags={tags}
                        configData={configData}
                        query={query}
                        page={page}
                        restaurantType={restaurantType}
                    />
                </CustomContainer>
            ) : (
                <>
                    <CustomContainer>
                        <Banner isFetched={isFetched} data={data} />
                    </CustomContainer>
                    <Box>
                        <FeatureCatagories height="70px" />
                        <CustomContainer>
                            <VisitAgain />
                            <AddsSection
                                data={addStores}
                                isLoading={addIsLoading}
                            />
                            {configData?.dine_in_order_option === 1 ? (
                                <DineIn />
                            ) : null}
                        </CustomContainer>
                    </Box>
                    <CustomContainer>
                        <DifferentFoodCompontent
                            campaignIsloading={campaignIsloading}
                            isLoading={isLoading}
                            isLoadingNearByPopularRestaurantData={
                                isLoadingNearByPopularRestaurantData
                            }
                        />
                        <NewRestaurant />
                        {global && <Cuisines />}

                        {global?.banner_data?.promotional_banner_image && (
                            <PromotionalBanner global={global} />
                        )}

                        <Restaurant />
                    </CustomContainer>
                </>
            )}

            <CustomModal
                setModalOpen={handleCloseWelcomeModal}
                openModal={welcomeModal}
                closeButton
            >
                <Box
                    sx={{
                        maxWidth: '382px',
                        width: '95vw',
                        px: 1.3,
                        pb: 4,
                        textAlign: 'center',
                        img: {
                            height: 'unset',
                        },
                        marginInline: 'auto',
                    }}
                >
                    <Box pb={2}>
                        <img
                            src={'/static/sign-up-welcome.svg'}
                            alt="welcome"
                            width={183}
                            height={183}
                        />
                    </Box>
                    <Box mt={2}>
                        <Typography
                            variant="h5"
                            mb={1}
                            color={theme.palette.neutral[1000]}
                        >
                            {t('Welcome to ' + configData?.business_name)}
                        </Typography>
                        <Typography
                            variant="body2"
                            lineHeight={'1.5'}
                            color={theme.palette.neutral[1000]}
                        >
                            {userData?.is_valid_for_discount
                                ? t(
                                      `Get ready for a special welcome gift, enjoy a special discount on your first order within `
                                  ) +
                                  userData?.validity +
                                  '.'
                                : ''}
                            {'  '}
                            {t(
                                `  Start exploring the best services around you.`
                            )}
                        </Typography>
                    </Box>
                </Box>
            </CustomModal>
            {getToken && <CashBackPopup />}
            {open && (
                <CustomModal
                    openModal={openDineInRes}
                    setModalOpen={setOpenDineInRes}
                    maxWidth={{ xs: '90%', sm: '98vw', md: '1000px' }}
                >
                    <CustomStackFullWidth
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end"
                        height="65%"
                        sx={{ position: 'relative' }}
                    >
                        <IconButton
                            sx={{ position: 'absolute', top: 3, right: 3 }}
                            onClick={() => setOpenDineInRes(false)}
                        >
                            <CloseIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                        <NearByRestaurant dineIn />
                    </CustomStackFullWidth>
                </CustomModal>
            )}
            {openDrawer && (
                <SwipeableDrawer
                    anchor="bottom"
                    open={openDrawer}
                    onClose={toggleDrawer()}
                    onOpen={toggleDrawer()}
                    swipeAreaWidth={drawerBleeding}
                    disableSwipeToOpen={false}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    PaperProps={{
                        sx: {
                            borderRadius: '20px 20px 0 0',
                            zIndex: `99999 !important`,
                        },
                    }}
                >
                    <CustomStackFullWidth>
                        <CustomStackFullWidth
                            sx={{
                                position: 'absolute',
                                top: -drawerBleeding,
                                alignItems: 'center',
                                zIndex: 300,
                                height: '45px',
                                background: `linear-gradient(179deg, #FFF 1.26%, rgba(255, 255, 255, 0.00) 98.74%)`,
                            }}
                        >
                            <Puller />
                        </CustomStackFullWidth>
                        <Stack
                            sx={{
                                overflow: 'auto',
                                height: '80vh',
                                borderRadius: '20px',
                            }}
                        >
                            <NearByRestaurant dineIn />
                        </Stack>
                    </CustomStackFullWidth>
                </SwipeableDrawer>
            )}
        </PushNotificationLayout>
    )
}

export default Homes
