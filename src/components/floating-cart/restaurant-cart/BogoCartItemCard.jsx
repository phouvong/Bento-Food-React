import { Box, Stack, Typography, styled, alpha } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CustomImageContainer from '@/components/CustomImageContainer'
import CircularLoader from '@/components/loader/CircularLoader'

const CardRoot = styled(Stack)(() => ({
    gap: '12px',
    width: '100%',
}))

const NameText = styled(Typography)(({ theme }) => ({
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.1,
    letterSpacing: '-0.42px',
    color: theme.palette.text.primary,
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}))

const PriceRow = styled(Stack)(() => ({
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '4px',
}))

const CurrentPrice = styled(Typography)(({ theme }) => ({
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.54px',
    color: theme.palette.text.primary,
}))

const OldPrice = styled(Typography)(({ theme }) => ({
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '-0.48px',
    color: theme.palette.text.secondary,
    textDecoration: 'line-through',
}))

const GroupLabel = styled(Typography)(({ theme }) => ({
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.24px',
    color: theme.palette.text.secondary,
}))

const AvatarSlot = styled(Box)(() => ({
    position: 'relative',
    width: '36px',
    height: '36px',
    flexShrink: 0,
    borderRadius: '6px',
    overflow: 'hidden',
    '&:not(:last-of-type)': { marginRight: '-12px' },
}))

const AvatarImageFill = styled(Box)(({ theme }) => ({
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    borderRadius: '6px',
    overflow: 'hidden',
    border: `2px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.neutral[200],
}))

const AvatarOverflow = styled(Box)(({ theme }) => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    backgroundColor: theme.palette.background.paper,
    fontSize: '14px',
    fontWeight: 700,
    color: theme.palette.text.secondary,
}))

// Same 32px badge CheckoutItemRow uses for a regular food line's quantity —
// keeps the read-only bogo row visually consistent with its neighbors there.
const QuantityBadge = styled(Stack)(({ theme }) => ({
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: theme.palette.neutral[200],
    flexShrink: 0,
}))

const StepperShell = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: '6px',
    padding: '3.2px 8px',
    borderRadius: '9999px',
    backgroundColor:
        theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.12)'
            : theme.palette.neutral[300],
}))

const StepperBtn = styled(Box)(({ theme }) => ({
    width: '26px',
    height: '26px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    color: theme.palette.text.primary,
    '& i': { fontSize: 13, lineHeight: 1 },
    '&:hover': {
        backgroundColor:
            theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.16)'
                : 'rgba(0, 0, 0, 0.06)',
    },
}))

// items: [{ id, image }] — only the first 2 render as avatars; anything
// beyond that collapses into a single "+N" slot, per Figma (max 2 shown).
const AvatarStack = ({ label, items }) => {
    const visible = items.slice(0, 2)
    const overflowCount = items.length > 2 ? items.length - 2 : 0

    return (
        <Stack sx={{ gap: '4px', alignItems: 'flex-start' }}>
            <GroupLabel>{label}</GroupLabel>
            <Stack direction="row" alignItems="center">
                {visible.map((item, index) => (
                    <AvatarSlot key={item.id ?? index}>
                        <AvatarImageFill>
                            <CustomImageContainer
                                src={item.image}
                                alt=""
                                width="100%"
                                height="100%"
                                objectFit="cover"
                            />
                        </AvatarImageFill>
                    </AvatarSlot>
                ))}
                {overflowCount > 0 && (
                    <AvatarSlot>
                        <AvatarOverflow>+{overflowCount}</AvatarOverflow>
                    </AvatarSlot>
                )}
            </Stack>
        </Stack>
    )
}

const BogoCartItemCard = ({
    name,
    price,
    oldPrice,
    buyItems = [],
    freeItems = [],
    quantity = 1,
    onIncrement,
    onDecrement,
    updating = false,
    // Checkout's order-summary row shows the same bundle line display-only —
    // no +/-, just the quantity count, top-aligned next to the name like
    // CheckoutItemRow's own badge instead of sitting by the avatars.
    hideStepper = false,
}) => {
    const { t } = useTranslation()

    return (
        <CardRoot>
            <Stack
                direction="row"
                alignItems="flex-start"
                sx={{ gap: '8px', width: '100%' }}
            >
                <Stack sx={{ gap: '8px', flex: 1, minWidth: 0 }}>
                    <NameText>{name}</NameText>
                    <PriceRow>
                        <CurrentPrice>{price}</CurrentPrice>
                        {oldPrice && <OldPrice>{oldPrice}</OldPrice>}
                    </PriceRow>
                </Stack>
                {hideStepper && (
                    <QuantityBadge>
                        <Typography
                            sx={{
                                fontSize: '16px',
                                fontWeight: 700,
                                color: (theme) => theme.palette.text.primary,
                            }}
                        >
                            {quantity}
                        </Typography>
                    </QuantityBadge>
                )}
            </Stack>

            <Stack
                direction="row"
                alignItems="flex-end"
                sx={{ gap: '16px', width: '100%' }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{ flex: 1, minWidth: 0, gap: '12px' }}
                >
                    {buyItems.length > 0 && (
                        <AvatarStack
                            label={t('Buying Item')}
                            items={buyItems}
                        />
                    )}
                    {freeItems.length > 0 && (
                        <AvatarStack label={t('Free Item')} items={freeItems} />
                    )}
                </Stack>

                {!hideStepper && (
                    <StepperShell>
                        <StepperBtn
                            onClick={updating ? undefined : onDecrement}
                            role="button"
                            aria-label={quantity <= 1 ? 'remove' : 'decrement'}
                            aria-disabled={updating}
                            sx={{
                                ...(updating
                                    ? { cursor: 'default', opacity: 0.5 }
                                    : undefined),
                                ...(quantity <= 1
                                    ? {
                                          color: (theme) =>
                                              theme.palette.error.main,
                                          '&:hover': {
                                              backgroundColor: (theme) =>
                                                  alpha(
                                                      theme.palette.error.main,
                                                      0.1
                                                  ),
                                          },
                                      }
                                    : undefined),
                            }}
                        >
                            <i
                                className={
                                    quantity <= 1
                                        ? 'fi fi-rr-trash'
                                        : 'fi fi-rr-minus'
                                }
                            />
                        </StepperBtn>
                        <Box
                            sx={{
                                width: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                fontSize: '16px',
                                fontWeight: 700,
                                letterSpacing: '-0.48px',
                                color: (theme) => theme.palette.text.primary,
                            }}
                        >
                            {updating ? (
                                <CircularLoader size="14px" color="primary" />
                            ) : (
                                quantity
                            )}
                        </Box>
                        <StepperBtn
                            onClick={updating ? undefined : onIncrement}
                            role="button"
                            aria-label="increment"
                            aria-disabled={updating}
                            sx={
                                updating
                                    ? { cursor: 'default', opacity: 0.5 }
                                    : undefined
                            }
                        >
                            <i className="fi fi-br-plus" />
                        </StepperBtn>
                    </StepperShell>
                )}
            </Stack>
        </CardRoot>
    )
}

export default BogoCartItemCard
