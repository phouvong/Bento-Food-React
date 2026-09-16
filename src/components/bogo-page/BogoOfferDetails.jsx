import AddressDrawerHeader from '@/components/address-drawer/AddressDrawerHeader'
import BogoStoreOfferCard from '@/components/new-store-card/BogoStoreOfferCard'
import useScrollToFitScreenDrawer from '@/hooks/custom-hooks/useScrollToFitScreenDrawer'
import useCloseOnBackButton from '@/hooks/custom-hooks/useCloseOnBackButton'
import { handleRestaurantRedirect } from '@/utils/customFunctions'
import { RTL } from '@/components/RTL/RTL'
import {
    Box,
    Drawer,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

const BogoOfferDetails = ({
    open,
    onClose,
    bannerImage,
    buyCount,
    getCount,
    validUntil,
    title,
    description,
    storeOffers = [],
    onClickBogoOffer = () => {},
}) => {
    const { t } = useTranslation()
    const router = useRouter()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const { handleContentScroll, sheetHeight, sheetRadius } =
        useScrollToFitScreenDrawer(open)
    useCloseOnBackButton(open, onClose)

    return (
        <RTL direction={theme.direction}>
            <Drawer
                anchor={isMobile ? 'bottom' : 'right'}
                open={open}
                onClose={onClose}
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
                        title={t('BOGO Offer Details')}
                        subtitle={t('Click to see details & grab the offer')}
                        onClose={onClose}
                    />

                    <Box
                        onScroll={handleContentScroll}
                        sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
                    >
                        <Stack
                            sx={{
                                gap: '24px',
                                p: { xs: '16px', sm: '20px' },
                            }}
                        >
                            <Stack sx={{ gap: '12px' }}>
                                <Box
                                    sx={{
                                        width: '100%',
                                        aspectRatio: '300 / 100',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={bannerImage}
                                        alt={title}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </Box>

                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="center"
                                    sx={{
                                        gap: '16px',
                                        width: '100%',
                                        px: '16px',
                                        py: '12px',
                                        borderRadius: '8px',
                                        backgroundColor: (theme) =>
                                            theme.palette.neutral[1800],
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            flex: 1,
                                            minWidth: 0,
                                            fontSize: {
                                                xs: '16px',
                                                sm: '20px',
                                            },
                                            fontWeight: 700,
                                            lineHeight: 1.1,
                                            letterSpacing: '-0.6px',
                                            color: (theme) =>
                                                theme.palette.info.main,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {t('Buy {{buy}} Get {{get}}', {
                                            buy: buyCount,
                                            get: getCount,
                                        })}
                                    </Typography>
                                    {validUntil ? (
                                        <Typography
                                            sx={{
                                                flexShrink: 0,
                                                fontSize: {
                                                    xs: '14px',
                                                    sm: '16px',
                                                },
                                                letterSpacing: '-0.48px',
                                                color: (theme) =>
                                                    theme.palette.text
                                                        .secondary,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {t('Validity')} : {validUntil}
                                        </Typography>
                                    ) : null}
                                </Stack>

                                <Stack
                                    sx={{
                                        gap: '12px',
                                        pt: '4px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography
                                        component="h3"
                                        sx={{
                                            fontSize: '18px',
                                            fontWeight: 700,
                                            lineHeight: 1.1,
                                            letterSpacing: '-0.54px',
                                            color: (theme) =>
                                                theme.palette.text.primary,
                                        }}
                                    >
                                        {title}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '12px',
                                            lineHeight: 1.3,
                                            color: (theme) =>
                                                theme.palette.text.secondary,
                                        }}
                                    >
                                        {description}
                                    </Typography>
                                </Stack>
                            </Stack>

                            <Stack sx={{ gap: '20px' }}>
                                {storeOffers.map((offer) => (
                                    <BogoStoreOfferCard
                                        key={offer.id}
                                        restaurant={offer.restaurant}
                                        buyItems={offer.buyItems}
                                        getItems={offer.getItems}
                                        price={offer.price}
                                        onClick={() =>
                                            onClickBogoOffer(offer)
                                        }
                                        onStoreIconClick={(store) =>
                                            handleRestaurantRedirect(
                                                router,
                                                store?.slug,
                                                store?.id
                                            )
                                        }
                                    />
                                ))}
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </Drawer>
        </RTL>
    )
}

export default BogoOfferDetails
