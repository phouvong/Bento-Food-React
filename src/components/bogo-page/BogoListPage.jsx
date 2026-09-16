import CustomEmptyResult from '@/components/empty-view/CustomEmptyResult'
import { NAVBAR_HEIGHT } from '@/components/navbar/navbarConstants'
import { useGetBogoHome } from '@/hooks/react-query/bogo/useGetBogoHome'
import { useGetBogoOfferDetails } from '@/hooks/react-query/bogo/useGetBogoOfferDetails'
import { useGetBogoOffers } from '@/hooks/react-query/bogo/useGetBogoOffers'
import { getAmount } from '@/utils/customFunctions'
import { formatBogoValidUntil } from '@/utils/formatBogoValidUntil'
import { noDataFound } from '@/utils/LocalImages'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { Box, Breadcrumbs, Link, Stack, Typography, alpha } from '@mui/material'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import BogoItemDetailsModal from './BogoItemDetailsModal'
import BogoOfferCard from './BogoOfferCard'
import BogoOfferCardSkeleton from './BogoOfferCardSkeleton'
import BogoOfferDetails from './BogoOfferDetails'
import BogoPageSkeleton from './BogoPageSkeleton'

const BogoListPage = () => {
    const { t } = useTranslation()
    const router = useRouter()
    const { global } = useSelector((state) => state.globalSettings)
    const { data: bogoOffer, isFetched: isBogoHomeFetched } = useGetBogoHome()
    const { data: bogoOffersListData, isFetched: isBogoOffersFetched } =
        useGetBogoOffers()
    const [isOpenBogoDetailsModal, setIsOpenBogoDetailsModal] = useState(false)
    const [activeBogoDetails, setActiveBogoDetails] = useState(null)
    const [activeOfferId, setActiveOfferId] = useState(null)
    const [tempActiveOfferId, setTempActiveOfferId] = useState(null)

    const activeListOffer = bogoOffersListData?.offers?.find(
        (item) => item.id === activeOfferId
    )

    // `/bogo-list?offer=<id>` opens straight onto that offer's details, so a
    // card elsewhere (the AI assistant's offer card) can hand off to this
    // screen without the customer having to find the offer again. The param is
    // cleared once consumed so a later close doesn't reopen it.
    const deepLinkedOfferId = Number(router.query?.offer)
    useEffect(() => {
        if (!router.isReady || !deepLinkedOfferId) return
        setActiveOfferId(deepLinkedOfferId)
        const { offer, ...restQuery } = router.query
        router.replace({ pathname: router.pathname, query: restQuery }, undefined, {
            shallow: true,
        })
        // `router` is intentionally omitted: it is a new object on every route
        // change and would re-run this after the replace above.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady, deepLinkedOfferId])

    const {
        data: activeOfferDetails,
        isFetching: isActiveOfferDetailsFetching,
        isFetched: isActiveOfferDetailsFetched,
    } = useGetBogoOfferDetails(activeOfferId)

    const isActiveOfferDetailsLoading =
        isActiveOfferDetailsFetching && !isActiveOfferDetailsFetched

    const storeOffers =
        activeOfferDetails?.bundles?.map((bundle) => ({
            id: bundle.bundle_id,
            restaurant: {
                id: bundle.restaurant?.id,
                slug: bundle.restaurant?.slug,
                name: bundle.restaurant?.name,
                logoUrl: bundle.restaurant?.logo_full_url,
                deliveryTime: bundle.restaurant?.delivery_time,
                distance_label: bundle.restaurant?.distance_label,
            },
            buyItems: bundle.buy_items ?? [],
            getItems: bundle.free_items ?? [],
            price: getAmount(
                bundle.final_price,
                global?.currency_symbol_direction,
                global?.currency_symbol,
                global?.digit_after_decimal_point
            ),
            bundle,
        })) ?? []

    const isOfferDetailsOpen =
        Boolean(activeOfferId) &&
        !isActiveOfferDetailsLoading &&
        Boolean(activeOfferDetails)

    const handleClickBogoOffer = (storeOffer) => {
        setTempActiveOfferId(activeOfferId)
        setActiveBogoDetails({
            ...storeOffer,
            offerId: activeListOffer?.id,
            offerTitle: activeListOffer?.title,
            offerDescription: activeListOffer?.description,
            offerImage: activeListOffer?.image_full_url,
            validUntil:
                formatBogoValidUntil(activeOfferDetails) ||
                formatBogoValidUntil(activeListOffer),
        })
        setIsOpenBogoDetailsModal(true)
        setActiveOfferId(null)
    }

    const onCloseBogoItemOfferModal = () => {
        setActiveBogoDetails(null)
        setIsOpenBogoDetailsModal(false)
        setActiveOfferId(tempActiveOfferId)
    }

    if (!isBogoHomeFetched) return <BogoPageSkeleton />

    if (!bogoOffer?.is_live) {
        return (
            <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ minHeight: '400px' }}
            >
                <CustomEmptyResult
                    label="No BOGO Offer Available"
                    subTitle="There are no live BOGO offers right now, please check back later"
                    image={noDataFound}
                    height={160}
                    width={160}
                />
            </Stack>
        )
    }

    return (
        <>
            <Box
                sx={{
                    display: { xs: 'flex', md: 'grid' },
                    flexDirection: 'column',
                    gridTemplateColumns: { md: '416px 1fr' },
                    columnGap: { md: '32px' },
                    rowGap: { xs: '12px', md: 0 },
                    pt: { xs: 0, md: '24px' },
                }}
            >
                <Stack sx={{ gap: { xs: '12px', md: '8px' } }}>
                    <Breadcrumbs
                        separator={
                            <NavigateNextIcon
                                sx={{ fontSize: { xs: 12, md: 14 } }}
                            />
                        }
                        sx={{
                            fontSize: { xs: '12px', md: '14px' },
                            color: (theme) => theme.palette.text.secondary,
                            '& .MuiBreadcrumbs-separator': {
                                mx: { xs: '4px', md: '8px' },
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
                            <HomeIcon sx={{ fontSize: { xs: 12, md: 14 } }} />
                            {t('Home')}
                        </Link>
                        <Typography color="text.secondary" fontSize="inherit">
                            {t('BOGO')}
                        </Typography>
                    </Breadcrumbs>

                    <Box
                        sx={(theme) => ({
                            backgroundColor: {
                                xs: 'transparent',
                                md: theme.palette.background.paper,
                            },
                            borderRadius: { md: '16px' },
                            boxShadow: {
                                md: `0px 0px 16px -1px ${alpha(
                                    theme.palette.common.black,
                                    0.1
                                )}`,
                            },
                            p: { xs: 0, md: '32px' },
                            position: { md: 'sticky' },
                            top: { md: `${NAVBAR_HEIGHT + 24}px` },
                        })}
                    >
                        <Stack
                            alignItems="center"
                            sx={{ gap: { xs: '12px', md: '16px' } }}
                        >
                            <Box
                                component="img"
                                src="/static/bogo/bogo-icon.svg"
                                alt={t('BOGO')}
                                sx={{
                                    width: { xs: '79px', md: '100px' },
                                    height: { xs: '79px', md: '100px' },
                                }}
                            />
                            <Stack
                                sx={{
                                    gap: { xs: '6px', md: '12px' },
                                    textAlign: 'center',
                                }}
                            >
                                <Typography
                                    component="h1"
                                    sx={{
                                        fontSize: { xs: '18px', md: '24px' },
                                        fontWeight: 700,
                                        lineHeight: 1.1,
                                        letterSpacing: {
                                            xs: '-0.54px',
                                            md: '-1.2px',
                                        },
                                        color: (theme) =>
                                            theme.palette.text.primary,
                                    }}
                                >
                                    {t('Hurry Up! BOGO Offer Is Live')}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: { xs: '12px', md: '14px' },
                                        lineHeight: 1.3,
                                        color: (theme) =>
                                            theme.palette.text.secondary,
                                    }}
                                >
                                    {t(
                                        'Get the best value from your order with our exclusive BOGO deals. Choose eligible products, complete your purchase, and enjoy complimentary items with your order.'
                                    )}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>

                <Box
                    sx={(theme) => ({
                        pt: { md: '24px' },
                        mx: { xs: `-${theme.spacing(2)}`, md: 0 },
                    })}
                >
                    <Box
                        sx={{
                            backgroundColor: (theme) =>
                                theme.palette.background.paper,
                            borderRadius: { xs: '16px', md: '16px' },
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: 'repeat(auto-fill, minmax(380px, 1fr))',
                            },
                            gap: { xs: '20px', md: '20px' },
                            p: { xs: '16px', md: '20px' },
                        }}
                    >
                        {!isBogoOffersFetched
                            ? Array.from({ length: 4 }).map((_, index) => (
                                  <Box key={index} sx={{ minWidth: 0 }}>
                                      <BogoOfferCardSkeleton />
                                  </Box>
                              ))
                            : bogoOffersListData?.offers?.map((item) => (
                                  <Box key={item.id} sx={{ minWidth: 0 }}>
                                      <BogoOfferCard
                                          item={item}
                                          onClick={() =>
                                              setActiveOfferId(item.id)
                                          }
                                          loading={
                                              activeOfferId === item.id &&
                                              isActiveOfferDetailsLoading
                                          }
                                      />
                                  </Box>
                              ))}
                    </Box>
                </Box>

                {/* multiple store bogo offer card modal */}
                <BogoOfferDetails
                    open={isOfferDetailsOpen}
                    onClose={() => setActiveOfferId(null)}
                    bannerImage={activeListOffer?.image_full_url}
                    buyCount={activeListOffer?.buy_qty}
                    getCount={activeListOffer?.get_qty}
                    validUntil={
                        formatBogoValidUntil(activeOfferDetails) ||
                        formatBogoValidUntil(activeListOffer)
                    }
                    title={activeListOffer?.title}
                    description={activeListOffer?.description}
                    storeOffers={storeOffers}
                    onClickBogoOffer={handleClickBogoOffer}
                />
            </Box>

            {/* specific bogo item details  */}
            <BogoItemDetailsModal
                isOpenModal={Boolean(isOpenBogoDetailsModal)}
                onCloseModal={onCloseBogoItemOfferModal}
                activeBogoItem={activeBogoDetails}
            />
        </>
    )
}

export default BogoListPage
