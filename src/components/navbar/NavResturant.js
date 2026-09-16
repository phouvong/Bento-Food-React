import { useEffect, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import {
    alpha,
    Button,
    Grid,
    MenuItem,
    Popover,
    Stack,
    Typography,
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import ResOffer from '../../../public/static/Menu/resturant.png'
import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { setPopularRestaurants } from '@/redux/slices/storedData'
import { noRestaurantsImage } from '@/utils/LocalImages'
import CustomImageContainer from '../CustomImageContainer'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import { onErrorResponse } from '../ErrorResponse'
import { RTL } from '../RTL/RTL'
import { NavMenuLink } from './Navbar.style'
import ResShimmer from './ResShimmer'
import { handleRestaurantRedirect } from '@/utils/customFunctions'
import VerifiedBadge from '@/components/verified-badge/VerifiedBadge'
const useStyles = makeStyles((theme) => ({
    popover: {
        pointerEvents: 'none',
    },
    paper: {
        pointerEvents: 'auto',
    },
}))

const NavResturant = ({ zoneid }) => {
    const { t } = useTranslation()
    const classes = useStyles()
    const dispatch = useDispatch()
    const { popularRestaurants } = useSelector((state) => state.storedData)
    const [resdropdown, setResdropdown] = useState(null)
    const openresdrop = Boolean(resdropdown)

    const {
        data: popularRestaurant,
        refetch: restaurantApiRefetch,
        isLoading: restaurantLoading,
        isFetching: restaurantFetching,
    } = useQuery(
        ['restaurants/populars'],
        () => RestaurantsApi?.popularRestaurants(),
        {
            enabled: false,
            staleTime: 1000 * 60 * 8,
            onError: onErrorResponse,
            cacheTime: 8 * 60 * 1000,
        }
    )
    const showRestaurantLoading =
        (restaurantLoading || restaurantFetching) &&
        !popularRestaurants?.length
    useEffect(() => {
        // Deferred to the dropdown actually opening — this list is menu
        // content only, and eagerly fetching it on every page load spends a
        // connection slot the page's own data needs.
        if (openresdrop && popularRestaurants?.length === 0) {
            restaurantApiRefetch()
        }
    }, [openresdrop])
    useEffect(() => {
        if (popularRestaurant) {
            dispatch(setPopularRestaurants(popularRestaurant?.data))
        }
    }, [popularRestaurant])

    const handleresdropClick = (event) => {
        setResdropdown(event.currentTarget)
    }
    const handleResdropClose = () => {
        setResdropdown(null)
    }
    const router = useRouter()
    const viewAll = () => {
        router.push(
            {
                pathname: '/restaurants',
            },
            undefined,
            { shallow: true }
        )
    }
    const languageDirection = typeof window !== 'undefined' ? localStorage.getItem('direction') : 'ltr'
    return (
        <div
            onMouseEnter={(e) => handleresdropClick(e)}
            onMouseLeave={handleResdropClose}
        >
            <NavMenuLink
                id="fade-button"
                aria-controls={openresdrop ? 'fade-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openresdrop ? 'true' : undefined}
                underline="none"
            >
                {t('Restaurants')}
                <KeyboardArrowDownIcon
                    style={{ width: '14px', height: '14px' }}
                />
            </NavMenuLink>
            <RTL direction={languageDirection}>
                <Popover
                    disableScrollLock={true}
                    id="mouse-over-popover"
                    open={openresdrop}
                    anchorEl={resdropdown}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal:
                            languageDirection === 'rtl' ? 'right' : 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal:
                            languageDirection === 'rtl' ? 'right' : 'left',
                    }}
                    className={classes.popover}
                    classes={{
                        paper: classes.paper,
                    }}
                    PaperProps={{
                        sx: {
                            borderRadius: '16px',
                            boxShadow:
                                '0px 12px 32px -4px rgba(0, 0, 0, 0.12)',
                        },
                    }}
                >
                    <Stack width="780px">
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ px: '24px', pt: '20px', pb: '4px' }}
                        >
                            <Typography
                                fontSize="18px"
                                fontWeight={700}
                                sx={{
                                    color: (theme) =>
                                        theme.palette.neutral[1000],
                                }}
                            >
                                {t('Restaurants')}
                            </Typography>
                            {!showRestaurantLoading && popularRestaurants?.length > 0 && (
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    gap="2px"
                                    onClick={viewAll}
                                    sx={{
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                    }}
                                >
                                    <Typography
                                        fontSize="14px"
                                        fontWeight={600}
                                        sx={{
                                            color: (theme) =>
                                                theme.palette.primary.main,
                                        }}
                                    >
                                        {t('View All')}
                                    </Typography>
                                    <ChevronRightIcon
                                        sx={{
                                            fontSize: '18px',
                                            color: (theme) =>
                                                theme.palette.primary.main,
                                        }}
                                    />
                                </Stack>
                            )}
                        </Stack>
                        <Grid container spacing={1} p="24px" pt="12px">
                        {showRestaurantLoading ? (
                            <Grid item container md={8} spacing={0.5}>
                                <ResShimmer shimmerfor="restaurant" mdSize={6} />
                                <ResShimmer shimmerfor="restaurant" mdSize={6} />
                            </Grid>
                        ) : popularRestaurants?.length === 0 ? (
                            <Grid
                                item
                                container
                                md={8}
                                alignItems="center"
                                justifyContent="center"
                            >
                                <CustomEmptyResult
                                    height="100px"
                                    image={noRestaurantsImage}
                                    label="No restaurant found"
                                />
                            </Grid>
                        ) : (
                            <Grid item container md={8} spacing={0.5}>
                                {popularRestaurants
                                    ?.slice(0, 8)
                                    ?.map((restaurant, index) => {
                                        const restaurantIdOrSlug =
                                            restaurant?.slug
                                                ? restaurant?.slug
                                                : restaurant?.id
                                        return (
                                            <>
                                                {index % 2 === 0 ? (
                                                    <Grid
                                                        item
                                                        md={6}
                                                        key={restaurant.id}
                                                    >
                                                        <MenuItem
                                                            onClick={
                                                                (e) => {
                                                                    handleResdropClose()
                                                                    handleRestaurantRedirect(
                                                                        router,
                                                                        restaurant?.slug,
                                                                        restaurant?.id,

                                                                    )
                                                                }
                                                            }
                                                            sx={{
                                                                alignItems:
                                                                    'center',
                                                                gap: '12px',
                                                                padding:
                                                                    '8px',
                                                                borderRadius:
                                                                    '8px',
                                                                '&:hover': {
                                                                    backgroundColor:
                                                                        (
                                                                            theme
                                                                        ) =>
                                                                            alpha(
                                                                                theme
                                                                                    .palette
                                                                                    .primary
                                                                                    .main,
                                                                                0.08
                                                                            ),
                                                                },
                                                            }}
                                                        >
                                                            <Stack
                                                                spacing={
                                                                    1.5
                                                                }
                                                                direction="row"
                                                                alignItems="center"
                                                            >
                                                                <CustomImageContainer
                                                                    src={
                                                                        restaurant.logo_full_url
                                                                    }
                                                                    width="40px"
                                                                    height="40px"
                                                                    borderRadius="50%"
                                                                    loading="lazy"
                                                                    objectFit="cover"
                                                                />
                                                                <Typography
                                                                    fontSize="14px"
                                                                    variant="h5"
                                                                    fontWeight="600"
                                                                    color={(
                                                                        theme
                                                                    ) =>
                                                                        theme
                                                                            .palette
                                                                            .neutral[1000]
                                                                    }
                                                                    sx={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                    }}
                                                                >
                                                                    {
                                                                        restaurant.name
                                                                    }
                                                                    <VerifiedBadge
                                                                        verified={restaurant?.verified_seller}
                                                                        size={14}
                                                                    />
                                                                </Typography>
                                                            </Stack>
                                                        </MenuItem>
                                                    </Grid >
                                                ) : (
                                                    <Grid
                                                        item
                                                        md={6}
                                                        key={restaurant.id}
                                                    >
                                                        <MenuItem
                                                            onClick={
                                                                (e) => {
                                                                    handleResdropClose()
                                                                    handleRestaurantRedirect(
                                                                        router,
                                                                        restaurant?.slug,
                                                                        restaurant?.id,
                                                                    )
                                                                }
                                                            }
                                                            sx={{
                                                                alignItems:
                                                                    'center',
                                                                gap: '12px',
                                                                padding:
                                                                    '8px',
                                                                borderRadius:
                                                                    '8px',
                                                                '&:hover': {
                                                                    backgroundColor:
                                                                        (
                                                                            theme
                                                                        ) =>
                                                                            alpha(
                                                                                theme
                                                                                    .palette
                                                                                    .primary
                                                                                    .main,
                                                                                0.08
                                                                            ),
                                                                },
                                                            }}
                                                        >
                                                            <Stack
                                                                spacing={
                                                                    1.5
                                                                }
                                                                direction="row"
                                                                alignItems="center"
                                                            >
                                                                <CustomImageContainer
                                                                    src={
                                                                        restaurant.logo_full_url
                                                                    }
                                                                    width="40px"
                                                                    height="40px"
                                                                    borderRadius="50%"
                                                                    loading="lazy"
                                                                    objectFit="cover"
                                                                />
                                                                <Typography
                                                                    fontSize="14px"
                                                                    variant="h5"
                                                                    fontWeight="600"
                                                                    color={(
                                                                        theme
                                                                    ) =>
                                                                        theme
                                                                            .palette
                                                                            .neutral[1000]
                                                                    }
                                                                    sx={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                    }}
                                                                >
                                                                    {
                                                                        restaurant.name
                                                                    }
                                                                    <VerifiedBadge
                                                                        verified={restaurant?.verified_seller}
                                                                        size={14}
                                                                    />
                                                                </Typography>
                                                            </Stack>
                                                        </MenuItem>
                                                    </Grid>
                                                )}
                                            </>
                                        )
                                    })}
                            </Grid>
                        )}

                        <Grid
                            item
                            md={4}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                                paddingLeft: '16px',
                                paddingRight: '16px',
                            }}
                        >
                            {!showRestaurantLoading && popularRestaurants?.length !== 0 && (
                                <Button
                                    sx={{
                                        zIndex: 1,
                                        position: 'absolute',
                                        bottom: '15%',
                                        background: (theme) =>
                                            theme.palette.primary.main,
                                        color: (theme) =>
                                            `${theme.palette.neutral[100]} !important`,
                                        //right: '11%',
                                        padding: '9px 25px',
                                        borderRadius: '5px',
                                        '&:hover': {
                                            background: (theme) =>
                                                theme.palette.primary.dark,
                                        },
                                    }}
                                    size="medium"
                                    onClick={viewAll}
                                >
                                    {t('View all')}
                                </Button>
                            )}

                            <CustomImageContainer
                                src={ResOffer?.src}
                                alt="restaurant-image"
                                borderRadius=".6rem"
                                height="220px"
                                width="220px"
                            />
                        </Grid>
                    </Grid>
                    </Stack>
                </Popover>
            </RTL>
        </div >
    )
}

export default NavResturant
