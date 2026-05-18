import CloseIcon from '@mui/icons-material/Close'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import RoomIcon from '@mui/icons-material/Room'
import {
    Button,
    Grid,
    IconButton,
    Stack,
    SwipeableDrawer,
    Tooltip,
    Typography,
    styled,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import CustomModal from '@/components/custom-modal/CustomModal'
import { Puller } from '@/components/home/visit-again'
import NearByRestaurant from '@/components/home/visit-again/NearByRestaurant'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'

const FindNearbyCard = styled(Stack)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '22px',
    background: `linear-gradient(100deg, ${
        theme.palette.primary.main
    } 0%, ${alpha(theme.palette.primary.main, 0.82)} 100%)`,
    padding: '24px 32px',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    '&::before': {
        content: '""',
        position: 'absolute',
        right: '-40px',
        top: '-40px',
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.10)',
        pointerEvents: 'none',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        right: '140px',
        bottom: '-70px',
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.10)',
        pointerEvents: 'none',
    },
    [theme.breakpoints.down('sm')]: {
        padding: '18px 20px',
        gap: '14px',
    },
}))

const ReferCard = styled(Stack)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '22px',
    background: theme.palette.neutral[800],
    padding: '20px 24px',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '16px',
    justifyContent: 'space-between',
    height: '100%',
    '&::before': {
        content: '""',
        position: 'absolute',
        right: '-70px',
        top: '-70px',
        width: '220px',
        height: '220px',
        background: `radial-gradient(circle, ${alpha(
            theme.palette.primary.main,
            0.25
        )} 0%, transparent 70%)`,
        pointerEvents: 'none',
    },
    [theme.breakpoints.down('sm')]: {
        padding: '16px 20px',
    },
}))

const IconBox = styled(Stack)(({ theme, variant }) => ({
    width: '52px',
    height: '52px',
    minWidth: '52px',
    borderRadius: '14px',
    background:
        variant === 'refer'
            ? `linear-gradient(135deg, ${
                  theme.palette.primary.main
              } 0%, ${alpha(theme.palette.primary.main, 0.7)} 100%)`
            : 'rgba(255,255,255,0.18)',
    border: variant === 'refer' ? 'none' : '1px solid rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
    boxShadow:
        variant === 'refer'
            ? `0 6px 14px ${alpha(theme.palette.primary.main, 0.35)}`
            : 'none',
}))

const FindNearbyReferStrip = () => {
    const { t } = useTranslation()
    const theme = useTheme()
    const router = useRouter()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const drawerBleeding = 0
    const [open, setOpen] = useState(false)
    const [openDrawer, setOpenDrawer] = useState(false)
    const { global } = useSelector((state) => state.globalSettings)

    const showRefer =
        global?.ref_earning_status && global?.ref_earning_exchange_rate !== 0

    const toggleDrawer = () => () => {
        setOpenDrawer(!openDrawer)
    }

    const handleFindNearbyClick = () => {
        if (isXSmall) {
            setOpenDrawer(true)
        } else {
            setOpen(true)
        }
    }

    const handleReferClick = () => {
        const token = getToken()
        if (token) {
            router.push('/info?page=referral')
        } else {
            toast.error(t('please login first'))
        }
    }

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} md={showRefer ? 7 : 12}>
                    <FindNearbyCard>
                        <Stack
                            direction="row"
                            alignItems="center"
                            gap={{ xs: '12px', sm: '16px' }}
                            sx={{ zIndex: 1 }}
                        >
                            <IconBox>
                                <GpsFixedIcon
                                    sx={{
                                        fontSize: { xs: '20px', sm: '22px' },
                                    }}
                                />
                            </IconBox>
                            <Stack gap="2px">
                                <Typography
                                    fontSize={{ xs: '16px', sm: '20px' }}
                                    fontWeight={800}
                                    color={theme.palette.common.white}
                                    letterSpacing="-0.01em"
                                    component="h3"
                                >
                                    {t('Find Nearby ')}
                                </Typography>
                                <Typography
                                    fontSize={{ xs: '12px', sm: '13.5px' }}
                                    color="rgba(255,255,255,0.92)"
                                    component="p"
                                >
                                    {t('Restaurant Near from You')}
                                </Typography>
                            </Stack>
                        </Stack>
                        <Button
                            variant="contained"
                            startIcon={
                                <RoomIcon
                                    sx={{
                                        fontSize: {
                                            xs: '16px !important',
                                            sm: '20px !important',
                                        },
                                    }}
                                />
                            }
                            onClick={handleFindNearbyClick}
                            sx={{
                                zIndex: 1,
                                flexShrink: 0,
                                backgroundColor:
                                    theme.palette.whiteContainer.main,
                                color: theme.palette.primary.main,
                                borderRadius: '999px',
                                fontWeight: 700,
                                fontSize: { xs: '12px', sm: '14px' },
                                lineHeight: 1.2,
                                px: { xs: '12px', sm: '18px' },
                                py: { xs: '6px', sm: '8px' },
                                minHeight: { xs: '34px', sm: '40px' },
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                '& .MuiButton-startIcon': {
                                    marginRight: { xs: '4px', sm: '8px' },
                                    marginLeft: 0,
                                },
                                '&:hover': {
                                    backgroundColor:
                                        theme.palette.neutral[1000],
                                    color: theme.palette.neutral[100],
                                },
                            }}
                        >
                            {t('See Location')}
                        </Button>
                    </FindNearbyCard>
                </Grid>

                {showRefer && (
                    <Grid item xs={12} md={5}>
                        <ReferCard>
                            <Stack
                                direction="row"
                                alignItems="center"
                                gap="14px"
                                sx={{ zIndex: 1, minWidth: 0 }}
                            >
                                <IconBox variant="refer">
                                    <CardGiftcardIcon
                                        sx={{
                                            fontSize: {
                                                xs: '20px',
                                                sm: '22px',
                                            },
                                        }}
                                    />
                                </IconBox>
                                <Stack gap="2px" sx={{ minWidth: 0 }}>
                                    {(() => {
                                        const titleText = `${t('Earn ')}${
                                            global?.currency_symbol ?? ''
                                        }${
                                            global?.ref_earning_exchange_rate ??
                                            ''
                                        } · ${t('Refer a Friend')}`
                                        const subtitleText = `${t(
                                            'Refer your code to your friends and get'
                                        )} ${global?.currency_symbol ?? ''}${
                                            global?.ref_earning_exchange_rate ??
                                            ''
                                        } ${t('for every referral!')}`
                                        return (
                                            <>
                                                <Tooltip
                                                    title={titleText}
                                                    enterTouchDelay={0}
                                                    leaveTouchDelay={2500}
                                                    placement="top"
                                                    arrow
                                                    slotProps={{
                                                        tooltip: {
                                                            sx: {
                                                                fontSize: '11px',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <Typography
                                                        fontSize={{
                                                            xs: '14px',
                                                            sm: '15px',
                                                        }}
                                                        fontWeight={800}
                                                        color={
                                                            theme.palette.common
                                                                .white
                                                        }
                                                        letterSpacing="-0.01em"
                                                        component="h3"
                                                        noWrap
                                                    >
                                                        {titleText}
                                                    </Typography>
                                                </Tooltip>
                                                <Tooltip
                                                    title={subtitleText}
                                                    enterTouchDelay={0}
                                                    leaveTouchDelay={2500}
                                                    placement="bottom"
                                                    arrow
                                                    slotProps={{
                                                        tooltip: {
                                                            sx: {
                                                                fontSize: '11px',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <Typography
                                                        fontSize={{
                                                            xs: '11px',
                                                            sm: '12px',
                                                        }}
                                                        color={
                                                            theme.palette
                                                                .neutral[300]
                                                        }
                                                        component="p"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient:
                                                                'vertical',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {subtitleText}
                                                    </Typography>
                                                </Tooltip>
                                            </>
                                        )
                                    })()}
                                </Stack>
                            </Stack>
                            <Button
                                variant="contained"
                                onClick={handleReferClick}
                                sx={{
                                    zIndex: 1,
                                    flexShrink: 0,
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.common.white,
                                    borderRadius: '999px',
                                    fontWeight: 700,
                                    px: { xs: '14px', sm: '16px' },
                                    '&:hover': {
                                        backgroundColor:
                                            theme.palette.primary.dark,
                                    },
                                }}
                            >
                                {t('Refer Now')}
                            </Button>
                        </ReferCard>
                    </Grid>
                )}
            </Grid>

            {open && (
                <CustomModal
                    openModal={open}
                    setModalOpen={setOpen}
                    maxWidth={{ xs: '90%', sm: '98vw', md: '1000px' }}
                >
                    <CustomStackFullWidth
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end"
                        height="65%"
                        sx={{ position: 'relative' }}
                    >
                        <IconButton
                            sx={{ position: 'absolute', top: 3, right: 3 }}
                            onClick={() => setOpen(false)}
                        >
                            <CloseIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                        <NearByRestaurant />
                    </CustomStackFullWidth>
                </CustomModal>
            )}

            {openDrawer && (
                <SwipeableDrawer
                    anchor="bottom"
                    open={openDrawer}
                    onClose={toggleDrawer()}
                    onOpen={toggleDrawer()}
                    swipeAreaWidth={drawerBleeding}
                    disableSwipeToOpen={false}
                    ModalProps={{ keepMounted: true }}
                    PaperProps={{
                        sx: { borderRadius: '20px 20px 0 0' },
                    }}
                >
                    <CustomStackFullWidth>
                        <CustomStackFullWidth
                            sx={{
                                position: 'absolute',
                                top: -drawerBleeding,
                                alignItems: 'center',
                                zIndex: 300,
                                height: '45px',
                                background:
                                    'linear-gradient(179deg, #FFF 1.26%, rgba(255, 255, 255, 0.00) 98.74%)',
                            }}
                        >
                            <Puller />
                        </CustomStackFullWidth>
                        <Stack
                            sx={{
                                overflow: 'auto',
                                height: '80vh',
                                borderRadius: '20px',
                            }}
                        >
                            <NearByRestaurant />
                        </Stack>
                    </CustomStackFullWidth>
                </SwipeableDrawer>
            )}
        </>
    )
}

export default FindNearbyReferStrip
