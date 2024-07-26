import { BannerApi } from '@/hooks/react-query/config/bannerApi'
import { CampaignApi } from '@/hooks/react-query/config/campaignApi'
import {
    MostReviewedApi,
    PopularFoodNearbyApi,
} from '@/hooks/react-query/config/productsApi'
import { useWishListGet } from '@/hooks/react-query/config/wish-list/useWishListGet'
import {
    setFilterbyByDispatch,
    setFoodOrRestaurant,
} from '@/redux/slices/searchFilter'
import {
    setSearchTagData,
    setSelectedName,
    setSelectedValue,
} from '@/redux/slices/searchTagSlice'
import {
    setBanners,
    setBestReviewedFood,
    setCampaignFoods,
    setPopularFood,
} from '@/redux/slices/storedData'
import { setWelcomeModal } from '@/redux/slices/utils'
import { setWishList } from '@/redux/slices/wishList'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Box } from '@mui/system'
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
import VisitAgain from './visit-again'
import AddsSection from "@/components/home/add-section";

const Homes = ({ configData }) => {
    const { global } = useSelector((state) => state.globalSettings)
    const [fetchedData, setFetcheedData] = useState({})
    const { filterData, foodOrRestaurant } = useSelector(
        (state) => state.searchFilterStore
    )

    const { userData } = useSelector((state) => state.user)

    const [sort_by, setSort_by] = useState('')
    const { searchTagData } = useSelector((state) => state.searchTags)
    const router = useRouter()
    const { query, page, restaurantType, tags } = router.query
    const { campaignFoods, banners, bestReviewedFoods, popularFood } =
        useSelector((state) => state.storedData)

    const { welcomeModal } = useSelector((state) => state.utilsData)
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
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    let zoneid = undefined
    if (typeof window !== 'undefined') {
        zoneid = localStorage.getItem('zoneid')
    }
    const {
        data,
        refetch: refetchBannerData,
        isLoading: bannerIsLoading,
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
        isLoading: isLoadingNearByPopularRestaurantData,
        data: nearByPopularRestaurantData,
        refetch: refetchNearByPopularRestaurantData,
    } = useQuery(['popular-food'], PopularFoodNearbyApi.popularFood, {
        enabled: false,
        onError: onSingleErrorResponse,
    })
    useEffect(async () => {
        if (
            banners?.banners?.length === 0 &&
            banners?.campaigns?.length === 0
        ) {
            await refetchBannerData()
        }

        if (campaignFoods?.length === 0) {
            await refetchCampaignData()
        }
        if (bestReviewedFoods?.length === 0) {
            await refetchMostReviewed()
        }
        if (popularFood?.length === 0) {
            await refetchNearByPopularRestaurantData()
        }
    }, [])
    const iSSearchValue = false
    useEffect(() => {
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
    }, [campaignData, data, mostReviewedData, nearByPopularRestaurantData])

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
                dispatch(setSearchTagData(newArr))
                dispatch(setFoodOrRestaurant('products'))
                dispatch(setSelectedValue(''))
                dispatch(setSelectedName(''))
                setSort_by('')
            }
        }
        dispatch(setFilterbyByDispatch(activeFilters))
    }, [tags, page, restaurantType, query])

    const handleCloseWelcomeModal = () => {
        dispatch(setWelcomeModal(false))
    }

    return (
        <>
            <PushNotificationLayout>
                <CustomContainer>
                    <CustomStackFullWidth
                        sx={{
                            marginTop: { xs: '60px', md: '130px' },
                            marginBottom: '10px',
                        }}
                    >
                        <Typography
                            fontSize={{ xs: '16px', md: '20px' }}
                            fontWeight={{
                                xs: '500',
                                md: '700',
                            }}
                            color={theme.palette.neutral[1000]}
                        >
                            {t('Find Best Restaurants and Foods')}
                        </Typography>
                    </CustomStackFullWidth>
                </CustomContainer>
                <SearchFilterTag
                    sort_by={sort_by}
                    setSort_by={setSort_by}
                    tags={tags}
                    query={query}
                    page={page}
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
                            <Banner bannerIsLoading={bannerIsLoading} />
                        </CustomContainer>
                        <Box>
                            <FeatureCatagories height="70px" />
                            <CustomContainer>
                                <VisitAgain />
                                <AddsSection/>
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
                            <Typography variant="h5" mb={1} color={theme.palette.neutral[1000]}>
                                {t('Welcome to ' + configData?.business_name)}
                            </Typography>
                            <Typography variant="body2" lineHeight={'1.5'} color={theme.palette.neutral[1000]}>
                                {userData?.is_valid_for_discount
                                    ? t(
                                          `Get ready for a special welcome gift, enjoy a special discount on your first order within `
                                      ) +
                                      userData?.validity +
                                      '.'
                                    : ''}{'  '}
                                {t(
                                    `  Start exploring the best services around you.`
                                )}
                            </Typography>
                        </Box>
                    </Box>
                </CustomModal>
                {getToken && <CashBackPopup />}
            </PushNotificationLayout>
        </>
    )
}

export default Homes
