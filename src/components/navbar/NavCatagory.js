import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useEffect, useState } from 'react'

import {
    alpha,
    Button,
    Grid,
    ListItemIcon,
    MenuItem,
    Popover,
    Stack,
    Typography,
} from '@mui/material'

import Link from 'next/link'
import { useTheme } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import { setFeaturedCategories } from '@/redux/slices/storedData'
import CustomImageContainer from '../CustomImageContainer'
import { CustomTypographyGray } from '../error/Errors.style'
import { onErrorResponse } from '../ErrorResponse'
import { NavMenuLink } from './Navbar.style'
const useStyles = makeStyles((theme) => ({
    popover: {
        pointerEvents: 'none',
    },
    paper: {
        pointerEvents: 'auto',
    },
}))
const NavCatagory = ({ setRestaurantModal, languageDirection }) => {
    const theme = useTheme()
    const classes = useStyles()
    const { t } = useTranslation()
    const router = useRouter()
    const { featuredCategories } = useSelector((state) => state.storedData)
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState(null)

    const opendrop = Boolean(anchorEl)
    const searchKey = ''

    const { data, refetch: refetchCategories } = useQuery(
        ['category'],
        () => CategoryApi.categories(searchKey),
        {
            enabled: false,
            staleTime: 1000 * 60 * 8,
            onError: onErrorResponse,
            cacheTime: 8 * 60 * 1000,
        }
    )
    useEffect(() => {
        if (featuredCategories?.length === 0) {
            refetchCategories()
        }
    }, [])
    useEffect(() => {
        if (data?.data) {
            dispatch(setFeaturedCategories(data?.data))
        }
    }, [data])
    const handledropClick = (event) => {
        setAnchorEl(event.currentTarget)
        setRestaurantModal(false)
    }
    const handledropClose = () => {
        setAnchorEl(null)
    }
    const handleClick = () => {
        router.push('/categories')
        handledropClose()
    }

    return (
        <div
            onMouseEnter={(e) => handledropClick(e)}
            onMouseLeave={handledropClose}
        >
            <NavMenuLink
                id="fade-button"
                aria-controls={opendrop ? 'fade-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={opendrop ? 'true' : undefined}
                underline="none"
                fontSize="14px"
                alignItems="center"
            >
                {t('Categories')}{' '}
                <KeyboardArrowDownIcon
                    style={{ width: '16px', marginLeft: '5px' }}
                />
            </NavMenuLink>
            <Popover
                disableScrollLock={true}
                id="mouse-over-popover"
                open={opendrop}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: languageDirection === 'rtl' ? 'right' : 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: languageDirection === 'rtl' ? 'right' : 'left',
                }}
                className={classes.popover}
                classes={{
                    paper: classes.paper,
                }}
            >
                <Stack width="460px">
                    <Grid container p="1rem" spacing={2}>
                        {featuredCategories?.length > 12 ? (
                            <>
                                {featuredCategories
                                    ?.slice(0, 12)
                                    ?.map((category, index) => {
                                        return (
                                            <>
                                                {index % 2 === 0 ? (
                                                    <Grid
                                                        item
                                                        md={6}
                                                        key={index}
                                                    >
                                                        <Link
                                                            href={{
                                                                pathname: `/category/${category.id}`,
                                                                query: {
                                                                    name: category?.name,
                                                                },
                                                            }}
                                                            style={{textDecoration: 'none'}}
                                                        >
                                                            <MenuItem
                                                                key={index}
                                                                onClick={
                                                                    handledropClose
                                                                }
                                                                sx={{
                                                                    alignItems:
                                                                        'center',
                                                                    gap: '5px',
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
                                                                <ListItemIcon>
                                                                    <CustomImageContainer
                                                                        src={
                                                                            category.image_full_url
                                                                        }
                                                                        width="35px"
                                                                        height="35px"
                                                                        loading="lazy"
                                                                        objectFit="cover"
                                                                    />
                                                                </ListItemIcon>
                                                                <Typography
                                                                    variant="h5"
                                                                    fontWeight="400"
                                                                    color={
                                                                        theme
                                                                            .palette
                                                                            .neutral[1000]
                                                                    }
                                                                    textDecoration="none"
                                                                >
                                                                    {
                                                                        category.name
                                                                    }
                                                                </Typography>
                                                                <CustomTypographyGray
                                                                    variant="h5"
                                                                    nodefaultfont="true"
                                                                >
                                                                    (
                                                                    {
                                                                        category.products_count
                                                                    }
                                                                    )
                                                                </CustomTypographyGray>
                                                            </MenuItem>
                                                        </Link>
                                                    </Grid>
                                                ) : (
                                                    <Grid
                                                        item
                                                        md={6}
                                                        key={index}
                                                    >
                                                        <Link
                                                            href={{
                                                                pathname: `/category/${category.id}`,
                                                                query: {
                                                                    name: category?.name,
                                                                },
                                                            }}
                                                            style={{textDecoration: 'none'}}
                                                        >
                                                            <MenuItem
                                                                key={index}
                                                                onClick={
                                                                    handledropClose
                                                                }
                                                                sx={{
                                                                    alignItems:
                                                                        'center',
                                                                    gap: '5px',
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
                                                                <ListItemIcon>
                                                                    <CustomImageContainer
                                                                        src={
                                                                            category.image_full_url
                                                                        }
                                                                        width="35px"
                                                                        height="35px"
                                                                        loading="lazy"
                                                                        objectFit="cover"
                                                                    />
                                                                </ListItemIcon>
                                                                <Typography
                                                                    variant="h5"
                                                                    fontWeight="400"
                                                                    color={
                                                                        theme
                                                                            .palette
                                                                            .neutral[1000]
                                                                    }
                                                                >
                                                                    {
                                                                        category.name
                                                                    }
                                                                </Typography>
                                                                <CustomTypographyGray
                                                                    variant="h5"
                                                                    nodefaultfont="true"
                                                                >
                                                                    (
                                                                    {
                                                                        category.products_count
                                                                    }
                                                                    )
                                                                </CustomTypographyGray>
                                                            </MenuItem>
                                                        </Link>
                                                    </Grid>
                                                )}
                                            </>
                                        )
                                    })}
                            </>
                        ) : (
                            <>
                                {featuredCategories?.map((category, index) => {
                                    return (
                                        <>
                                            {index % 2 === 0 ? (
                                                <Grid item md={6} key={index}>
                                                    <Link
                                                        href={{
                                                            pathname: `/category/${category.id}`,
                                                            query: {
                                                                name: category?.name,
                                                            },
                                                        }}
                                                        style={{textDecoration: 'none'}}
                                                    >
                                                        <MenuItem
                                                            onClick={
                                                                handledropClose
                                                            }
                                                            sx={{
                                                                alignItems:
                                                                    'center',
                                                                gap: '5px',
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
                                                            <ListItemIcon>
                                                                <CustomImageContainer
                                                                    src={
                                                                        category.image_full_url
                                                                    }
                                                                    width="35px"
                                                                    height="35px"
                                                                    loading="lazy"
                                                                    objectFit="cover"
                                                                />
                                                            </ListItemIcon>
                                                            <Typography
                                                                variant="h5"
                                                                fontWeight="400"
                                                                color={
                                                                    theme
                                                                        .palette
                                                                        .neutral[1000]
                                                                }
                                                            >
                                                                {category.name}
                                                            </Typography>
                                                            <CustomTypographyGray
                                                                variant="h5"
                                                                nodefaultfont="true"
                                                            >
                                                                (
                                                                {
                                                                    category.products_count
                                                                }
                                                                )
                                                            </CustomTypographyGray>
                                                        </MenuItem>
                                                    </Link>
                                                </Grid>
                                            ) : (
                                                <Grid item md={6} key={index}>
                                                    <Link
                                                        href={{
                                                            pathname: `/category/${category.id}`,
                                                            query: {
                                                                name: category?.name,
                                                            },
                                                        }}
                                                        style={{textDecoration: 'none'}}
                                                    >
                                                        <MenuItem
                                                            key={index}
                                                            onClick={
                                                                handledropClose
                                                            }
                                                            sx={{
                                                                alignItems:
                                                                    'center',
                                                                gap: '5px',
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
                                                            <ListItemIcon>
                                                                <CustomImageContainer
                                                                    src={
                                                                        category.image_full_url
                                                                    }
                                                                    width="35px"
                                                                    height="35px"
                                                                    loading="lazy"
                                                                    objectFit="cover"
                                                                />
                                                            </ListItemIcon>
                                                            <Typography
                                                                variant="h5"
                                                                fontWeight="400"
                                                                color={
                                                                    theme
                                                                        .palette
                                                                        .neutral[1000]
                                                                }
                                                            >
                                                                {category.name}
                                                            </Typography>
                                                            <CustomTypographyGray
                                                                variant="h5"
                                                                nodefaultfont="true"
                                                            >
                                                                (
                                                                {
                                                                    category.products_count
                                                                }
                                                                )
                                                            </CustomTypographyGray>
                                                        </MenuItem>
                                                    </Link>
                                                </Grid>
                                            )}
                                        </>
                                    )
                                })}
                            </>
                        )}
                    </Grid>
                    {featuredCategories?.length > 0 && (
                        <Grid
                            container
                            md={12}
                            justifyContent="center"
                            alignItems="center"
                            p=".8rem"
                        >
                            <Button
                                sx={{
                                    background: (theme) =>
                                        theme.palette.primary.main,
                                    color: (theme) =>
                                        `${theme.palette.neutral[100]} !important`,
                                    padding: '9px 25px',
                                    borderRadius: '5px',
                                    '&:hover': {
                                        background: (theme) =>
                                            theme.palette.primary.dark,
                                    },
                                }}
                                size="medium"
                                onClick={handleClick}
                            >
                                {t('View all')}
                            </Button>
                        </Grid>
                    )}
                </Stack>
            </Popover>
        </div>
    )
}

export default NavCatagory
