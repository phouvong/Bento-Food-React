import { useEffect, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
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
import { handleRestaurantRedirect } from '@/utils/customFunctions'
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

    const { data: popularRestaurant, refetch: restaurantApiRefetch } = useQuery(
        ['restaurants/populars'],
        () => RestaurantsApi?.popularRestaurants(),
        {
            enabled: false,
            staleTime: 1000 * 60 * 8,
            onError: onErrorResponse,
            cacheTime: 8 * 60 * 1000,
        }
    )
    useEffect(() => {
        if (popularRestaurants?.length === 0) {
            restaurantApiRefetch()
        }
    }, [])
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
    console.log({ popularRestaurant })
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
                >
                    <Grid container spacing={1} p="18px 10px" width="780px">
                        {popularRestaurants && (
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
                                                                borderRadius:
                                                                    '5px',
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
                                                                                0.3
                                                                            ),
                                                                },
                                                            }}
                                                        >
                                                            <Stack
                                                                spacing={
                                                                    2
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
                                                                    fontSize="13px"
                                                                    variant="h5"
                                                                    fontWeight="600"
                                                                    color={(
                                                                        theme
                                                                    ) =>
                                                                        theme
                                                                            .palette
                                                                            .neutral[1000]
                                                                    }
                                                                >
                                                                    {
                                                                        restaurant.name
                                                                    }
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
                                                                borderRadius:
                                                                    '5px',
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
                                                                                0.3
                                                                            ),
                                                                },
                                                            }}
                                                        >
                                                            <Stack
                                                                spacing={
                                                                    2.5
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
                                                                    fontSize="13px"
                                                                    variant="h5"
                                                                    fontWeight="600"
                                                                    color={(
                                                                        theme
                                                                    ) =>
                                                                        theme
                                                                            .palette
                                                                            .neutral[1000]
                                                                    }
                                                                >
                                                                    {
                                                                        restaurant.name
                                                                    }
                                                                </Typography>
                                                            </Stack>
                                                        </MenuItem>
                                                    </Grid>
                                                )}
                                            </>
                                        )
                                    })}
                                {popularRestaurants?.length === 0 && (
                                    <CustomEmptyResult
                                        height="100px"
                                        image={noRestaurantsImage}
                                        label="No restaurant found"
                                    />
                                )}
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
                            {popularRestaurants?.length !== 0 && (
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
                </Popover>
            </RTL>
        </div >
    )
}

export default NavResturant
