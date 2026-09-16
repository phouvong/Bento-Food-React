import CustomImageContainer from '@/components/CustomImageContainer'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Stack, Typography, alpha, styled } from '@mui/material'
import { useTranslation } from 'react-i18next'

const CardRoot = styled(Box)(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '4px',
    borderRadius: '16px',
    backgroundColor: theme.palette.neutral[1800],
    cursor: 'pointer',
}))

const ProductRow = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
    minHeight: '114px',
    padding: '12px 16px 12px 12px',
    borderRadius: '12px',
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: {
        padding: '10px 12px 10px 10px',
    },
}))

const ClustersWrap = styled(Stack)(() => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    flexShrink: 0,
}))

// Square, always — the "image ratio 1" requirement — and fluid across
// breakpoints instead of Figma's fixed 90px so it scales down gracefully.
const ClusterBox = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'repeat(2, 1fr)',
    gap: '2px',
    width: '90px',
    aspectRatio: '1 / 1',
    flexShrink: 0,
    [theme.breakpoints.down('md')]: { width: '78px' },
    [theme.breakpoints.down('sm')]: { width: '64px' },
}))

const ClusterCell = styled(Box)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '6px',
    backgroundColor: theme.palette.neutral[1800],
}))

const OverflowOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(theme.palette.common.black, 0.6),
    color: theme.palette.common.white,
    fontSize: '14px',
    fontWeight: 700,
}))

const CountBadge = styled(Box)(({ theme }) => ({
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
    padding: '6px 8px',
    borderRadius: '6px',
    backgroundColor: theme.palette.neutral[1800],
    color: theme.palette.text.primary,
    fontSize: '16px',
    fontWeight: 400,
    letterSpacing: '-0.48px',
    whiteSpace: 'nowrap',
    boxShadow: `0px 0px 8px 0px ${alpha(theme.palette.common.black, 0.1)}`,
}))

const LogoWrap = styled(Box)(({ theme }) => ({
    width: '40px',
    height: '40px',
    flexShrink: 0,
    borderRadius: '50%',
    overflow: 'hidden',
    // Figma's ring is the card's own background color (white in light mode),
    // not a divider line — it's meant to separate the logo from the grey
    // outer card, so it must track background.paper, not a fixed grey.
    border: `1px solid ${theme.palette.background.paper}`,
    backgroundColor: theme.palette.neutral[200],
}))

const ArrowBtn = styled(Box)(({ theme }) => ({
    flexShrink: 0,
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    color: theme.palette.text.primary,
    ...(theme.direction === 'rtl' && { transform: 'scaleX(-1)' }),
}))

// Which grid cell (column/row) a given image occupies, for a cluster of
// `total` visible cells — the one rule that makes 1/2/3-4 all "just work"
// off a single square grid instead of three different layouts.
const getCellPosition = (index, total) => {
    if (total === 1) return { gridColumn: '1 / span 2', gridRow: '1 / span 2' }
    if (total === 2) return { gridColumn: index + 1, gridRow: '1 / span 2' }
    return { gridColumn: (index % 2) + 1, gridRow: Math.floor(index / 2) + 1 }
}

const ItemCluster = ({ items }) => {
    const visible = items.slice(0, 4)
    const overflowCount = items.length > 4 ? items.length - 4 : 0

    return (
        <ClusterBox>
            {visible.map((item, index) => {
                const isLastVisible = index === visible.length - 1
                return (
                    <ClusterCell
                        key={item.id ?? item.food_id ?? index}
                        sx={getCellPosition(index, visible.length)}
                    >
                        <CustomImageContainer
                            src={item.image ?? item.image_full_url}
                            alt={item.name || ''}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                        />
                        {isLastVisible && overflowCount > 0 && (
                            <OverflowOverlay>+{overflowCount}</OverflowOverlay>
                        )}
                    </ClusterCell>
                )
            })}
        </ClusterBox>
    )
}

// restaurant: { name, logoUrl, deliveryTime, distance_label }
// buyItems / getItems: [{ id | food_id, image | image_full_url, name }] —
// lengths ARE the "x"/"y" counts
const BogoStoreOfferCard = ({
    restaurant,
    buyItems = [],
    getItems = [],
    price,
    onClick,
    onStoreIconClick,
}) => {
    const { t } = useTranslation()
    if (!restaurant || (!buyItems.length && !getItems.length)) return null

    const { name, logoUrl, deliveryTime, distance_label } = restaurant

    return (
        <CardRoot
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onClick?.()
            }}
        >
            <ProductRow>
                <ClustersWrap>
                    <ItemCluster items={buyItems} />
                    <ItemCluster items={getItems} />
                    <CountBadge>
                        {buyItems.length} + {getItems.length}
                    </CountBadge>
                </ClustersWrap>

                <Stack
                    sx={{ flex: 1, minWidth: 0, gap: '5px', textAlign: 'end' }}
                >
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 500,
                            letterSpacing: '-0.42px',
                            color: (theme) => theme.palette.text.secondary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {t('Only at')}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: { xs: '16px', sm: '20px' },
                            fontWeight: 700,
                            letterSpacing: '-0.6px',
                            color: (theme) => theme.palette.text.primary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {price}
                    </Typography>
                </Stack>
            </ProductRow>

            {/* restaurant info */}
            <Stack
                direction="row"
                alignItems="center"
                sx={{ gap: '8px', pl: '12px', pr: '8px', py: '8px' }}
            >
                <LogoWrap>
                    <CustomImageContainer
                        src={logoUrl}
                        alt={name}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                    />
                </LogoWrap>

                <Stack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
                    <Typography
                        component="h4"
                        sx={{
                            fontSize: '16px',
                            fontWeight: 700,
                            letterSpacing: '-0.48px',
                            color: (theme) => theme.palette.text.primary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {name}
                    </Typography>
                    {(deliveryTime || distance_label) && (
                        <Stack direction="row" alignItems="center" gap="4px">
                            <AccessTimeOutlinedIcon
                                sx={{
                                    fontSize: 14,
                                    color: (theme) =>
                                        theme.palette.text.secondary,
                                }}
                            />
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: (theme) =>
                                        theme.palette.text.secondary,
                                }}
                            >
                                {deliveryTime}
                            </Typography>
                            {distance_label && (
                                <Typography
                                    component="span"
                                    sx={{
                                        fontSize: 14,
                                        fontWeight: 400,
                                        color: (theme) =>
                                            theme.palette.text.secondary,
                                    }}
                                >
                                    {deliveryTime ? ' (' : ''}
                                    {distance_label}
                                    {deliveryTime ? ')' : ''}
                                </Typography>
                            )}
                        </Stack>
                    )}
                </Stack>

                <ArrowBtn
                    onClick={(e) => {
                        e.stopPropagation()
                        onStoreIconClick?.(restaurant)
                    }}
                >
                    <ArrowForwardIcon sx={{ fontSize: 20 }} />
                </ArrowBtn>
            </Stack>
        </CardRoot>
    )
}

export default BogoStoreOfferCard
