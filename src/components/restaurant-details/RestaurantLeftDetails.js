import RestaurantMapView from '@/components/restaurant-details/RestaurantMapView'
import RestaurantReviewModal from '@/components/restaurant-details/RestaurantReviewModal'
import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { useWishListResDelete } from '@/hooks/react-query/config/wish-list/useWishListResDelete'
import { addWishListRes, removeWishListRes } from '@/redux/slices/wishList'
import {
    CustomStackFullWidth,
    SliderCustom,
} from '@/styled-components/CustomStyles.style'
import { getAmount, isAvailable } from '@/utils/customFunctions'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DirectionsOutlinedIcon from '@mui/icons-material/DirectionsOutlined'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import {
    Button,
    Divider,
    Grid,
    IconButton,
    TextField,
    Typography,
    alpha,
    Box,
    Stack,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import moment from 'moment'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import {
    EmailIcon,
    EmailShareButton,
    FacebookMessengerIcon,
    FacebookMessengerShareButton,
    LineIcon,
    LineShareButton,
    LinkedinIcon,
    LinkedinShareButton,
    LivejournalIcon,
    LivejournalShareButton,
    RedditIcon,
    RedditShareButton,
    TelegramIcon,
    TelegramShareButton,
    TumblrIcon,
    TumblrShareButton,
    TwitterIcon,
    TwitterShareButton,
    WhatsappIcon,
    WhatsappShareButton,
} from 'react-share'
import Slider from 'react-slick'
import CustomImageContainer from '../CustomImageContainer'
import { RTL } from '../RTL/RTL'
import CustomModal from '../custom-modal/CustomModal'
import FoodRating from '../food-card/FoodRating'
import ClosedNowOverlay from './HeadingBannerSection/ClosedNowOverlay'
import { RestaurantCommonTypography } from './restaurant-details.style'
import { shareSettings } from './shareSettings'

// Define facebookAppId before using it
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''

const RestaurantLeftDetails = (props) => {
    const {
        details,
        restaurantCoverUrl,
        currencySymbolDirection,
        currencySymbol,
        digitAfterDecimalPoint,
        scrollPosition,
    } = props
    const dispatch = useDispatch()
    const { wishLists } = useSelector((state) => state.wishList)
    const { token } = useSelector((state) => state.userToken)
    const theme = useTheme()
    const currentRoute =
        typeof window !== 'undefined' ? window.location.href : ''
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const [openModal, setOpenModal] = useState(false)
    const [openShareModal, setOpenShareModal] = useState(false)
    const [openReviewModal, setOpenReviewModal] = useState(false)
    const { t } = useTranslation()
    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }
    const size = isSmall ? 30 : 40
    const {
        logo_full_url,
        name,
        rating_count,
        avg_rating,
        address,
        delivery_time,
        minimum_order,
        latitude,
        longitude,
        id,
        active,
        schedules,
    } = details
    const { mutate: addFavoriteMutation } = useMutation(
        'add-favourite',
        () => RestaurantsApi.addFavorite(id),
        {
            onSuccess: (response) => {
                toast.success(t('Added to Wishlist successfully.'))

                if (response?.data) {
                    dispatch(
                        addWishListRes({
                            logo_full_url: logo_full_url,
                            name,
                            rating_count,
                            avg_rating,
                            address,
                            delivery_time,
                            minimum_order,
                            latitude,
                            longitude,
                            id,
                        })
                    )
                }
            },
            onError: (error) => {},
        }
    )

    const addToFavorite = () => {
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
            dispatch(removeWishListRes(id))
        }
    }
    const { mutate: restaurantMutate } = useWishListResDelete(
        onSuccessHandlerForResDelete
    )

    const deleteWishlistRes = (id) => {
        restaurantMutate(id)
    }

    const isInList = (id) => {
        return !!wishLists?.restaurant?.find(
            (wishRestaurant) => wishRestaurant.id === id
        )
    }
    const handleCopy = (url) => {
        navigator.clipboard.writeText(url)
        toast(() => <span>{t('Your restaurant URL has been copied')}</span>)
    }
    const closedNowHandler = () => {
        if (active) {
            if (schedules.length > 0) {
                const todayInNumber = moment().weekday()
                let isOpen
                let filteredSchedules = schedules.filter(
                    (item) => item.day === todayInNumber
                )
                let isAvailableNow = []
                filteredSchedules.forEach((item) => {
                    if (isAvailable(item?.opening_time, item?.closing_time)) {
                        isAvailableNow.push(item)
                    }
                })
                isOpen = isAvailableNow.length > 0
                if (!isOpen) {
                    return (
                        <ClosedNowOverlay
                            t={t}
                            theme={theme}
                            scrollPosition={scrollPosition}
                            isSmall={isSmall}
                        />
                    )
                }
            } else {
                return (
                    <ClosedNowOverlay
                        t={t}
                        theme={theme}
                        scrollPosition={scrollPosition}
                        isSmall={isSmall}
                    />
                )
            }
        } else {
            return (
                <ClosedNowOverlay
                    t={t}
                    theme={theme}
                    scrollPosition={scrollPosition}
                    isSmall={isSmall}
                />
            )
        }
    }

    const handleTop = () => {
        return (
            <RTL direction={languageDirection}>
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    sx={{
                        animation: 'fadeIn .9s',
                        '@keyframes fadeIn ': {
                            '0%': {
                                opacity: '0',
                            },
                            '100%': {
                                opacity: '1',
                            },
                        },
                    }}
                >
                    <CustomStackFullWidth
                        alignItems={{ xs: 'center', sm: 'center' }}
                        justiyfContent="center"
                        direction="row"
                        spacing={1}
                        sx={{
                            padding: {
                                xs: '5px 5px 5px 5px',
                                sm: '20px 20px 20px 20px',
                                md: '25px 25px 30px 25px',
                            },
                            height: '100%',
                        }}
                    >
                        <Stack
                            position="absolute"
                            top={
                                scrollPosition === 0
                                    ? '5%'
                                    : isSmall
                                    ? '15%'
                                    : '21%'
                            }
                            right="5%"
                            zIndex="999"
                            gap="10px"
                        >
                            {!isInList(id) ? (
                                <IconButton
                                    sx={{
                                        borderRadius: '8px',
                                        border: `1px solid ${theme.palette.primary.main}`,
                                        background: (theme) =>
                                            theme.palette.neutral[100],
                                        padding: {
                                            xs: '3px',
                                            sm: '5px',
                                            md: '7px',
                                        },
                                    }}
                                    onClick={(e) => addToFavorite(e)}
                                >
                                    <FavoriteBorderIcon
                                        color="primary"
                                        sx={{
                                            fontSize: {
                                                xs: '16px',
                                                sm: '18px',
                                                md: '20px',
                                            },
                                        }}
                                    />
                                </IconButton>
                            ) : (
                                <IconButton
                                    sx={{
                                        borderRadius: '8px',
                                        border: `1px solid ${theme.palette.primary.main}`,
                                        background: (theme) =>
                                            theme.palette.neutral[100],
                                        padding: {
                                            xs: '3px',
                                            sm: '5px',
                                            md: '7px',
                                        },
                                    }}
                                    onClick={(e) => deleteWishlistRes(id, e)}
                                >
                                    <FavoriteIcon
                                        color="primary"
                                        sx={{
                                            fontSize: {
                                                xs: '16px',
                                                sm: '18px',
                                                md: '20px',
                                            },
                                        }}
                                    />
                                </IconButton>
                            )}

                            <IconButton
                                sx={{
                                    borderRadius: '8px',
                                    // padding: "5px",
                                    border: `1px solid ${theme.palette.primary.main}`,
                                    background: (theme) =>
                                        theme.palette.neutral[100],
                                    padding: {
                                        xs: '3px',
                                        sm: '5px',
                                        md: '7px',
                                    },
                                }}
                                onClick={() => setOpenModal(true)}
                            >
                                <DirectionsOutlinedIcon
                                    color="primary"
                                    sx={{
                                        fontSize: {
                                            xs: '16px',
                                            sm: '18px',
                                            md: '20px',
                                        },
                                    }}
                                />
                            </IconButton>
                            <IconButton
                                sx={{
                                    borderRadius: '8px',
                                    border: `1px solid ${theme.palette.primary.main}`,
                                    background: (theme) =>
                                        theme.palette.neutral[100],
                                    padding: {
                                        xs: '3px',
                                        sm: '5px',
                                        md: '7px',
                                    },
                                }}
                                onClick={(e) => setOpenShareModal(true)}
                            >
                                <ShareOutlinedIcon
                                    color="primary"
                                    sx={{
                                        fontSize: {
                                            xs: '16px',
                                            sm: '18px',
                                            md: '20px',
                                        },
                                    }}
                                />
                            </IconButton>
                        </Stack>
                        <Box
                            sx={{
                                width:
                                    scrollPosition === 0
                                        ? '100px'
                                        : isSmall
                                        ? '74px'
                                        : '100px',
                                height:
                                    scrollPosition === 0
                                        ? '100px'
                                        : isSmall
                                        ? '74px'
                                        : '100px',
                                borderRadius: '50%',
                                position: 'relative',
                            }}
                        >
                            {closedNowHandler()}
                            {isSmall ? (
                                <Stack
                                    position="absolute"
                                    top={scrollPosition === 0 ? '-35px' : '0px'}
                                    sx={{ zIndex: 9999 }}
                                    // height={{
                                    //     xs:
                                    //         scrollPosition === 0
                                    //             ? '100px'
                                    //             : '74px',
                                    //     sm: '100px',
                                    //     md: '100px',
                                    // }}
                                >
                                    <CustomImageContainer
                                        src={details?.logo_full_url}
                                        width="100%"
                                        height="100%"
                                        borderRadius="50%"
                                        objectFit="cover"
                                        aspectRatio="1"
                                    />
                                </Stack>
                            ) : (
                                <CustomImageContainer
                                    src={details?.logo_full_url}
                                    width="100%"
                                    height="100%"
                                    borderRadius="50%"
                                    objectFit="cover"
                                    aspectRatio="1"
                                />
                            )}
                        </Box>
                        <Stack padding="10px" justifyContent="center" gap="8px">
                            <Typography
                                color={theme.palette.neutral[1000]}
                                fontWeight="600"
                            >
                                {details?.name}
                            </Typography>
                            <Typography
                                align="left"
                                fontSize="13px"
                                color={theme.palette.neutral[600]}
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: '1',
                                    WebkitBoxOrient: 'vertical',
                                    wordWrap: 'break-word',
                                    width: {
                                        xs: '192px',
                                        sm: '215px',
                                        md: '215px',
                                    },
                                }}
                            >
                                {details?.characteristics?.length > 0 &&
                                    details?.characteristics?.map(
                                        (item, index) => (
                                            <>
                                                {item}{' '}
                                                {details?.characteristics
                                                    .length -
                                                    1 ===
                                                index
                                                    ? ''
                                                    : ','}
                                            </>
                                        )
                                    )}
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                            >
                                <FoodRating
                                    product_avg_rating={details?.avg_rating}
                                />
                            </Stack>
                            {details?.rating_count ? (
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                >
                                    <Typography
                                        onClick={() => setOpenReviewModal(true)}
                                        color={theme.palette.neutral[1000]}
                                        fontSize="13px"
                                        sx={{
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {JSON.stringify(details?.rating_count)}{' '}
                                        {t('Ratings')}
                                    </Typography>

                                    <Divider
                                        orientation="vertical"
                                        flexItem
                                        width="3px"
                                        height="100%"
                                        sx={{
                                            opacity: 1,
                                            backgroundColor:
                                                theme.palette.neutral[300],
                                        }}
                                    />

                                    <Typography
                                        onClick={() => setOpenReviewModal(true)}
                                        color={theme.palette.neutral[1000]}
                                        fontSize="13px"
                                        sx={{
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {JSON.stringify(
                                            details?.reviews_comments_count
                                        )}{' '}
                                        {t('Reviews')}
                                    </Typography>
                                </Stack>
                            ) : null}
                        </Stack>
                    </CustomStackFullWidth>
                </Grid>
            </RTL>
        )
    }
    const handleBottom = () => {
        return (
            <Grid
                container
                item
                xs={12}
                sm={12}
                md={12}
                sx={{
                    paddingX: '20px',
                    background: theme.palette.neutral[1800],
                }}
                alignItems="center"
            >
                {details?.positive_rating !== 0 ? (
                    <Grid xs={4} sm={4} md={4}>
                        <RestaurantCommonTypography>
                            {details?.positive_rating} %
                        </RestaurantCommonTypography>
                        <RestaurantCommonTypography
                            fontSize="12px"
                            smFontSize="12px"
                            fontWeight="400"
                        >
                            {t('Positive Review')}
                        </RestaurantCommonTypography>
                    </Grid>
                ) : null}

                {details?.delivery_time ? (
                    <Grid xs={4} sm={4} md={4}>
                        <RestaurantCommonTypography>
                            {details?.delivery_time}
                        </RestaurantCommonTypography>
                        <RestaurantCommonTypography
                            fontSize="12px"
                            smFontSize="12px"
                            fontWeight="400"
                        >
                            {t('Delivery Time')}
                        </RestaurantCommonTypography>
                    </Grid>
                ) : null}
                {details?.minimum_order ? (
                    <Grid xs={4} sm={4} md={4}>
                        <RestaurantCommonTypography>
                            {' '}
                            {getAmount(
                                details?.minimum_order,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                        </RestaurantCommonTypography>
                        <RestaurantCommonTypography
                            fontSize="12px"
                            smFontSize="12px"
                            fontWeight="400"
                        >
                            {t('Minimum Order')}
                        </RestaurantCommonTypography>
                    </Grid>
                ) : null}
            </Grid>
        )
    }
    return (
        <CustomStackFullWidth
            sx={{
                position: scrollPosition === 0 ? 'inherit' : 'sticky',
                marginTop: scrollPosition === 0 ? '0px' : isSmall && '30px',
            }}
        >
            <CustomStackFullWidth
                sx={{
                    position: 'relative',
                    boxShadow: '0px 2px 30px 2px rgba(0, 0, 0, 0.08)',
                    zIndex: 9,
                }}
            >
                <CustomImageContainer
                    src={details.cover_photo_full_url}
                    height={scrollPosition === 0 ? '250px' : '180px'}
                    smHeight={scrollPosition === 0 ? '205px' : '140px'}
                    objectFit="cover"
                />
                <CustomStackFullWidth
                    sx={{
                        position: 'absolute',
                        background: isSmall
                            ? (theme) => alpha(theme.palette.neutral[100], 0.9)
                            : (theme) => alpha(theme.palette.neutral[100], 0.9),
                        height: '100%',
                    }}
                >
                    {scrollPosition === 0 && handleTop()}
                    {scrollPosition === 0 ? handleBottom() : handleTop()}
                </CustomStackFullWidth>
            </CustomStackFullWidth>
            <CustomModal
                openModal={openShareModal}
                setModalOpen={setOpenShareModal}
                maxWidth="550px"
            >
                <CustomStackFullWidth
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{ position: 'relative' }}
                >
                    <IconButton
                        onClick={() => setOpenShareModal(false)}
                        sx={{
                            zIndex: '99',
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            backgroundColor: (theme) =>
                                theme.palette.neutral[100],
                            borderRadius: '50%',
                            [theme.breakpoints.down('md')]: {
                                top: 10,
                                right: 5,
                            },
                        }}
                    >
                        <CloseIcon
                            sx={{ fontSize: '24px', fontWeight: '500' }}
                        />
                    </IconButton>
                </CustomStackFullWidth>
                <CustomStackFullWidth padding="20px">
                    <Typography
                        fontWeight={600}
                        fontSize="20px"
                        color={theme.palette.neutral[1000]}
                    >
                        {t('Share')}
                    </Typography>
                    <Stack padding="10px" flexDirection="row" gap="10px">
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={currentRoute}
                            fontWeight={400}
                            InputProps={{
                                style: {
                                    height: '40px !important', // Adjust the height as needed
                                    fontSize: '12px',
                                },
                                readOnly: true,
                            }}
                        />
                        <Button
                            sx={{ minWidth: '45px', padding: '8px 10px' }}
                            variant="contained"
                            onClick={() => handleCopy(currentRoute)}
                        >
                            <ContentCopyIcon />
                        </Button>
                    </Stack>
                    <Stack marginTop=".5rem">
                        <SliderCustom nopadding="true">
                            <Slider {...shareSettings}>
                                <FacebookMessengerShareButton
                                    url={currentRoute}
                                    appId={FACEBOOK_APP_ID}
                                >
                                    <FacebookMessengerIcon
                                        size={size ? size : 40}
                                        round
                                    />
                                </FacebookMessengerShareButton>
                                <TwitterShareButton url={currentRoute}>
                                    <TwitterIcon
                                        size={size ? size : 40}
                                        round
                                    />
                                </TwitterShareButton>
                                <WhatsappShareButton
                                    url={currentRoute}
                                    separator=":: "
                                >
                                    <WhatsappIcon
                                        size={size ? size : 40}
                                        round
                                    />
                                </WhatsappShareButton>
                                <LinkedinShareButton
                                    url={currentRoute}
                                    source={currentRoute}
                                >
                                    <LinkedinIcon
                                        size={size ? size : 40}
                                        round
                                    />
                                </LinkedinShareButton>
                                <TelegramShareButton url={currentRoute}>
                                    <TelegramIcon
                                        size={size ? size : 40}
                                        round
                                    />
                                </TelegramShareButton>
                                <EmailShareButton url={currentRoute}>
                                    <EmailIcon size={size ? size : 40} round />
                                </EmailShareButton>
                                <RedditShareButton
                                    url={currentRoute}
                                    windowWidth={660}
                                    windowHeight={460}
                                >
                                    <RedditIcon size={size ? size : 40} round />
                                </RedditShareButton>
                                <TumblrShareButton
                                    url={String(window.location.origin)}
                                >
                                    <TumblrIcon size={size ? size : 40} round />
                                </TumblrShareButton>
                                <LivejournalShareButton url={currentRoute}>
                                    <LivejournalIcon
                                        size={size ? size : 40}
                                        round
                                    />
                                </LivejournalShareButton>
                                <LineShareButton url={currentRoute}>
                                    <LineIcon size={size ? size : 40} round />
                                </LineShareButton>
                            </Slider>
                        </SliderCustom>
                    </Stack>
                </CustomStackFullWidth>
            </CustomModal>
            <CustomModal
                openModal={openModal}
                setModalOpen={setOpenModal}
                maxWidth="670px"
            >
                <CustomStackFullWidth
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{ position: 'relative' }}
                >
                    <IconButton
                        onClick={() => setOpenModal(false)}
                        sx={{
                            zIndex: '99',
                            position: 'absolute',
                            top: '-4%',
                            right: '-5%',
                            backgroundColor: (theme) =>
                                theme.palette.neutral[100],
                            borderRadius: '50%',
                            '&:hover': {
                                backgroundColor: (theme) =>
                                    theme.palette.neutral[200],
                            },
                            [theme.breakpoints.down('md')]: {
                                top: '2%',
                                right: '0%',
                            },
                        }}
                    >
                        <CloseIcon
                            sx={{ fontSize: '16px', fontWeight: '500' }}
                        />
                    </IconButton>
                </CustomStackFullWidth>
                <RestaurantMapView
                    details={details}
                    restaurantCoverUrl={restaurantCoverUrl}
                />
            </CustomModal>
            <CustomModal
                openModal={openReviewModal}
                setModalOpen={setOpenReviewModal}
                maxWidth="670px"
            >
                <CustomStackFullWidth
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{ position: 'relative', padding: '1rem' }}
                >
                    <IconButton
                        onClick={() => setOpenReviewModal(false)}
                        sx={{
                            zIndex: '99',
                            position: 'absolute',
                            top: '-4%',
                            right: '-5%',
                            backgroundColor: (theme) =>
                                theme.palette.neutral[100],
                            borderRadius: '50%',
                            '&:hover': {
                                backgroundColor: (theme) =>
                                    theme.palette.neutral[200],
                            },
                            [theme.breakpoints.down('md')]: {
                                top: '1%',
                                right: '0%',
                            },
                        }}
                    >
                        <CloseIcon
                            sx={{ fontSize: '16px', fontWeight: '500' }}
                        />
                    </IconButton>
                    <RestaurantReviewModal
                        product_avg_rating={details?.avg_rating}
                        reviews_comments_count={details?.reviews_comments_count}
                        rating_count={details?.rating_count}
                        id={details?.id}
                        restaurantDetails={details}
                    />
                </CustomStackFullWidth>
            </CustomModal>
        </CustomStackFullWidth>
    )
}

export default RestaurantLeftDetails
