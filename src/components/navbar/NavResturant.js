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
import Router from 'next/router'
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
        ['restaurants/popular'],
        () => RestaurantsApi?.popularRestaurants(),
        {
            enabled: false,
            staleTime: 1000 * 60 * 8,
            onError: onErrorResponse,
            cacheTime: 8 * 60 * 1000,
        }
    )
    useEffect(() => {
        if (zoneid) {
            if (popularRestaurants?.length === 0) {
                restaurantApiRefetch()
            }
        }
    }, [zoneid])
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
    const viewAll = () => {
        Router.push(
            {
                pathname: '/restaurant',
            },
            undefined,
            { shallow: true }
        )
    }
    const languageDirection = localStorage.getItem('direction')

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
                fontSize="14px"
                alignItems="center"
            >
                {t('Restaurants')}{' '}
                <KeyboardArrowDownIcon
                    style={{ width: '16px', marginLeft: '5px' }}
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
                    <Grid container spacing={3} p="1rem" width="750px">
                        {popularRestaurants && (
                            <Grid item container md={8} spacing={1}>
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
                                                        <Link
                                                            href={{
                                                                pathname:
                                                                    '/restaurant/[id]',
                                                                query: {
                                                                    id: `${restaurantIdOrSlug}`,
                                                                    restaurant_zone_id:
                                                                        restaurant?.zone_id,
                                                                },
                                                            }}
                                                            passHref
                                                            style={{textDecoration: 'none'}}
                                                        >
                                                            <MenuItem
                                                                onClick={
                                                                    handleResdropClose
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
                                                                        borderRadius=".4rem"
                                                                        loading="lazy"
                                                                        objectFit="cover"
                                                                    />
                                                                    <Typography
                                                                        variant="h5"
                                                                        fontWeight="400"
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
                                                        </Link>
                                                    </Grid>
                                                ) : (
                                                    <Grid
                                                        item
                                                        md={6}
                                                        key={restaurant.id}
                                                    >
                                                        <Link
                                                            href={`/restaurant/${restaurantIdOrSlug}`}
                                                            passHref
                                                            style={{textDecoration: 'none'}}
                                                        >
                                                            <MenuItem
                                                                onClick={
                                                                    handleResdropClose
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
                                                                        borderRadius=".4rem"
                                                                        loading="lazy"
                                                                        objectFit="cover"
                                                                    />
                                                                    <Typography
                                                                        variant="h5"
                                                                        fontWeight="400"
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
                                                        </Link>
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

                        <Grid item md={4}>
                            {popularRestaurants?.length !== 0 && (
                                <Button
                                    sx={{
                                        zIndex: 1,
                                        position: 'absolute',
                                        bottom: '20%',
                                        background: (theme) =>
                                            theme.palette.primary.main,
                                        color: (theme) =>
                                            `${theme.palette.neutral[100]} !important`,
                                        right: '11%',
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
                                height="202px"
                                width="225px"
                            />
                        </Grid>
                    </Grid>
                </Popover>
            </RTL>
        </div>
    )
}

export default NavResturant
