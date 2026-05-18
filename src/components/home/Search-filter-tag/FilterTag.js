import CustomGroupCheckbox from '@/components/custom-group-checkboxs/CustomGroupCheckbox'
import {
    setCuisineData,
    setSearchTagData,
    setSelectedName,
    setSelectedValue,
} from '@/redux/slices/searchTagSlice'
import { useTheme } from '@emotion/react'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SearchIcon from '@mui/icons-material/Search'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded'
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import {
    Box,
    Chip,
    FormControlLabel,
    IconButton,
    Popover,
    Stack,
    Typography,
    alpha,
} from '@mui/material'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FilterButton from '../../Button/FilterButton'
import FilterCard from '../../products-page/FilterCard'
import SearchBox from '../hero-section-with-search/SearchBox'
import { WrapperForSideDrawerFilter } from '@/styled-components/CustomStyles.style'
import CustomImage from '@/components/CustomNextImage'
import { useRouter } from 'next/router'
import { RTL } from '../../RTL/RTL'

export const CustomChip = styled(Chip)(({ theme, query, value, isSticky }) => {
    const isDark = theme.palette.mode === 'dark'
    const activeBg = isDark
        ? alpha(theme.palette.primary.main, 0.18)
        : '#FFF4EC'
    const idleBg = isDark ? theme.palette.background.paper : '#FFFFFF'
    const idleBorder = isDark ? 'rgba(255,255,255,0.14)' : '#E2E8F0'
    const idleColor = isDark ? theme.palette.neutral[300] : '#334155'
    return {
        padding: isSticky ? '2px 3px' : '8px 4px',
        alignItems: 'center',
        color: value ? theme.palette.primary.main : idleColor,
        fontSize: isSticky ? '13px' : '13px',
        fontWeight: 600,
        height: isSticky ? '32px' : '36px',
        cursor: 'pointer',
        borderRadius: '999px',
        backgroundColor: value ? activeBg : idleBg,
        border: value
            ? `1px solid ${theme.palette.primary.main}`
            : `1px solid ${idleBorder}`,
        boxShadow: value ? 'none' : '0 1px 2px rgba(15,23,42,0.04)',

        transition: 'color 0.15s ease, border-color 0.15s ease',

        '&:hover, &.MuiChip-clickable:hover': {
            backgroundColor: value ? activeBg : idleBg,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            boxShadow: value ? 'none' : '0 1px 2px rgba(15,23,42,0.04)',
        },
        '&.MuiChip-clickable:focus, &.MuiChip-clickable:focus-visible': {
            backgroundColor: value ? activeBg : idleBg,
            borderColor: value ? theme.palette.primary.main : idleBorder,
            color: value ? theme.palette.primary.main : idleColor,
            boxShadow: value ? 'none' : '0 1px 2px rgba(15,23,42,0.04)',
        },

    '& .MuiChip-label': {
        padding: isSticky ? '5px 6px !important' : '8px 10px !important',
        maxWidth: '140px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        transition: 'padding 0.2s ease',
    },

    '& .MuiChip-icon': {
        marginLeft: isSticky ? '8px' : '10px',
        marginRight: '-2px',
    },

    [theme.breakpoints.down('md')]: {
        fontSize: '12px',
        padding: '4px 4px',
        height: '31px',
    },
    }
})

export const SearchIconButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.borderBottomBg,
    padding: '6px',
    borderRadius: '4px',
}))

const getFilterIcon = (value) => {
    const baseStyle = { fontSize: '16px' }
    switch (value) {
        case 'sort_by':
            return (
                <TuneRoundedIcon style={{ ...baseStyle, color: '#6366F1' }} />
            )
        case 'veg':
            return (
                <Box
                    sx={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        border: '2px solid #16A34A',
                    }}
                />
            )
        case 'nonVeg':
            return (
                <Box
                    sx={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        border: '2px solid #DC2626',
                    }}
                />
            )
        case 'ratings':
        case 'rating':
        case 'rating5':
            return (
                <StarRoundedIcon style={{ ...baseStyle, color: '#F59E0B' }} />
            )
        case 'new_arrivals':
            return (
                <AutoAwesomeRoundedIcon
                    style={{ ...baseStyle, color: '#8B5CF6' }}
                />
            )
        case 'discounted':
            return (
                <LocalOfferRoundedIcon
                    style={{ ...baseStyle, color: '#F97316' }}
                />
            )
        case 'popular':
            return (
                <WhatshotRoundedIcon
                    style={{ ...baseStyle, color: '#EF4444' }}
                />
            )
        case 'currentlyAvailable':
            return (
                <AccessTimeRoundedIcon
                    style={{ ...baseStyle, color: '#3B82F6' }}
                />
            )
        case 'halal':
            return (
                <VerifiedRoundedIcon
                    style={{ ...baseStyle, color: '#16A34A' }}
                />
            )
        default:
            return null
    }
}
const FilterTag = ({
    handleClick,
    query,
    storeData,
    setStoreData,
    handleSort,
    activeFilters,
    tags,
    page,
    restaurantType,
    homePage,
}) => {
    const router = useRouter()
    const [scrollPosition, setScrollPosition] = useState(0)
    const [open, setOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [cuisineOrSort, setCuisineOrSort] = useState('sort')
    const [anchorElCard, setAnchorElCard] = useState(null)
    const { filterData, foodOrRestaurant } = useSelector(
        (state) => state.searchFilterStore
    )
    const { global } = useSelector((state) => state.globalSettings)
    const businessLogo = global?.fav_icon_full_url

    const { searchTagData, selectedValue, selectedName, cuisineData } =
        useSelector((state) => state.searchTags)
    const { isSticky } = useSelector((state) => state.scrollPosition)
    const { cuisines } = useSelector((state) => state.storedData)
    const [cuisineState, setCuisineState] = useState([])
    const dispatch = useDispatch()
    const theme = useTheme()
    const iconColor = theme.palette.neutral[1000]
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const isMobileMenuEnabled = useMediaQuery(theme.breakpoints.down('md'))
    // useEffect(() => {
    //     if (isSmall) setOpen(true)
    // }, [isSmall])
    const handleCuisineData = () => {
        dispatch(
            setCuisineData(
                cuisines?.map((item) => {
                    return {
                        ...item,
                        isActive: false,
                    }
                })
            )
        )
    }
    useEffect(() => {
        if (cuisines) {
            handleCuisineData()
        }
    }, [cuisines])

    useEffect(() => {
        if (cuisineData) {
            setCuisineState(cuisineData)
        }
    }, [cuisineData])

    const getData = () => {
        if (global?.toggle_veg_non_veg === false) {
            const tempData = searchTagData?.filter(
                (item) => item.id !== 0 && item.id !== 2
            )
            dispatch(setSearchTagData(tempData))
        } else {
            dispatch(setSearchTagData(storeData))
        }
    }
    useEffect(() => {
        getData()
    }, [global])

    const handlePopOverOpen = (event, value) => {
        setCuisineOrSort(value)
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY) // Update scroll position
        }

        window.addEventListener('scroll', handleScroll)

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const handleDropClick = (event) => {
        setAnchorElCard(event.currentTarget)
    }
    const handleDropClose = () => {
        setAnchorElCard(null)
    }

    useEffect(() => {
        if (scrollPosition > 55) {
            setAnchorElCard(null)
        }
    }, [scrollPosition])

    useEffect(() => {
        if (activeFilters?.length === 0) {
            setAnchorElCard(null)
        }
    }, [searchTagData])
    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }
    const handleChange = (e) => {
        dispatch(setSelectedValue(e.target.value))
        dispatch(setSelectedName(e.target.labels[0].innerText))
        handleSort(e.target.value)
        handleClose()
    }
    useEffect(() => {
        setAnchorElCard(null)
    }, [query, tags])
    useEffect(() => {
        if (cuisines) {
            setCuisineState(cuisines)
        }
    }, [cuisines])

    let zoneid = undefined
    if (typeof window !== 'undefined') {
        zoneid = JSON.parse(localStorage.getItem('zoneid'))
    }
    let currentLocation = undefined
    if (typeof window !== 'undefined') {
        currentLocation = JSON.parse(localStorage.getItem('currentLatLng'))
    }

    const handleLogoClick = () => {
        const shouldRedirectToHome =
            zoneid && currentLocation?.lat && currentLocation?.lng
        const newPath = shouldRedirectToHome ? '/home' : '/'

        router.push(newPath, undefined, { shallow: true }).then(() => {
            window.scrollTo(0, 0)
        })
    }

    return (
        <RTL direction={languageDirection}>
            <Stack
                direction="row"
                alignItems="center"
                spacing={{ xs: 1, md: 0 }}
                gap={{ xs: ".5rem", md: "1rem" }}
            >
                {!open ? (
                    <Box sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
                    {isSmall && (
                        <Box
                            sx={{
                                display: { xs: 'block', md: 'none' },
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                bottom: 0,
                                width: '40px',
                                zIndex: 1,
                                pointerEvents: 'none',
                                background: (theme) =>
                                    `linear-gradient(to right, transparent, ${theme.palette.background.default})`,
                            }}
                        />
                    )}
                    <Stack
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            '&::-webkit-scrollbar': {
                                width: '0',
                                height: '0',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: 'transparent',
                            },
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={isSmall ? 1 : isSticky ? 1 : 2}
                            alignItems="center"
                            sx={{
                                '> img': {
                                    width: 'auto',
                                    height: 'auto',
                                    maxHeight: '40px',
                                },
                                cursor: 'pointer',
                                paddingInlineEnd: { xs: '40px', md: '20px' },
                            }}
                        >
                            {isSticky && !isMobileMenuEnabled && (
                                <CustomImage
                                    src={businessLogo}
                                    width={100}
                                    height={40}
                                    onClick={handleLogoClick}
                                    alt="logo"
                                    priority
                                />
                            )}
                            {searchTagData?.map((item) => {
                                if (item?.id === 1) {
                                    return (
                                        <CustomChip
                                            key={item?.id}
                                            sx={{
                                                marginInlineEnd:
                                                    languageDirection ===
                                                        'rtl' &&
                                                    '10px !important',
                                            }}
                                            onPointerDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            onTouchStart={(e) =>
                                                e.stopPropagation()
                                            }
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                handlePopOverOpen(event, 'sort')
                                            }}
                                            isSticky={isSticky}
                                            value={item?.isActive}
                                            icon={getFilterIcon(item?.value)}
                                            label={
                                                selectedName
                                                    ? t(selectedName)
                                                    : t(item?.name)
                                            }
                                            variant="outlined"
                                            onDelete={(event) => {
                                                event.stopPropagation()
                                                handlePopOverOpen(event, 'sort')
                                            }}
                                            deleteIcon={
                                                <IconButton
                                                    sx={{ padding: '0px' }}
                                                    size="medium"
                                                >
                                                    <KeyboardArrowDownIcon
                                                        style={{
                                                            color: iconColor,
                                                        }}
                                                    />
                                                </IconButton>
                                            }
                                        />
                                    )
                                }
                                if (item?.id === 3 || item?.id === 5) {
                                    return null
                                }
                                if (
                                    item?.id === 9 &&
                                    restaurantType !== 'dine-in'
                                ) {
                                    return null
                                }
                                return (
                                    <CustomChip
                                        key={item?.id}
                                        isSticky={isSticky}
                                        value={item?.isActive}
                                        label={t(item?.name)}
                                        variant="outlined"
                                        icon={getFilterIcon(
                                            item?.value,
                                            item?.isActive
                                        )}
                                        onPointerDown={(e) =>
                                            e.stopPropagation()
                                        }
                                        onMouseDown={(e) =>
                                            e.stopPropagation()
                                        }
                                        onTouchStart={(e) =>
                                            e.stopPropagation()
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleClick(item?.value, e)
                                        }}
                                    />
                                )
                            })}
                            {(query || tags || restaurantType === 'dine-in') &&
                                !isSticky && (
                                    <FilterButton
                                        id="fade-button"
                                        handleClick={handleDropClick}
                                        activeFilters={activeFilters}
                                        forSearch={true}
                                        homePage
                                        padding="10px 10px"
                                    />
                                )}
                        </Stack>
                    </Stack>
                    </Box>
                ) : (
                     <Box
                    sx={{
                        width: '100%',
                        maxWidth: '560px',
                        '& form': { width: '100%' },
                        '& form > div': {
                            background: 'transparent !important',
                            border: 'none !important',
                        },
                        '& .MuiInputBase-root': {
                            borderRadius: '999px',
                            backgroundColor: (theme) =>
                                `${theme.palette.mode === 'dark'
                                    ? theme.palette.background.paper
                                    : '#FFFFFF'} !important`,
                            border: (theme) =>
                                `1px solid ${theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.12)'
                                    : '#E2E8F0'}`,
                            paddingInline: {
                                xs: '0px',
                                sm: '10px',
                                md: '10px',
                            },
                            height: '40px',
                            gap: {
                                xs: '6px',
                                sm: '10px',
                                md: '10px',
                            },
                            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                            transition: 'border-color .2s ease, box-shadow .2s ease',
                        },
                        '& .MuiInputBase-root:hover': {
                            borderColor: (theme) =>
                                theme.palette.primary.main,
                        },
                        '& .MuiInputBase-root.Mui-focused, & .MuiInputBase-root:focus-within': {
                            borderColor: (theme) =>
                                theme.palette.primary.main,
                            boxShadow: '0 0 0 4px rgba(255,117,24,.14)',
                        },
                        '& .MuiInputBase-input': {
                            padding: '0 !important',
                            fontSize: '14px !important',
                            color: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? '#fff'
                                    : '#0F172A',
                            height: 'auto !important',
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: '#94A3B8',
                            opacity: 1,
                            fontSize: {
                                xs: '11px',
                                sm: '14px',
                                md: '14px',
                            },
                        },
                        '& .MuiSvgIcon-root': {
                            color: '#94A3B8',
                        },
                        '& .MuiInputAdornment-positionStart .MuiSvgIcon-root': {
                            fontSize: '20px',
                        },
                        '& .MuiInputAdornment-positionEnd .MuiIconButton-root': {
                            width: 28,
                            height: 28,
                            backgroundColor: '#FFF4EC',
                            '& .MuiSvgIcon-root': {
                                color: (theme) => theme.palette.primary.main,
                                fontSize: '16px',
                            },
                            '&:hover': {
                                backgroundColor: (theme) =>
                                    theme.palette.primary.main,
                                '& .MuiSvgIcon-root': {
                                    color: '#fff',
                                },
                            },
                        },
                    }}
                >
                    <SearchBox
                        query={query}
                        //setOpenSearchBox={setOpenSearchBox}
                    />
                </Box>
                )}
                {isSticky && !isSmall && (
                    <Box
                        sx={{
                            minWidth: '400px',
                            marginTop: '8px',
                            animation: 'fadeInRight 1s  1',
                        }}
                    >
                        <SearchBox query={query} />
                    </Box>
                )}
                {isSmall && (
                    <Box sx={{ ml: '0 !important' }}>
                        {open ? (
                            <SearchIconButton onClick={() => setOpen(false)}>
                                <ChevronRightIcon />
                            </SearchIconButton>
                        ) : (
                            <SearchIconButton onClick={() => setOpen(true)}>
                                <SearchIcon />
                            </SearchIconButton>
                        )}
                    </Box>
                )}
                {!isSmall && (() => {
                    const loc =
                        typeof window !== 'undefined'
                            ? localStorage.getItem('location')
                            : null
                    const parts = loc
                        ? loc.split(',').map((s) => s.trim()).filter(Boolean)
                        : []
                    const city =
                        parts.length >= 2
                            ? parts[parts.length - 2]
                            : parts[0] || ''
                    if (!city) return null
                    return (
                        <Stack
                            direction="row"
                            alignItems="center"
                            sx={{
                                flexShrink: 0,
                                marginInlineStart: 'auto',
                                whiteSpace: 'nowrap',
                                gap: '6px',
                            }}
                        >
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: '13px',
                                    color: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? theme.palette.neutral[300]
                                            : theme.palette.neutral[700],
                                }}
                            >
                                {t('Showing results for')}
                            </Typography>
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: (theme) =>
                                        theme.palette.neutral[1000],
                                }}
                            >
                                {city}
                            </Typography>
                        </Stack>
                    )
                })()}
            </Stack>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                disableScrollLock
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {cuisineOrSort === 'sort' ? (
                    <List sx={{ paddingInline: '8px' }}>
                        <RadioGroup
                            value={selectedValue}
                            onChange={(e) => handleChange(e)}
                        >
                            <ListItem
                                sx={{
                                    fontSize: '13px',
                                    paddingInline: '1rem',
                                    cursor: 'pointer',
                                    color: (theme) =>
                                        theme.palette.neutral[600],
                                    borderBottom: '1px solid',
                                    borderBottomColor: (theme) =>
                                        alpha(theme.palette.neutral[300], 0.3),
                                    paddingTop: '4px',
                                    paddingBottom: '4px',
                                }}
                            >
                                <FormControlLabel
                                    value="asc"
                                    control={<Radio />}
                                    label={
                                        <ListItemText
                                            primary={
                                                <Typography fontSize="13px">
                                                    {t('Sort by: A to Z')}
                                                </Typography>
                                            }
                                        />
                                    }
                                />
                            </ListItem>
                            <ListItem
                                sx={{
                                    fontSize: '13px',
                                    paddingInline: '1rem',
                                    cursor: 'pointer',
                                    color: (theme) =>
                                        theme.palette.neutral[600],
                                    borderBottom: '1px solid',
                                    borderBottomColor: (theme) =>
                                        alpha(theme.palette.neutral[300], 0.3),
                                    paddingTop: '4px',
                                    paddingBottom: '4px',
                                }}
                            >
                                <FormControlLabel
                                    value="desc"
                                    control={<Radio />}
                                    label={
                                        <ListItemText
                                            primary={
                                                <Typography fontSize="13px">
                                                    {t('Sort by: Z to A')}
                                                </Typography>
                                            }
                                        />
                                    }
                                />
                            </ListItem>

                            {restaurantType === 'dine-in' && (
                                <ListItem
                                    sx={{
                                        fontSize: '13px',
                                        paddingInline: '1rem',
                                        cursor: 'pointer',
                                        color: (theme) =>
                                            theme.palette.neutral[600],
                                        borderBottom: '1px solid',
                                        borderBottomColor: (theme) =>
                                            alpha(
                                                theme.palette.neutral[300],
                                                0.3
                                            ),
                                        paddingTop: '4px',
                                        paddingBottom: '4px',
                                    }}
                                >
                                    <FormControlLabel
                                        value="distance"
                                        control={<Radio />}
                                        label={
                                            <ListItemText
                                                primary={
                                                    <Typography fontSize="13px">
                                                        {t('Sort by: Distance')}
                                                    </Typography>
                                                }
                                            />
                                        }
                                    />
                                </ListItem>
                            )}
                            {restaurantType === 'dine-in' && (
                                <ListItem
                                    sx={{
                                        fontSize: '13px',
                                        paddingInline: '1rem',
                                        cursor: 'pointer',
                                        color: (theme) =>
                                            theme.palette.neutral[600],
                                        borderBottom: '1px solid',
                                        borderBottomColor: (theme) =>
                                            alpha(
                                                theme.palette.neutral[300],
                                                0.3
                                            ),
                                        paddingTop: '4px',
                                        paddingBottom: '4px',
                                    }}
                                >
                                    <FormControlLabel
                                        value="rating"
                                        control={<Radio />}
                                        label={
                                            <ListItemText
                                                primary={
                                                    <Typography fontSize="13px">
                                                        {t('Sort by: Rating')}
                                                    </Typography>
                                                }
                                            />
                                        }
                                    />
                                </ListItem>
                            )}

                            {foodOrRestaurant !== 'restaurants' && (
                                <>
                                    <ListItem
                                        sx={{
                                            fontSize: '13px',
                                            paddingInline: '1rem',
                                            cursor: 'pointer',
                                            color: (theme) =>
                                                theme.palette.neutral[600],
                                            borderBottom: '1px solid',
                                            borderBottomColor: (theme) =>
                                                alpha(
                                                    theme.palette.neutral[300],
                                                    0.3
                                                ),
                                            paddingTop: '4px',
                                            paddingBottom: '4px',
                                        }}
                                    >
                                        <FormControlLabel
                                            value="high"
                                            control={<Radio />}
                                            label={
                                                <ListItemText
                                                    primary={
                                                        <Typography fontSize="13px">
                                                            {t(
                                                                'Price: High to Low'
                                                            )}
                                                        </Typography>
                                                    }
                                                />
                                            }
                                        />
                                    </ListItem>
                                    <ListItem
                                        sx={{
                                            fontSize: '13px',
                                            paddingInline: '1rem',
                                            cursor: 'pointer',
                                            color: (theme) =>
                                                theme.palette.neutral[600],
                                            paddingTop: '4px',
                                            paddingBottom: '4px',
                                        }}
                                    >
                                        <FormControlLabel
                                            value="low"
                                            control={<Radio />}
                                            label={
                                                <ListItemText
                                                    primary={
                                                        <Typography fontSize="13px">
                                                            {t(
                                                                'Price: Low to High'
                                                            )}
                                                        </Typography>
                                                    }
                                                />
                                            }
                                        />
                                    </ListItem>
                                </>
                            )}
                        </RadioGroup>
                    </List>
                ) : (
                    <Box>
                        <WrapperForSideDrawerFilter smminwith="270px">
                            <Stack spacing={3}>
                                <Stack direction="row">
                                    <CustomGroupCheckbox
                                        forcuisine="true"
                                        checkboxData={cuisines}
                                        setCuisineState={setCuisineState}
                                        cuisineState={cuisineState}
                                    />
                                </Stack>
                            </Stack>
                        </WrapperForSideDrawerFilter>
                    </Box>
                )}
            </Popover>
            <Popover
                onClose={() => handleDropClose()}
                id="fade-button"
                open={Boolean(anchorElCard)}
                anchorEl={anchorElCard}
                disableScrollLock
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                sx={{
                    zIndex: 999,
                    top: '12px',
                }}
            >
                <FilterCard
                    restaurantType={restaurantType}
                    handleDropClose={handleDropClose}
                    stateData={storeData}
                    setStateData={setStoreData}
                    forcuisine="true"
                    setCuisineState={setCuisineState}
                    cuisineState={cuisineState}
                />
            </Popover>
        </RTL>
    )
}

export default FilterTag
