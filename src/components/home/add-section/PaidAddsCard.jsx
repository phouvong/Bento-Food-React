import React, { useEffect, useState } from 'react'
import { alpha, Box, IconButton, Stack, Typography, styled } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ArrowForwardSharpIcon from '@mui/icons-material/ArrowForwardSharp'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'
import StarIcon from '@mui/icons-material/Star'
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
import FavoriteIcon from '@mui/icons-material/Favorite'
import CustomNextImage from '@/components/CustomNextImage'
import { handleRestaurantRedirect } from '@/utils/customFunctions'

const HiCard = styled(Box)(({ theme }) => ({
    background: 'transparent',
    border: `1px solid ${alpha(theme.palette.neutral[400], 0.3)}`,
    borderRadius: 14,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'border-color .18s ease, transform .18s ease',
    cursor: 'pointer',
    height: '100%',
    '&:hover': {
        borderColor: alpha(theme.palette.primary.main, 0.4),
        transform: 'translateY(-2px)',
    },
}))

const HiMedia = styled(Box)(({ theme }) => ({
    position: 'relative',
    aspectRatio: '16 / 10',
    overflow: 'hidden',
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
    bottom: 10,
    right: 10,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: '4px 9px',
    borderRadius: 6,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '-0.005em',
}))

const HiLogo = styled(Box)(({ theme }) => ({
    width: 44,
    height: 44,
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: theme.palette.neutral[100],
    border: `2px solid ${theme.palette.background.paper}`,
    outline: `1px solid ${theme.palette.neutral[300]}`,
    flexShrink: 0,
    alignSelf: 'center',
}))

const HiTitle = styled(Typography)(({ theme }) => ({
    margin: 0,
    fontSize: 14.5,
    fontWeight: 700,
    color: theme.palette.text.primary,
    letterSpacing: '-0.005em',
    lineHeight: 1.3,
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}))

const HiDesc = styled(Typography)(({ theme }) => ({
    margin: 0,
    color: theme.palette.text.secondary,
    fontSize: 12.5,
    fontWeight: 500,
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
}))

const WishBtn = styled(IconButton)(({ theme }) => ({
    flexShrink: 0,
    width: 26,
    height: 26,
    padding: 0,
    color: theme.palette.primary.main,
    transition: 'background .15s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
    '& svg': { fontSize: 17 },
}))

const ArrowBtn = styled(IconButton)(({ theme }) => ({
    width: 36,
    height: 36,
    alignSelf: 'center',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    borderRadius: '50%',
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
    '& svg': { fontSize: 18 },
}))

const VideoBar = styled(Stack)(({ theme }) => ({
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: '6px 10px 8px',
    background: 'linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0))',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    color: theme.palette.common.white,
    fontSize: 11,
    fontWeight: 600,
    zIndex: 2,
    pointerEvents: 'none',
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
        if (ended && data?.length > 0) {
            const nextSlide =
                sliderRef.current?.innerSlider?.state?.currentSlide + 1
            if (nextSlide < itemLength) {
                const nextSlideChildren = sliderRef?.current?.props?.children
                if (nextSlideChildren && nextSlideChildren[nextSlide]) {
                    const nextItem =
                        nextSlideChildren[nextSlide]?.props?.children?.props
                            ?.item
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
        }
    }, [ended, index, itemLength, sliderRef])

    const handleClick = () => {
        handleRestaurantRedirect(
            router,
            item?.restaurant?.slug,
            item?.restaurant?.id,
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

    const isInList = (id) =>
        !!wishLists?.restaurant?.find((r) => r.id === id)

    const isRestaurant = item?.add_type === 'restaurant_promotion'
    const showRating =
        (item?.is_rating_active === 1 || item?.is_review_active === 1) &&
        item?.average_rating > 0

    return (
        <>
            <Box sx={{  height: '100%' }}>
                <HiCard onClick={handleClick}>
                    <HiMedia>
                        {isRestaurant ? (
                            <CustomNextImage
                                src={item?.cover_image_full_url}
                                width="400"
                                height="250"
                                objectFit={
                                    item?.cover_image_full_url
                                        ? 'cover'
                                        : 'contain'
                                }
                                alt="cover image"
                            />
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

                        {isRestaurant && showRating && (
                            <RatingPill>
                                {item.is_review_active === 1 && (
                                    <>
                                        <StarIcon sx={{ fontSize: 12 }} />
                                        <Box component="span">
                                            {item?.average_rating.toFixed(1)}
                                        </Box>
                                    </>
                                )}
                                {item.is_rating_active === 1 && (
                                    <Box
                                        component="span"
                                        sx={{
                                            opacity: 0.9,
                                            fontWeight: 600,
                                            fontSize: 11,
                                        }}
                                    >
                                        ({item?.reviews_comments_count}+)
                                    </Box>
                                )}
                            </RatingPill>
                        )}
                    </HiMedia>

                    {isRestaurant ? (
                        <Box
                            sx={{
                                padding: '14px 16px 16px',
                                display: 'grid',
                                gridTemplateColumns: '44px 1fr',
                                gap: '12px',
                                alignItems: 'start',
                            }}
                        >
                            <HiLogo>
                                <CustomNextImage
                                    src={item?.profile_image_full_url}
                                    width="44"
                                    height="44"
                                    objectFit={
                                        item?.profile_image_full_url
                                            ? 'cover'
                                            : 'contain'
                                    }
                                />
                            </HiLogo>
                            <Box sx={{ minWidth: 0 }}>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    gap={1}
                                    sx={{ mb: '4px' }}
                                >
                                    <HiTitle component="h3">
                                        {item?.title || item?.restaurant?.name}
                                    </HiTitle>
                                    {/* <WishBtn
                                        aria-label="wishlist"
                                        onClick={(e) =>
                                            isInList(item?.restaurant?.id)
                                                ? deleteWishlistRes(e)
                                                : addToFavorite(e)
                                        }
                                    >
                                        {isInList(item?.restaurant?.id) ? (
                                            <FavoriteIcon />
                                        ) : (
                                            <FavoriteBorderOutlinedIcon />
                                        )}
                                    </WishBtn> */}
                                </Stack>
                                <HiDesc component="p">
                                    {item?.description}
                                </HiDesc>
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                padding: '14px 16px 16px',
                                display: 'grid',
                                gridTemplateColumns: '1fr 36px',
                                gap: '10px',
                                alignItems: 'center',
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <HiTitle
                                    component="h3"
                                    sx={{ mb: '4px', display: 'block' }}
                                >
                                    {item?.title}
                                </HiTitle>
                                <HiDesc component="p">
                                    {item?.description}
                                </HiDesc>
                            </Box>
                            <ArrowBtn
                                aria-label="open"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleClick()
                                }}
                            >
                                <ArrowForwardSharpIcon />
                            </ArrowBtn>
                        </Box>
                    )}
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
