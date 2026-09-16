import useScrollToFitScreenDrawer from '@/hooks/custom-hooks/useScrollToFitScreenDrawer'
import useCloseOnBackButton from '@/hooks/custom-hooks/useCloseOnBackButton'
import AddressDrawerHeader from '@/components/address-drawer/AddressDrawerHeader'
import { Fragment, useEffect, useState } from 'react'
import {
    Box,
    Dialog,
    Drawer,
    Stack,
    useMediaQuery,
    Typography,
    useTheme,
    IconButton,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { styled } from '@mui/material/styles'
import { getAmount } from '@/utils/customFunctions'
import CloseIcon from '@mui/icons-material/Close'
import CustomImageContainer from '@/components/CustomImageContainer'
import NewStoreCard from '../new-store-card/NewStoreCard'
import ProgressBarTimer from './ProgressBarTimer'
import Skeleton from '@mui/material/Skeleton'
import useGetHappyHourStores from '@/hooks/react-query/happy-hour/useGetHappyHourStores'

const HappyHourViewModalStyle = styled(Box)(({ theme }) => ({
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '20px',

    scrollbarWidth: 'thin',
    scrollbarColor: `${theme.palette.neutral[400]} transparent`,

    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'transparent',
        margin: '16px 0',
        borderRadius: '16px',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.neutral[400],
        borderRadius: '16px',
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: theme.palette.neutral[500],
    },
}))

const Sidebar = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.happyHourBanner.bg,
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
    },
}))

const Cover = styled(Box)(({ theme }) => ({
    width: '50%',
    flexShrink: 0,
    aspectRatio: '418 / 178',
    borderRadius: '16px',
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
        width: '100%',
    },
}))

const SidebarContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '20px 20px 32px 20px',
    width: '50%',
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
        width: '100%',
        gap: '16px',
        padding: '16px',
    },
}))

const TimerRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
        order: -1,
    },
}))

const shouldForwardTight = (prop) => prop !== 'tight'

// tight: the 4-segment day case on mobile needs smaller boxes/type to fit
// the drawer width without clipping — see TimerRow's map in Content below.
const TimerBox = styled(Box, { shouldForwardProp: shouldForwardTight })(
    ({ theme, tight }) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tight ? '2px' : '4px',
        backgroundColor: theme.palette.happyHourBanner.timerBg,
        borderRadius: '6px',
        padding: '4px 12px',
        width: '80px',
        [theme.breakpoints.down('sm')]: {
            width: 'auto',
            padding: tight ? '4px 8px' : '6px 12px',
        },
    })
)

const TimerNumber = styled(Typography, {
    shouldForwardProp: shouldForwardTight,
})(({ theme, tight }) => ({
    color: theme.palette.common.white,
    fontWeight: 700,
    fontSize: '24px',
    letterSpacing: '-1.2px',
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
    fontFeatureSettings: '"tnum"',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
        fontSize: tight ? '13px' : '16px',
        letterSpacing: '-0.39px',
    },
}))

const TimerLabel = styled(Typography, {
    shouldForwardProp: shouldForwardTight,
})(({ theme, tight }) => ({
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: 1.3,
    color: theme.palette.common.white,
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
        fontSize: tight ? '11px' : '16px',
    },
}))

const ColonSeparator = styled(Typography, {
    shouldForwardProp: shouldForwardTight,
})(({ theme, tight }) => ({
    color: theme.palette.happyHourBanner.timerColonWarm,
    fontWeight: 700,
    fontSize: '16px',
    letterSpacing: '-0.48px',
    flexShrink: 0,
    [theme.breakpoints.down('sm')]: {
        fontSize: tight ? '13px' : '16px',
    },
}))

const CardGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '20px',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        gap: '24px',
    },
}))

const getRemainingTime = (expireAt) => {
    if (!expireAt) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    }
    const difference = new Date(expireAt).getTime() - Date.now()
    if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    }
    const totalSeconds = Math.floor(difference / 1000)
    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        expired: false,
    }
}

const pad = (value) => String(value).padStart(2, '0')

const HappyHourViewModal = ({ isOpenModal, onCloseModal, activeBogoItem }) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const { handleContentScroll, sheetHeight, sheetRadius } =
        useScrollToFitScreenDrawer(Boolean(isOpenModal))
    useCloseOnBackButton(isMobile && Boolean(isOpenModal), onCloseModal)

    // GET /happy-hour/stores?running=1 — only stores whose window is open
    // right now. Fetched lazily: the query stays idle until the modal opens.
    const { data: storesData, isLoading: storesLoading } =
        useGetHappyHourStores({
            running: true,
            enabled: Boolean(isOpenModal),
        })
    const stores = storesData?.restaurants ?? []

    return (
        <>
            {isMobile ? (
                <Drawer
                    anchor="bottom"
                    open={Boolean(isOpenModal)}
                    onClose={() => onCloseModal()}
                    variant="temporary"
                    sx={{
                        zIndex: 1300,
                        '& .MuiDrawer-paper': {
                            width: { xs: '100vw', sm: '460px', md: '500px' },
                            maxWidth: '100vw',
                            height: { xs: sheetHeight, sm: '100%' },
                            maxHeight: { xs: sheetHeight, sm: '100%' },
                            borderTopLeftRadius: { xs: sheetRadius, sm: 0 },
                            borderTopRightRadius: { xs: sheetRadius, sm: 0 },
                            backgroundColor: (theme) =>
                                theme.palette.background.paper,
                        },
                    }}
                >
                    <Stack sx={{ height: '100%' }}>
                        <AddressDrawerHeader
                            title={t('Happy Hour')}
                            onClose={() => onCloseModal()}
                        />

                        <Box
                            onScroll={handleContentScroll}
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: 'auto',
                                overflowX: 'hidden',
                            }}
                        >
                            <Content
                                activeBogoItem={activeBogoItem}
                                isMobile={isMobile}
                                stores={stores}
                                storesLoading={storesLoading}
                            />
                        </Box>
                    </Stack>
                </Drawer>
            ) : (
                <Dialog
                    open={Boolean(isOpenModal)}
                    onClose={() => onCloseModal()}
                    PaperProps={{
                        sx: {
                            position: 'relative',
                            borderRadius: '20px',
                            width: '900px',
                            maxWidth: '92vw',
                        },
                    }}
                >
                    <IconButton
                        onClick={() => onCloseModal()}
                        aria-label="close"
                        sx={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            zIndex: 1,
                            width: 40,
                            height: 40,
                            p: '8px',
                            borderRadius: '12px',
                        }}
                    >
                        <CloseIcon
                            sx={{
                                fontSize: 20,
                                color: (theme) => theme.palette.text.primary,
                            }}
                        />
                    </IconButton>
                    <HappyHourViewModalStyle>
                        <Content
                            activeBogoItem={activeBogoItem}
                            isMobile={isMobile}
                            stores={stores}
                            storesLoading={storesLoading}
                        />
                    </HappyHourViewModalStyle>
                </Dialog>
            )}
        </>
    )
}

const Content = ({ activeBogoItem, isMobile, stores = [], storesLoading }) => {
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)
    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point

    const minOrderAmount = Number(activeBogoItem?.min_order_amount) || 0
    // Progress base = the full window length; 'T' join because Safari won't
    // parse the backend's space-separated datetime format.
    const windowMinutes = (() => {
        const { started_at, ends_at } = activeBogoItem ?? {}
        if (!started_at || !ends_at) return 60
        const ms =
            new Date(String(ends_at).replace(' ', 'T')).getTime() -
            new Date(String(started_at).replace(' ', 'T')).getTime()
        return ms > 0 ? Math.round(ms / 60000) : 60
    })()

    const [remainingTime, setRemainingTime] = useState(() =>
        getRemainingTime(activeBogoItem?.expire_at)
    )

    useEffect(() => {
        setRemainingTime(getRemainingTime(activeBogoItem?.expire_at))
        const interval = setInterval(() => {
            const remaining = getRemainingTime(activeBogoItem?.expire_at)
            setRemainingTime(remaining)
            if (remaining.expired) clearInterval(interval)
        }, 1000)
        return () => clearInterval(interval)
    }, [activeBogoItem?.expire_at])

    const { days, hours, minutes, seconds, expired } = remainingTime

    // Leading zero units collapse — a day only shows once >0, an hour only
    // once a day or hour is >0 — minutes/seconds always show.
    const showDays = days > 0
    const showHours = showDays || hours > 0
    const timerSegments = [
        ...(showDays ? [{ value: pad(days), label: t('day') }] : []),
        ...(showHours ? [{ value: pad(hours), label: t('hr') }] : []),
        { value: pad(minutes), label: t('min') },
        { value: pad(seconds), label: t('sec') },
    ]
    const tightTimer = isMobile && timerSegments.length > 2

    return (
        <Stack
            sx={{
                gap: isMobile ? '20px' : '32px',
                px: isMobile ? '16px' : '32px',
                py: isMobile ? '20px' : '32px',
            }}
        >
            <Sidebar>
                <Cover>
                    <CustomImageContainer
                        src={activeBogoItem?.cover_image_full_url}
                        alt={activeBogoItem?.title}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                    />
                </Cover>
                <SidebarContent>
                    <Stack sx={{ gap: isMobile ? '4px' : '8px' }}>
                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: isMobile ? '20px' : '24px',
                                letterSpacing: '-1.2px',
                                lineHeight: 1.1,
                                color: (theme) => theme.palette.text.primary,
                            }}
                        >
                            {activeBogoItem?.title || t('25% OFF! Happy Hour')}
                        </Typography>
                        <Typography
                            sx={{
                                fontWeight: 400,
                                fontSize: isMobile ? '12px' : '16px',
                                lineHeight: 1.3,
                                color: (theme) => theme.palette.text.secondary,
                            }}
                        >
                            {activeBogoItem?.description ||
                                t(
                                    'Enjoy happy hour specials on drinks and appetizers.'
                                )}
                        </Typography>
                    </Stack>

                    {!expired && (
                        <TimerRow>
                            {timerSegments.map((segment, index) => (
                                <Fragment key={segment.label}>
                                    {index > 0 && (
                                        <ColonSeparator tight={tightTimer}>
                                            :
                                        </ColonSeparator>
                                    )}
                                    <TimerBox tight={tightTimer}>
                                        <TimerNumber tight={tightTimer}>
                                            {segment.value}
                                        </TimerNumber>
                                        <TimerLabel tight={tightTimer}>
                                            {segment.label}
                                        </TimerLabel>
                                    </TimerBox>
                                </Fragment>
                            ))}
                        </TimerRow>
                    )}
                </SidebarContent>
            </Sidebar>

            <Stack sx={{ gap: '16px' }}>
                <Typography
                    sx={{
                        fontWeight: 700,
                        fontSize: '18px',
                        lineHeight: 1.3,
                        color: (theme) => theme.palette.text.primary,
                    }}
                >
                    {t('Buy These')}
                </Typography>
                {storesLoading ? (
                    <CardGrid>
                        {Array.from({ length: isMobile ? 2 : 3 }).map(
                            (_, i) => (
                                <Stack
                                    key={`store-shimmer-${i}`}
                                    sx={{ gap: '10px' }}
                                >
                                    <Skeleton
                                        variant="rounded"
                                        height={140}
                                        sx={{ borderRadius: '12px' }}
                                    />
                                    <Skeleton variant="text" width="70%" />
                                    <Skeleton variant="text" width="45%" />
                                </Stack>
                            )
                        )}
                    </CardGrid>
                ) : stores.length === 0 ? (
                    <Typography
                        align="center"
                        sx={{
                            py: '24px',
                            fontSize: '14px',
                            color: (theme) => theme.palette.neutral[500],
                        }}
                    >
                        {t('No restaurants are running this offer right now.')}
                    </Typography>
                ) : (
                    <CardGrid>
                        {stores.map((item) => (
                            <NewStoreCard key={item.id} restaurant={item} />
                        ))}
                    </CardGrid>
                )}
            </Stack>
        </Stack>
    )
}

export default HappyHourViewModal
