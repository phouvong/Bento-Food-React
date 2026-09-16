import React, { useEffect, useState } from 'react'
import {
    Box,
    Button,
    IconButton,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
    styled,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import VideoPlayerWithCenteredControl from '@/components/home/add-section/VideoPlayerWithCenteredControl'
import { useRouter } from 'next/router'
import CustomModal from '@/components/custom-modal/CustomModal'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useMutation } from 'react-query'
import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { toast } from 'react-hot-toast'
import { addWishListRes, removeWishListRes } from '@/redux/slices/wishList'
import { useWishListResDelete } from '@/hooks/react-query/config/wish-list/useWishListResDelete'
import { useDispatch, useSelector } from 'react-redux'
import { t } from 'i18next'
import CustomNextImage from '@/components/CustomNextImage'
import { handleRestaurantRedirect } from '@/utils/customFunctions'

// Figma "App & Web/Card M" drop shadow.
const CARD_SHADOW =
    '0px 5px 9px 0px rgba(0,0,0,0.07), 0px 0px 4px 0px rgba(0,0,0,0.05)'

const HiCard = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: 12,
    padding: 2,
    boxShadow: CARD_SHADOW,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform .18s ease',
    cursor: 'pointer',
    height: '100%',
    '&:hover': {
        transform: 'translateY(-2px)',
    },
}))

const HiMedia = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    aspectRatio: '296 / 182',
    borderRadius: 12,
    overflow: 'hidden',
    border: `2px solid ${theme.palette.background.paper}`,
    boxShadow: '0px 1px 4px 0px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.neutral[100],
    '& img, & video': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
}))

const RatingPill = styled(Stack)(({ theme }) => ({
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: '4px 6px',
    borderRadius: 999,
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
    '& i': { fontSize: 12, color: theme.palette.warning.main },
}))

const HiLogo = styled(Box)(({ theme }) => ({
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
}))

const HiTitle = styled(Typography)(({ theme }) => ({
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: theme.palette.text.primary,
    letterSpacing: '-0.48px',
    lineHeight: 1.1,
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}))

const HiDesc = styled(Typography)(({ theme }) => ({
    margin: 0,
    color: theme.palette.text.secondary,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
}))

const WishBtn = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    width: 28,
    height: 28,
    padding: 6,
    backgroundColor: theme.palette.neutral[200],
    '&:hover': { backgroundColor: theme.palette.neutral[200] },
    '& i': { fontSize: 13, color: theme.palette.error.main },
}))

const TopItemsWrap = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
}))

const TopItemThumb = styled(Box)(({ theme }) => ({
    width: 28,
    height: 28,
    borderRadius: '50%',
    overflow: 'hidden',
    border: `2px solid ${theme.palette.background.paper}`,
    backgroundColor: theme.palette.neutral[100],
    marginInlineStart: -8,
    flexShrink: 0,
    '&:first-of-type': {
        marginInlineStart: 0,
    },
    '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
}))

const TopItemsMoreCount = styled(Box)(({ theme }) => ({
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${theme.palette.background.paper}`,
    backgroundColor: theme.palette.neutral[200],
    marginInlineStart: -8,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 600,
    color: theme.palette.text.primary,
}))

const ExploreBtn = styled(Button)(({ theme }) => ({
    height: 36,
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '-0.42px',
    textTransform: 'none',
    flexShrink: 0,
    backgroundColor: theme.palette.primary.main,
    '&:hover': { backgroundColor: theme.palette.primary.dark },
}))

const PaidAddsCard = ({
    item,
    itemLength,
    activeSlideData,
    setIsAutoPlay,
    index,
    sliderRef,
    data,
    setDuration,
    setRenderComp,
    renderComp,
    isDuplicate,
}) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const [playing, setPlaying] = useState(false)
    const [ended, setEnded] = useState(false)
    const [videoModal, setVideoModal] = useState(false)
    const [playOnModal, setPlayOnModal] = useState(false)
    const router = useRouter()
    const { token } = useSelector((state) => state.userToken)
    const { wishLists } = useSelector((state) => state.wishList)

    const isSmall = useMediaQuery(theme.breakpoints.down('md'))

    const slideHandler = () => {
        if (!activeSlideData) return
        if (itemLength > 3 || isSmall) {
            if (
                !ended &&
                item?.id === activeSlideData?.id &&
                activeSlideData?.add_type === 'video_promotion'
            ) {
                setPlaying(true)
            }
            return
        }
        if (index === 0 && item.add_type === 'video_promotion') {
            setPlaying(true)
            return
        }
        if (index === 1 && item.add_type === 'video_promotion') {
            if (ended || data[0]?.add_type !== 'video_promotion') {
                setPlaying(true)
            }
            return
        }
        if (index === 2 && item.add_type === 'video_promotion') {
            if (
                ended ||
                (data[1]?.add_type !== 'video_promotion' &&
                    data[0]?.add_type !== 'video_promotion')
            ) {
                setPlaying(true)
            }
        }
    }

    useEffect(() => {
        if (data) slideHandler()
    }, [itemLength, activeSlideData, index])

    useEffect(() => {
        if (ended && sliderRef.current) sliderRef.current.slickPlay()
    }, [ended])

    useEffect(() => {
        if (!ended || !(data?.length > 0)) return
        if (isDuplicate) {
            setPlaying(false)
            setEnded(false)
            return
        }
        const nextSlide =
            sliderRef.current?.innerSlider?.state?.currentSlide + 1
        if (nextSlide < itemLength) {
            const nextSlideChildren = sliderRef?.current?.props?.children
            if (nextSlideChildren && nextSlideChildren[nextSlide]) {
                const nextItem =
                    nextSlideChildren[nextSlide]?.props?.children?.props?.item
                if (nextItem?.add_type === 'video_promotion') {
                    sliderRef?.current?.slickNext()
                } else {
                    setPlaying(false)
                }
            } else {
                setPlaying(false)
            }
        } else {
            setPlaying(false)
        }
        setEnded(false)
    }, [ended, index, itemLength, sliderRef, isDuplicate])

    const handleClick = () => {
        handleRestaurantRedirect(
            router,
            item?.restaurant?.slug,
            item?.restaurant?.id
        )
    }

    const { mutate: addFavoriteMutation } = useMutation(
        'add-favourite',
        () => RestaurantsApi.addFavorite(item?.restaurant?.id),
        {
            onSuccess: (response) => {
                toast.success(t('Added to Wishlist successfully.'))
                const tempId = item?.restaurant?.id
                if (response?.data) {
                    dispatch(
                        addWishListRes({
                            logo_full_url: item?.restaurant?.logo_full_url,
                            name: item?.restaurant?.name,
                            rating_count: item?.restaurant?.rating_count,
                            avg_rating: item?.average_rating,
                            address: item?.restaurant?.address,
                            delivery_time: item?.restaurant?.delivery_time,
                            minimum_order: item?.restaurant?.minimum_order,
                            latitude: item?.restaurant?.latitude,
                            longitude: item?.restaurant?.longitude,
                            id: tempId,
                        })
                    )
                }
            },
            onError: () => {},
        }
    )

    const addToFavorite = (e) => {
        e.stopPropagation()
        if (token) addFavoriteMutation()
        else toast.error(t('You are not logged in'))
    }

    const onSuccessHandlerForResDelete = (res) => {
        if (res) {
            toast.success(
                t('Removed from  favorite successfully.', { id: 'favorite' })
            )
            dispatch(removeWishListRes(item?.restaurant?.id))
        }
    }

    const { mutate: restaurantMutate } = useWishListResDelete(
        onSuccessHandlerForResDelete
    )

    const deleteWishlistRes = (e) => {
        e.stopPropagation()
        restaurantMutate(item?.restaurant?.id)
    }

    const isInList = (id) => !!wishLists?.restaurant?.find((r) => r.id === id)

    const isRestaurant = item?.add_type === 'restaurant_promotion'
    const activeIndex = data?.findIndex((d) => d?.id === activeSlideData?.id)
    const isNearActive =
        !isSmall ||
        (activeIndex === undefined || activeIndex === -1
            ? index <= 1
            : Math.abs(index - activeIndex) <= 1)
    const showRating =
        (item?.is_rating_active === 1 || item?.is_review_active === 1) &&
        item?.average_rating > 0
    const isWishlisted = isInList(item?.restaurant?.id)

    const topItems = item?.restaurant?.top_items || []
    const visibleTopItems = topItems.slice(0, 3)
    const extraTopItemsCount = topItems.length - visibleTopItems.length

    return (
        <>
            <Box
                sx={{
                    height: '100%',
                    width: 'min(300px, 100%)',
                }}
            >
                <HiCard onClick={handleClick}>
                    <HiMedia>
                        {isRestaurant ? (
                            isNearActive ? (
                                <CustomNextImage
                                    src={item?.cover_image_full_url}
                                    width="400"
                                    height="250"
                                    errorWidth={80}
                                    errorHeight={80}
                                    objectFit={
                                        item?.cover_image_full_url
                                            ? 'cover'
                                            : 'contain'
                                    }
                                    alt="cover image"
                                />
                            ) : (
                                <Skeleton
                                    variant="rectangular"
                                    animation={false}
                                    sx={{ width: '100%', height: '100%' }}
                                />
                            )
                        ) : (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    '& > .MuiStack-root': {
                                        height: '100% !important',
                                        margin: '0 !important',
                                        borderRadius: 0,
                                        boxShadow: 'none',
                                    },
                                }}
                            >
                                <VideoPlayerWithCenteredControl
                                    ended={ended}
                                    setEnded={setEnded}
                                    playing={playing}
                                    setPlaying={setPlaying}
                                    video={item?.video_attachment_full_url}
                                    setDuration={setDuration}
                                    isMargin={false}
                                    height="100%"
                                />
                            </Box>
                        )}

                        <WishBtn
                            aria-label="wishlist"
                            onClick={(e) =>
                                isWishlisted
                                    ? deleteWishlistRes(e)
                                    : addToFavorite(e)
                            }
                        >
                            <i
                                className={
                                    isWishlisted
                                        ? 'fi fi-sr-heart'
                                        : 'fi fi-rr-heart'
                                }
                            />
                        </WishBtn>

                        {showRating && (
                            <RatingPill>
                                {item.is_review_active === 1 && (
                                    <>
                                        <i className="fi fi-sr-star" />
                                        <Typography
                                            component="span"
                                            sx={{
                                                fontSize: 14,
                                                fontWeight: 400,
                                                lineHeight: 1.1,
                                                color: (theme) =>
                                                    theme.palette.text.primary,
                                            }}
                                        >
                                            {item?.average_rating.toFixed(1)}
                                        </Typography>
                                    </>
                                )}
                                {item.is_rating_active === 1 && (
                                    <Typography
                                        component="span"
                                        sx={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: (theme) =>
                                                theme.palette.text.secondary,
                                        }}
                                    >
                                        ({item?.reviews_comments_count}+)
                                    </Typography>
                                )}
                            </RatingPill>
                        )}
                    </HiMedia>

                    <Box
                        sx={{
                            pt: '16px',
                            px: '12px',
                            pb: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            flex: 1,
                        }}
                    >
                        <Stack
                            direction="row"
                            gap="8px"
                            alignItems="flex-start"
                            sx={{ minHeight: 56 }}
                        >
                            <HiLogo>
                                <CustomNextImage
                                    src={
                                        item?.profile_image_full_url ||
                                        item?.restaurant?.logo_full_url
                                    }
                                    width="40"
                                    height="40"
                                    objectFit={
                                        item?.profile_image_full_url ||
                                        item?.restaurant?.logo_full_url
                                            ? 'cover'
                                            : 'contain'
                                    }
                                />
                            </HiLogo>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <HiTitle component="h3" sx={{ mb: '4px' }}>
                                    {item?.title || item?.restaurant?.name}
                                </HiTitle>
                                <HiDesc component="p">
                                    {item?.description}
                                </HiDesc>
                            </Box>
                        </Stack>

                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            gap="8px"
                            sx={{ mt: 'auto' }}
                        >
                            {visibleTopItems.length > 0 ? (
                                <TopItemsWrap>
                                    {visibleTopItems.map((topItem, i) => (
                                        <Tooltip
                                            key={topItem?.id || i}
                                            title={topItem?.name || ''}
                                            arrow
                                        >
                                            <TopItemThumb
                                                sx={{
                                                    zIndex:
                                                        visibleTopItems.length -
                                                        i,
                                                }}
                                            >
                                                <CustomNextImage
                                                    src={
                                                        topItem?.image_full_url
                                                    }
                                                    width="28"
                                                    height="28"
                                                    objectFit="cover"
                                                    alt={topItem?.name}
                                                />
                                            </TopItemThumb>
                                        </Tooltip>
                                    ))}
                                    {extraTopItemsCount > 0 && (
                                        <TopItemsMoreCount sx={{ zIndex: 0 }}>
                                            +{extraTopItemsCount}
                                        </TopItemsMoreCount>
                                    )}
                                </TopItemsWrap>
                            ) : (
                                <Box />
                            )}

                            <ExploreBtn
                                variant="contained"
                                disableElevation
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleClick()
                                }}
                            >
                                {t('Explore')}
                            </ExploreBtn>
                        </Stack>
                    </Box>
                </HiCard>
            </Box>

            <CustomModal
                openModal={videoModal}
                closeButton
                setModalOpen={setVideoModal}
            >
                <CustomStackFullWidth sx={{ padding: '1rem' }}>
                    <VideoPlayerWithCenteredControl
                        ended={ended}
                        setEnded={setEnded}
                        playing={playOnModal}
                        setPlaying={setPlayOnModal}
                        video={item?.video_attachment_full_url}
                        height="400px"
                        isMargin={false}
                    />
                </CustomStackFullWidth>
            </CustomModal>
        </>
    )
}

export default PaidAddsCard
