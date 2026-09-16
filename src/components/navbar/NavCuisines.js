import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import React, { useEffect, useState } from 'react'
import { Grid, Menu, Stack, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useGetCuisines } from '@/hooks/react-query/cuisines/useGetCuisines'
import { setCuisines } from '@/redux/slices/storedData'
import { noRestaurantsImage } from '@/utils/LocalImages'
import NavCuisinesList from '../cuisines-page/NavCuisinesList'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import { NavMenuLink } from './Navbar.style'
import ResShimmer from './ResShimmer'
const useStyles = makeStyles((theme) => ({
    popover: {
        pointerEvents: 'none',
    },
    paper: {
        pointerEvents: 'auto',
    },
}))
const NavCuisines = ({ setRestaurantModal, languageDirection }) => {
    const classes = useStyles()
    const { cuisines } = useSelector((state) => state.storedData)
    const { t } = useTranslation()
    const router = useRouter()
    const { global } = useSelector((state) => state.globalSettings)
    const cuisinesImageUrl = `${global?.base_urls?.cuisine_image_url}`
    const [anchorEl, setAnchorEl] = useState(null)
    const dispatch = useDispatch()
    const opendrop = Boolean(anchorEl)

    const { data, refetch, isLoading, isFetching } = useGetCuisines()
    const showCuisinesLoading =
        (isLoading || isFetching) && !cuisines?.length
    useEffect(() => {
        // Deferred to the dropdown actually opening — menu content only;
        // eager fetching spent a connection slot on every page load.
        if (opendrop && cuisines?.length === 0) {
            refetch()
        }
    }, [opendrop])

    const handledropClick = (event) => {
        setAnchorEl(event.currentTarget)
        setRestaurantModal(false)
    }
    const handledropClose = () => {
        setAnchorEl(null)
    }
    const handleClick = () => {
        router.push('/cuisines')
        handledropClose()
    }

    useEffect(() => {
        if (data) {
            dispatch(setCuisines(data?.Cuisines))
        }
    }, [data])

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
            >
                {t('Cuisines')}
                <KeyboardArrowDownIcon
                    style={{ width: '14px', height: '14px' }}
                />
            </NavMenuLink>
            <Menu
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
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        boxShadow: '0px 12px 32px -4px rgba(0, 0, 0, 0.12)',
                    },
                }}
            >
                <Stack width="380px">
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
                            {t('Cuisines')}
                        </Typography>
                        {!showCuisinesLoading && cuisines?.length > 0 && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                gap="2px"
                                onClick={handleClick}
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
                    <Grid container p="24px" pt="12px" columnSpacing="16px" rowSpacing="4px">
                        {showCuisinesLoading ? (
                            <>
                                <ResShimmer shimmerfor="cuisines" mdSize={6} />
                                <ResShimmer shimmerfor="cuisines" mdSize={6} />
                            </>
                        ) : cuisines?.length === 0 ? (
                            <Grid
                                item
                                container
                                alignItems="center"
                                justifyContent="center"
                            >
                                <CustomEmptyResult
                                    height="100px"
                                    image={noRestaurantsImage}
                                    label="No cuisine found"
                                />
                            </Grid>
                        ) : cuisines?.length > 12 ? (
                            <>
                                {cuisines?.slice(0, 12)?.map((item, index) => {
                                    return (
                                        <React.Fragment key={item?.id}>
                                            {index % 2 === 0 ? (
                                                <Grid item md={6}>
                                                    <NavCuisinesList
                                                        item={item}
                                                        handledropClose={
                                                            handledropClose
                                                        }
                                                        cuisinesImageUrl={
                                                            cuisinesImageUrl
                                                        }
                                                    />
                                                </Grid>
                                            ) : (
                                                <Grid
                                                    item
                                                    md={6}
                                                    key={item?.id}
                                                >
                                                    <NavCuisinesList
                                                        item={item}
                                                        handledropClose={
                                                            handledropClose
                                                        }
                                                        cuisinesImageUrl={
                                                            cuisinesImageUrl
                                                        }
                                                    />{' '}
                                                </Grid>
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                            </>
                        ) : (
                            <>
                                {cuisines?.map((item, index) => {
                                    return (
                                        <>
                                            {index % 2 === 0 ? (
                                                <Grid
                                                    item
                                                    md={6}
                                                    key={item?.id}
                                                >
                                                    <NavCuisinesList
                                                        item={item}
                                                        handledropClose={
                                                            handledropClose
                                                        }
                                                        cuisinesImageUrl={
                                                            cuisinesImageUrl
                                                        }
                                                    />
                                                </Grid>
                                            ) : (
                                                <Grid
                                                    item
                                                    md={6}
                                                    key={item?.id}
                                                >
                                                    <NavCuisinesList
                                                        item={item}
                                                        handledropClose={
                                                            handledropClose
                                                        }
                                                        cuisinesImageUrl={
                                                            cuisinesImageUrl
                                                        }
                                                    />{' '}
                                                </Grid>
                                            )}
                                        </>
                                    )
                                })}
                            </>
                        )}
                    </Grid>
                </Stack>
            </Menu>
        </div>
    )
}

export default NavCuisines
