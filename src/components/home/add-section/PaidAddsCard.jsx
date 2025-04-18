import React, { useEffect, useState } from 'react'
import { alpha, Box, IconButton, Stack, Typography } from '@mui/material'
import CustomImageContainer from '@/components/CustomImageContainer'
import { useTheme } from '@mui/styles'
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

        // Handle the case when there are more than 3 slides
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

        // Handle the case when there are 3 or fewer slides
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
        if (data) {
            slideHandler()
        }
    }, [itemLength, activeSlideData, index])

    useEffect(() => {
        // Handle autoplay state based on video end
        if (ended && sliderRef.current) {
            sliderRef.current.slickPlay()
        }
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
        router.push({
            pathname: `/restaurant/[id]`,
            query: {
                id: `${item?.slug ? item?.slug : item?.restaurant?.id}`,
                restaurant_zone_id: item?.restaurant?.zone_id,
            },
        })
    }
    const handleVideoClick = () => {
        setVideoModal(true)
    }
    const {
        mutate: addFavoriteMutation,
        isLoading,
        error,
    } = useMutation(
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

                    //setOpen(false)
                }
            },
            onError: (error) => {},
        }
    )
    const addToFavorite = (e) => {
        e.stopPropagation()
        if (token) {
            addFavoriteMutation()
        } else toast.error(t('You are not logged in'))
    }
    const onSuccessHandlerForResDelete = (res, id) => {
        if (res) {
            toast.success(
                t('Removed from  favorite successfully.', {
                    id: 'favorite',
                })
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

    const isInList = (id) => {
        return !!wishLists?.restaurant?.find(
            (wishRestaurant) => wishRestaurant.id === id
        )
    }
    return (
        <>
            <Box
                sx={{ maxWidth: '450px', cursor: 'pointer' }}
                onClick={handleClick}
            >
                {item?.add_type === 'restaurant_promotion' ? (
                    <Stack
                        sx={{
                            position: 'relative',
                            margin: '0px 25px -110px',
                            boxShadow:
                                '0px 15px 30px rgba(150, 150, 154, 0.40)',
                            borderRadius: '10px',
                        }}
                    >
                        <Stack position="relative">
                            {(item?.is_rating_active === 1 ||
                                item.is_review_active === 1) && (
                                <Stack
                                    maxWidth="90px"
                                    width="100%"
                                    position="absolute"
                                    bottom="10px"
                                    right="10px"
                                    alignItems="center"
                                    zIndex="1"
                                    flexDirection="row"
                                    backgroundColor={theme.palette.primary.main}
                                    borderRadius="6px"
                                    padding="5px"
                                    gap="5px"
                                >
                                    {item.is_review_active === 1 && (
                                        <>
                                            <StarIcon
                                                sx={{
                                                    fontSize: '18px',
                                                    color: (theme) =>
                                                        theme.palette
                                                            .neutral[100],
                                                }}
                                            />
                                            <Typography
                                                color={
                                                    theme.palette.neutral[100]
                                                }
                                                fontSize="14px"
                                                fontWeight="600"
                                            >
                                                {item?.average_rating.toFixed(
                                                    1
                                                )}
                                            </Typography>
                                        </>
                                    )}
                                    {item.is_review_active === 1 && (
                                        <Typography
                                            color={theme.palette.neutral[100]}
                                            fontSize="14px"
                                        >
                                            ({item?.reviews_comments_count}+)
                                        </Typography>
                                    )}
                                </Stack>
                            )}

                            <CustomImageContainer
                                boxShadow={
                                    theme.palette.mode === 'dark'
                                        ? '0px 15px 30px rgba(0, 0, 0, 0.8)'
                                        : '0px 15px 30px rgba(150, 150, 154, 0.40)'
                                }
                                src={item?.cover_image_full_url}
                                width="100%"
                                height="200px"
                                objectFit="cover"
                                borderRadius="10px"
                            />
                        </Stack>
                    </Stack>
                ) : (
                    <VideoPlayerWithCenteredControl
                        ended={ended}
                        setEnded={setEnded}
                        playing={playing}
                        setPlaying={setPlaying}
                        video={item?.video_attachment_full_url}
                        setDuration={setDuration}
                        isMargin={true}
                    />
                )}

                <Stack
                    paddingTop="130px"
                    paddingBottom="20px"
                    paddingInline="25px"
                    position="relative"
                    sx={{
                        '&::after': {
                            transform: 'perspective(500px) rotateX(5deg)',
                            boxShadow:
                                '0px -4.412px 29.412px rgba(150, 150, 154, 0.20)',
                            content: "''",
                            position: 'absolute',
                            top: '0px',
                            left: '0px',
                            width: '100%',
                            height: '100%',
                            borderRadius: '15px',
                            zIndex: '-1',
                            backgroundColor: (theme) =>
                                theme.palette.neutral[100],
                        },
                    }}
                >
                    {item?.add_type === 'restaurant_promotion' ? (
                        <Stack flexDirection="row" gap="1rem" width="100%">
                            <Stack
                                sx={{
                                    border: `1px solid ${alpha(
                                        theme.palette.primary.main,
                                        0.5
                                    )}`,
                                    borderRadius: '50%',
                                }}
                            >
                                <CustomImageContainer
                                    src={item?.profile_image_full_url}
                                    width="70px"
                                    height="70px"
                                    objectFit="cover"
                                    borderRadius="50%"
                                />
                            </Stack>
                            <Stack width={0} flexGrow={1}>
                                <Stack
                                    flexDirection="row"
                                    gap=".6rem"
                                    width="100%"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Typography
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: '1',
                                            WebkitBoxOrient: 'vertical',

                                            whiteSpace: 'wrap',
                                            wordWrap: 'break-word',
                                         
                                        }}
                                        color={theme.palette.neutral[1000]}
                                        fontSize={{
                                            xs: '16px',
                                            sm: '18px',
                                            md: '20px',
                                        }}
                                        fontWeight="600"
                                        component="h3"
                                    >
                                        {item?.title}
                                    </Typography>
                                    {!isInList(item?.restaurant?.id) ? (
                                        <FavoriteBorderOutlinedIcon
                                            onClick={(e) => addToFavorite(e)}
                                            sx={{
                                                cursor: 'pointer',
                                                flexShrink: 0,
                                            }}
                                            color="primary"
                                        />
                                    ) : (
                                        <FavoriteIcon
                                            onClick={(e) =>
                                                deleteWishlistRes(e)
                                            }
                                            color="primary"
                                            sx={{
                                                fontSize: {
                                                    xs: '16px',
                                                    sm: '18px',
                                                    md: '20px',
                                                },
                                            }}
                                        />
                                    )}
                                </Stack>
                                <Typography
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '2',
                                        WebkitBoxOrient: 'vertical',
                                        wordWrap: 'break-word',
                                        color: theme.palette.neutral[1000],
                                    }}
                                    color={theme.palette.neutral[500]}
                                    fontSize={{
                                        xs: '13px',
                                        sm: '14px',
                                        md: '14px',
                                    }}
                                    component="p"
                                >
                                    {item?.description}
                                </Typography>
                            </Stack>
                        </Stack>
                    ) : (
                        <>
                            <Typography
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: '1',
                                    WebkitBoxOrient: 'vertical',
                                    color: (theme) =>
                                        theme.palette.neutral[1000],
                                }}
                                fontSize={{
                                    xs: '16px',
                                    sm: '18px',
                                    md: '20px',
                                }}
                                component="h3"
                                fontWeight="600"
                            >
                                {item?.title}
                            </Typography>
                            <Stack
                                flexDirection="row"
                                gap="20px"
                                justifyContent="space-between"
                            >
                                <Typography
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '2',
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                    fontSize={{
                                        xs: '13px',
                                        sm: '14px',
                                        md: '14px',
                                    }}
                                    color={theme.palette.neutral[500]}
                                    component="p"
                                >
                                    {item?.description}
                                </Typography>
                                <IconButton
                                    onClick={handleClick}
                                    padding="10px"
                                    sx={{
                                        borderRadius: '10px',
                                        border: `1.5px solid ${theme.palette.primary.main}`,
                                    }}
                                >
                                    <ArrowForwardSharpIcon color="primary" />
                                </IconButton>
                            </Stack>
                        </>
                    )}
                </Stack>
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
