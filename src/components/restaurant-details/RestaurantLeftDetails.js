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
import CampaignIcon from '@mui/icons-material/Campaign'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DirectionsOutlinedIcon from '@mui/icons-material/DirectionsOutlined'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import StarIcon from '@mui/icons-material/Star'
import {
    Box,
    Button,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import moment from 'moment'
import { useRouter } from 'next/router'
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
import Slider from '@/components/slider/SlickToSwiper'
import CustomImageContainer from '../CustomImageContainer'
import { RTL } from '../RTL/RTL'
import CustomModal from '../custom-modal/CustomModal'
import ClosedNowOverlay from './HeadingBannerSection/ClosedNowOverlay'
import VerifiedBadge from '@/components/verified-badge/VerifiedBadge'
import {
    BannerWrapper,
    FloatingIconButton,
    HeroCard,
    LogoBox,
    StatPill,
} from './restaurant-details.style'
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
        threshold,
        // IntersectionObserver ref from RestaurantDetails — drives the
        // mobile condensed header's show-on-scroll behavior.
        nameRef,
    } = props
    const dispatch = useDispatch()
    const router = useRouter()
    const { wishLists } = useSelector((state) => state.wishList)
    const { token } = useSelector((state) => state.userToken)
    const theme = useTheme()
    const currentRoute =
        typeof window !== 'undefined' ? window.location.href : ''
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const [openModal, setOpenModal] = useState(false)
    const [openShareModal, setOpenShareModal] = useState(false)
    const [openReviewModal, setOpenReviewModal] = useState(false)
    const [openAnnouncementModal, setOpenAnnouncementModal] = useState(false)
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
            onError: (error) => { },
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
                    return <ClosedNowOverlay t={t} borderRadius="12px" />
                }
            } else {
                return <ClosedNowOverlay t={t} borderRadius="12px" />
            }
        } else {
            return <ClosedNowOverlay t={t} borderRadius="12px" />
        }
    }

    const breadCrumbItems = [
        {
            key: 'home',
            label: t('Home'),
            icon: <HomeOutlinedIcon style={{ fontSize: '14px' }} />,
            onRedirect: '/home',
        },
        {
            key: 'restaurants',
            label: t('Restaurants'),
            onRedirect: '/restaurants',
        },
        {
            key: 'restaurant',
            label: name || '',
        },
    ]

    const hasRatingOrReview =
        Number(avg_rating) > 0 || Number(details?.reviews_comments_count) > 0

    return (
        <RTL direction={languageDirection}>
            <CustomStackFullWidth>
                <HeroCard>
                    <Grid container alignItems="stretch">
                        <Grid
                            item
                            xs={12}
                            md={7}
                            sx={{
                                p: { xs: 2, sm: 2.5 },
                                order: { xs: 2, md: 1 },
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {/* Breadcrumb */}
                            <Stack
                                direction="row"
                                alignItems="center"
                                sx={{
                                    mb: 1.75,
                                    gap: '4px',
                                    flexWrap: 'nowrap',
                                    overflow: 'hidden',
                                }}
                            >
                                {breadCrumbItems.map((item, index) => {
                                    const isLast =
                                        index === breadCrumbItems.length - 1
                                    return (
                                        <Stack
                                            key={item.key}
                                            direction="row"
                                            alignItems="center"
                                            sx={{ gap: '4px', minWidth: 0 }}
                                        >
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                onClick={
                                                    item.onRedirect
                                                        ? () =>
                                                              router.push(
                                                                  item.onRedirect
                                                              )
                                                        : undefined
                                                }
                                                sx={{
                                                    gap: '4px',
                                                    minWidth: 0,
                                                    fontSize: {
                                                        xs: '12px',
                                                        md: '14px',
                                                    },
                                                    fontWeight: 500,
                                                    lineHeight: 1.1,
                                                    letterSpacing: '-0.48px',
                                                    color:
                                                        theme.palette
                                                            .neutral?.[400] ||
                                                        '#9CA3AF',
                                                    whiteSpace: 'nowrap',
                                                    cursor: item.onRedirect
                                                        ? 'pointer'
                                                        : 'default',
                                                    ...(isLast && {
                                                        overflow: 'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        maxWidth: '200px',
                                                    }),
                                                    ...(!isLast && {
                                                        textDecoration:
                                                            'underline',
                                                        textUnderlineOffset:
                                                            '3px',
                                                        '&:hover': {
                                                            color: theme.palette
                                                                .primary.main,
                                                        },
                                                    }),
                                                }}
                                            >
                                                {item.icon}
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                    }}
                                                >
                                                    {item.label}
                                                </Box>
                                            </Stack>
                                            {!isLast && (
                                                <ChevronRightIcon
                                                    sx={{
                                                        fontSize: '14px',
                                                        color:
                                                            theme.palette
                                                                .neutral?.[400] ||
                                                            '#9CA3AF',
                                                        flexShrink: 0,
                                                    }}
                                                />
                                            )}
                                        </Stack>
                                    )
                                })}
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                sx={{ height: 'auto' }}
                            >
                                <LogoBox>
                                    <CustomImageContainer
                                        src={logo_full_url}
                                        width="100%"
                                        height="100%"
                                        objectFit="cover"
                                        borderRadius="12px"
                                        aspectRatio="1"
                                    />
                                    {closedNowHandler()}
                                </LogoBox>

                                <Stack flex={1} spacing={0.5} sx={{ minWidth: 0 }}>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.75}
                                        sx={{ minWidth: 0 }}
                                    >
                                        <Typography
                                            ref={nameRef}
                                            sx={{
                                                fontSize: {
                                                    xs: '18px',
                                                    sm: '22px',
                                                },
                                                fontWeight: 700,
                                                color: theme.palette
                                                    .neutral[1000],
                                                lineHeight: 1.2,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {name}
                                        </Typography>
                                        <VerifiedBadge
                                            verified={details?.verified_seller}
                                            sx={{ mb: '1px' }}
                                        />
                                    </Stack>

                                    {address && (
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={0.5}
                                            onClick={() => setOpenModal(true)}
                                            sx={{
                                                minWidth: 0,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    color: theme.palette
                                                        .primary.main,
                                                },
                                            }}
                                        >
                                            <LocationOnOutlinedIcon
                                                sx={{
                                                    fontSize: '16px',
                                                    color: theme.palette
                                                        .neutral[500],
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontSize: '13px',
                                                    color: theme.palette
                                                        .neutral[600],
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {address}
                                            </Typography>
                                        </Stack>
                                    )}
                                </Stack>
                            </Stack>

                            {/* Stat pills — rating / delivery time / minimum order */}
                            <Stack
                                direction="row"
                                alignItems="stretch"
                                justifyContent="flex-end"
                                spacing={1}
                                sx={{ mt: 'auto', pt: 1 }}
                            >
                                {hasRatingOrReview && (
                                    <StatPill
                                        onClick={() =>
                                            setOpenReviewModal(true)
                                        }
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={0.5}
                                        >
                                            <StarIcon
                                                sx={{
                                                    fontSize: {
                                                        xs: '14px',
                                                        md: '16px',
                                                    },
                                                    color:
                                                        theme.palette.warning
                                                            ?.main || '#F5A623',
                                                }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontSize: {
                                                        xs: '14px',
                                                        md: '18px',
                                                    },
                                                    fontWeight: 600,
                                                    color: theme.palette
                                                        .neutral[1000],
                                                    lineHeight: 1.15,
                                                }}
                                            >
                                                {Number(
                                                    avg_rating || 0
                                                ).toFixed(1)}
                                            </Typography>
                                        </Stack>
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    xs: '10px',
                                                    md: '11.5px',
                                                },
                                                color: theme.palette
                                                    .neutral[500],
                                                textAlign: 'center',
                                            }}
                                        >
                                            {details?.reviews_comments_count}{' '}
                                            {t('Reviews')}
                                        </Typography>
                                    </StatPill>
                                )}

                                {delivery_time && (
                                    <StatPill>
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    xs: '14px',
                                                    md: '18px',
                                                },
                                                fontWeight: 600,
                                                color: theme.palette
                                                    .neutral[1000],
                                                lineHeight: 1.15,
                                                textAlign: 'center',
                                            }}
                                        >
                                            {delivery_time}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    xs: '10px',
                                                    md: '11.5px',
                                                },
                                                color: theme.palette
                                                    .neutral[500],
                                                textAlign: 'center',
                                            }}
                                        >
                                            {t('Est. Delivery Time')}
                                        </Typography>
                                    </StatPill>
                                )}

                                {minimum_order !== 0 &&
                                    minimum_order != null && (
                                        <StatPill>
                                            <Typography
                                                sx={{
                                                    fontSize: {
                                                        xs: '14px',
                                                        md: '18px',
                                                    },
                                                    fontWeight: 600,
                                                    color: theme.palette
                                                        .neutral[1000],
                                                    lineHeight: 1.15,
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {getAmount(
                                                    minimum_order,
                                                    currencySymbolDirection,
                                                    currencySymbol,
                                                    digitAfterDecimalPoint
                                                )}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: {
                                                        xs: '10px',
                                                        md: '11.5px',
                                                    },
                                                    color: theme.palette
                                                        .neutral[500],
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {t('Minimum Order')}
                                            </Typography>
                                        </StatPill>
                                    )}
                            </Stack>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            md={5}
                            sx={{
                                display: 'flex',
                                order: { xs: 1, md: 2 },
                                '& > *': { width: '100%' },
                            }}
                        >
                            <BannerWrapper
                                sx={{ height: 210, minHeight: 210 }}
                            >
                                <CustomImageContainer
                                    src={details?.cover_photo_full_url}
                                    width="100%"
                                    height="100%"
                                    objectFit="cover"
                                />
                                {/* Mobile-only back arrow */}
                                <Box
                                    sx={{
                                        display: {
                                            xs: 'block',
                                            md: 'none',
                                        },
                                        position: 'absolute',
                                        top: 10,
                                        left: 10,
                                        zIndex: 2,
                                    }}
                                >
                                    <FloatingIconButton
                                        onClick={() => router.back()}
                                    >
                                        <ChevronLeftIcon
                                            sx={{
                                                fontSize: '20px',
                                                color: theme.palette
                                                    .neutral[1000],
                                            }}
                                        />
                                    </FloatingIconButton>
                                </Box>
                                {/* Floating action buttons over banner */}
                                <Stack
                                    direction="row"
                                    sx={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        zIndex: 2,
                                        flexDirection: {
                                            xs: 'row-reverse',
                                            md: 'row',
                                        },
                                        gap: 1.25,
                                    }}
                                >
                                    <Tooltip title={t('Share')} arrow>
                                        <FloatingIconButton
                                            onClick={() =>
                                                setOpenShareModal(true)
                                            }
                                        >
                                            <ShareOutlinedIcon
                                                sx={{
                                                    fontSize: '20px',
                                                    color: theme.palette
                                                        .neutral[1000],
                                                }}
                                            />
                                        </FloatingIconButton>
                                    </Tooltip>
                                    <Tooltip title={t('Location')} arrow>
                                        <FloatingIconButton
                                            onClick={() => setOpenModal(true)}
                                        >
                                            <DirectionsOutlinedIcon
                                                sx={{
                                                    fontSize: '20px',
                                                    color: theme.palette
                                                        .neutral[1000],
                                                }}
                                            />
                                        </FloatingIconButton>
                                    </Tooltip>
                                    {!isInList(id) ? (
                                        <Tooltip
                                            title={t('Add to wishlist')}
                                            arrow
                                        >
                                            <FloatingIconButton
                                                onClick={(e) =>
                                                    addToFavorite(e)
                                                }
                                            >
                                                <FavoriteBorderIcon
                                                    sx={{
                                                        fontSize: '20px',
                                                        color: theme.palette
                                                            .neutral[1000],
                                                    }}
                                                />
                                            </FloatingIconButton>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip
                                            title={t('Remove from wishlist')}
                                            arrow
                                        >
                                            <FloatingIconButton
                                                onClick={(e) =>
                                                    deleteWishlistRes(id, e)
                                                }
                                            >
                                                <FavoriteIcon
                                                    sx={{
                                                        fontSize: '20px',
                                                        color: theme.palette
                                                            .primary.main,
                                                    }}
                                                />
                                            </FloatingIconButton>
                                        </Tooltip>
                                    )}
                                </Stack>

                                {/* Announcement button — only when restaurant has one */}
                                {details?.announcement === 1 &&
                                    details?.announcement_message && (
                                        <Box
                                            onClick={() =>
                                                setOpenAnnouncementModal(true)
                                            }
                                            sx={{
                                                position: 'absolute',
                                                bottom: 10,
                                                right: 10,
                                                zIndex: 3,
                                                display: 'flex',
                                                // icon stays right, text expands left
                                                flexDirection: 'row-reverse',
                                                alignItems: 'center',
                                                height: 36,
                                                borderRadius: '999px',
                                                backgroundColor: '#E8B931',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                boxShadow:
                                                    '0 2px 8px rgba(0,0,0,0.20)',
                                                '&:hover': {
                                                    '& .announcement-label': {
                                                        maxWidth: '140px',
                                                        pl: '12px',
                                                    },
                                                    '& .announcement-icon svg':
                                                        {
                                                            animationDuration:
                                                                '0.6s',
                                                        },
                                                },
                                            }}
                                        >
                                            <Box
                                                className="announcement-icon"
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <CampaignIcon
                                                    sx={{
                                                        fontSize: 18,
                                                        color: '#000',
                                                        // left-right flip loop (default facing left)
                                                        '@keyframes adSpin': {
                                                            '0%': {
                                                                transform:
                                                                    'scaleX(-1)',
                                                            },
                                                            '50%': {
                                                                transform:
                                                                    'scaleX(1)',
                                                            },
                                                            '100%': {
                                                                transform:
                                                                    'scaleX(-1)',
                                                            },
                                                        },
                                                        animation:
                                                            'adSpin 3s linear infinite',
                                                    }}
                                                />
                                            </Box>
                                            <Box
                                                className="announcement-label"
                                                sx={{
                                                    maxWidth: 0,
                                                    overflow: 'hidden',
                                                    pl: 0,
                                                    transition:
                                                        'max-width 0.35s cubic-bezier(0.4,0,0.2,1), padding-left 0.35s cubic-bezier(0.4,0,0.2,1)',
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontSize: '13px',
                                                        fontWeight: 700,
                                                        color: '#1F2937',
                                                        whiteSpace: 'nowrap',
                                                        lineHeight: 1,
                                                        pr: '5px',
                                                    }}
                                                >
                                                    {t('Announcement')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                            </BannerWrapper>
                        </Grid>
                    </Grid>
                </HeroCard>
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
                            transition: 'all 0.3s ease-in-out',
                            [theme.breakpoints.down('md')]: {
                                top: 10,
                                right: 5,
                            },
                            '&:hover': {
                                backgroundColor: (theme) =>
                                    theme.palette.primary.main,
                                '& .MuiSvgIcon-root': {
                                    color: 'white',
                                },
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
                    <Stack
                        flexDirection="row"
                        alignItems="stretch"
                        gap="10px"
                        marginTop="14px"
                    >
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={currentRoute}
                            InputProps={{
                                readOnly: true,
                                sx: {
                                    height: '44px',
                                    fontSize: '13px',
                                    borderRadius: '8px',
                                    '& .MuiOutlinedInput-input': {
                                        textOverflow: 'ellipsis',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: theme.palette.divider,
                                    },
                                },
                            }}
                        />
                        <Button
                            sx={{
                                minWidth: '44px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                boxShadow: 'none',
                                flexShrink: 0,
                            }}
                            variant="contained"
                            onClick={() => handleCopy(currentRoute)}
                        >
                            <ContentCopyIcon sx={{ fontSize: '20px' }} />
                        </Button>
                    </Stack>
                    <Stack marginTop="16px" paddingX="6px">
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
                            // Inside the modal's top-right corner, floating
                            // over the cover image (negative offsets pushed
                            // it outside the card).
                            top: '10px',
                            right: '10px',
                            backgroundColor: (theme) =>
                                theme.palette.neutral[100],
                            borderRadius: '50%',
                            transition: 'all 0.3s ease-in-out',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                            '&:hover': {
                                backgroundColor: (theme) =>
                                    theme.palette.primary.main,
                                '& .MuiSvgIcon-root': {
                                    color: 'white',
                                },
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
            <RestaurantReviewModal
                open={openReviewModal}
                onClose={() => setOpenReviewModal(false)}
                product_avg_rating={details?.avg_rating}
                reviews_comments_count={details?.reviews_comments_count}
                rating_count={details?.rating_count}
                id={details?.id}
                restaurantDetails={details}
            />
            <CustomModal
                openModal={openAnnouncementModal}
                setModalOpen={setOpenAnnouncementModal}
                maxWidth="500px"
            >
                <Stack
                    spacing={1.5}
                    sx={{
                        pt: 0.5,
                        px: { xs: 2, md: 3 },
                        pb: { xs: 4, md: 4 },
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.25}
                        sx={{ pt: 2 }}
                    >
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                backgroundColor: '#E8B931',
                                flexShrink: 0,
                            }}
                        >
                            <CampaignIcon
                                sx={{ fontSize: 18, color: '#000' }}
                            />
                        </Stack>
                        <Typography
                            fontSize="16px"
                            fontWeight={700}
                            color={theme.palette.neutral[1000]}
                        >
                            {t('Announcement')}
                        </Typography>
                    </Stack>
                    <Typography
                        fontSize="14px"
                        color={theme.palette.text.secondary}
                        sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}
                    >
                        {details?.announcement_message}
                    </Typography>
                </Stack>
            </CustomModal>
        </RTL>
    )
}

export default RestaurantLeftDetails
