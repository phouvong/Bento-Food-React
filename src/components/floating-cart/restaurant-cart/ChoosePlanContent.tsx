import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'

import { useSelector } from 'react-redux'

import useGetProPlans from '@/hooks/react-query/pro-plans/useGetProPlans'
import useGetProFaqs, {
    resolveFaq,
    toFaqList,
} from '@/hooks/react-query/pro-plans/useGetProFaqs'
import ProTermsModal from '@/components/user-info/subscription/ProTermsModal'
import { getAmount } from '@/utils/customFunctions'

// `PlanDuration` is the strict shape parents receive on subscribe; mirrors the
// type previously exported by ProPlanSubscriptionModal so existing consumers
// stay compatible.
export interface PlanDuration {
    id: string
    label: string
    days: number
    price: number
    title: string
}

interface Benefit {
    title: string
    description: string
}

interface ChoosePlanContentProps {
    t: (key: string) => string
    onSubscribe?: (plan: PlanDuration) => void
    // When true, hide the "Choose Your Plan" heading + tagline — useful when
    // the parent already provides its own page header.
    hideHeading?: boolean
    // Optional override for the primary CTA. Defaults to "Subscribe Now",
    // but switches to "Start Free Trial" automatically when the selected
    // plan's price is 0 (matches the page-level free-trial design).
    ctaLabel?: string
    // 'stacked' = original modal layout (one outer card, benefits on top of
    // duration/price). 'split' = the profile-page layout from the screenshot:
    // two separate side-by-side cards (benefits left, duration/price/CTA right).
    layout?: 'stacked' | 'split'
    // When true, the CTA button shows a spinner and is disabled. Driven by the
    // parent's `useSubscribeProPlan` loading flag — used primarily for the
    // free-trial path, which subscribes inline without a payment-method modal.
    isSubmitting?: boolean
    // When true, drops every plan whose price is 0 (free trial). Used by the
    // renew / change-plan flow so a customer already on the trial can't pick
    // it again.
    hideFreePlans?: boolean
    // ID of the customer's currently active plan. When set, the CTA reads
    // "Subscribe" (renew) for that plan and "Shift Plan" for every other
    // plan. Leave undefined for the first-time subscription flow so the
    // legacy "Subscribe Now" / "Start Free Trial" copy is preserved.
    activePlanId?: string
}

const FALLBACK_BENEFITS: Benefit[] = [
    {
        title: 'Discount on all orders',
        description: 'Get 10% off on all orders',
    },
    {
        title: 'Free delivery',
        description: 'Enjoy unlimited free deliveries',
    },
    {
        title: 'Exclusive coupon on order',
        description: 'Unlock exclusive coupon deals for all orders',
    },
]

interface ApiPlan {
    id?: string | number
    plan_name?: string
    plan_type?: string
    price?: number | string
    duration?: number | string
    duration_label?: string
    status?: number
}

interface ApiBenefitsObject {
    active_type?: string
    discount?: {
        active?: number
        percentage?: number | string
        max_amount?: number | string
        min_order_status?: number
        min_order_amount?: number | string
    }
    delivery_fee?: {
        active?: number
        offer_type?: string
        min_order_status?: number
        min_order_amount?: number | string | null
        charge_discount_percentage?: number | string | null
    }
    coupon?: {
        active?: number
    }
}

interface ApiPlansResponse {
    pro_member_status?: number
    pro_brand?: string
    plans?: ApiPlan[]
    benefits?: ApiBenefitsObject
}

const toNumber = (v: unknown, fallback = 0): number => {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
}

const mapApiPlan = (raw: ApiPlan): PlanDuration => {
    const days = toNumber(raw.duration, 0)
    return {
        id: String(raw.id ?? ''),
        days,
        price: toNumber(raw.price, 0),
        title: String(raw.plan_name ?? ''),
        label: String(
            raw.duration_label ?? `${String(days).padStart(2, '0')} Days`
        ),
    }
}

const mapBenefitsObject = (b: ApiBenefitsObject | undefined): Benefit[] => {
    if (!b) return []
    const out: Benefit[] = []

    if (b.discount?.active === 1) {
        const pct = toNumber(b.discount.percentage, 0)
        const max = toNumber(b.discount.max_amount, 0)
        out.push({
            title: 'Discount on all orders',
            description: max
                ? `Get ${pct}% off on all orders (up to $${max})`
                : `Get ${pct}% off on all orders`,
        })
    }

    if (b.delivery_fee?.active === 1) {
        const fullFree = b.delivery_fee.offer_type === 'full_free'
        const pct = toNumber(b.delivery_fee.charge_discount_percentage, 0)
        out.push({
            title: 'Free delivery',
            description: fullFree
                ? 'Enjoy unlimited free deliveries'
                : `Get ${pct}% off delivery fee`,
        })
    }

    if (b.coupon?.active === 1) {
        out.push({
            title: 'Exclusive coupon on order',
            description: 'Unlock exclusive coupon deals for all orders',
        })
    }

    return out
}

const PURPLE = '#8B5CF6'
const PURPLE_DARK = '#7C3AED'
const LIGHT_PURPLE = '#EDE7FF'
const NEUTRAL_BG = '#F3F4F6'
const GREEN = '#22C55E'
const ORANGE = '#F59E0B'

const ChoosePlanContent: React.FC<ChoosePlanContentProps> = ({
    t,
    onSubscribe,
    hideHeading = false,
    ctaLabel,
    layout = 'stacked',
    isSubmitting = false,
    hideFreePlans = false,
    activePlanId,
}) => {
    const { data: plansResponse, isLoading: plansLoading } = useGetProPlans()

    const response: ApiPlansResponse = useMemo(() => {
        const raw =
            (plansResponse as { data?: ApiPlansResponse } | undefined)?.data ??
            (plansResponse as ApiPlansResponse | undefined) ??
            {}
        return raw && typeof raw === 'object' ? raw : {}
    }, [plansResponse])

    const plans: PlanDuration[] = useMemo(() => {
        const list = Array.isArray(response.plans) ? response.plans : []
        return list
            .filter((p) => p.status === undefined || p.status === 1)
            .map(mapApiPlan)
            .filter((p) => !hideFreePlans || p.price > 0)
    }, [response, hideFreePlans])

    const benefits: Benefit[] = useMemo(() => {
        const mapped = mapBenefitsObject(response.benefits)
        return mapped.length > 0 ? mapped : FALLBACK_BENEFITS
    }, [response])

    const headerTitle = response.pro_brand ?? 'StackFood Pro'
    const headerSubtitle = 'Save more on every order'

    const theme = useTheme()
    const { global } = useSelector(
        (state: { globalSettings: { global?: Record<string, unknown> } }) =>
            state.globalSettings
    )
    const currencySymbol = global?.currency_symbol as string | undefined
    const currencySymbolDirection = global?.currency_symbol_direction as
        | string
        | undefined
    const digitAfterDecimalPoint = global?.digit_after_decimal_point as
        | number
        | undefined

    // FAQ + Terms surface inside the modal (stacked layout) only — the page
    // already renders these sections itself in the split layout.
    const { data: faqsRaw } = useGetProFaqs()
    const faqs = toFaqList(faqsRaw)
        .map(resolveFaq)
        .filter((f) => f.question.length > 0 || f.answer.length > 0)
    const [termsOpen, setTermsOpen] = useState(false)

    const [selectedId, setSelectedId] = useState<string>('')
    useEffect(() => {
        if (plans.length > 0 && !plans.some((p) => p.id === selectedId)) {
            const fallback =
                plans.find((p) => p.days === 30) ??
                plans[Math.min(1, plans.length - 1)]
            setSelectedId(fallback.id)
        }
    }, [plans, selectedId])

    // Center the active pill inside the horizontally-scrollable duration bar
    // whenever selection changes (or plans first arrive). Uses the rendered
    // child's offset so it works even when the row overflows the viewport.
    const durationScrollRef = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        const container = durationScrollRef.current
        if (!container || !selectedId) return
        const target = container.querySelector<HTMLElement>(
            `[data-plan-id="${selectedId}"]`
        )
        if (!target) return
        const offset =
            target.offsetLeft -
            container.clientWidth / 2 +
            target.clientWidth / 2
        container.scrollTo({ left: offset, behavior: 'smooth' })
    }, [selectedId, plans])

    // Hide the chevron buttons when the duration row fits entirely without
    // scrolling, or when the user has already scrolled to either edge.
    // Recomputed on mount, when plans render, on scroll, and on resize.
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)
    useEffect(() => {
        const el = durationScrollRef.current
        if (!el) return
        const update = () => {
            // 1px tolerance — browsers occasionally report fractional
            // scrollLeft / scrollWidth that would otherwise leave the
            // arrows visible at the edges.
            setCanScrollLeft(el.scrollLeft > 1)
            setCanScrollRight(
                el.scrollLeft + el.clientWidth < el.scrollWidth - 1
            )
        }
        update()
        el.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)
        return () => {
            el.removeEventListener('scroll', update)
            window.removeEventListener('resize', update)
        }
    }, [plans])

    const selectedPlan =
        plans.find((p) => p.id === selectedId) ?? plans[0] ?? null

    // Renew / shift-plan flow: when the parent passes the customer's current
    // active plan id, the CTA reads "Subscribe" for that plan (renew) and
    // "Shift Plan" for every other selection. Free-trial copy still wins
    // when the selected plan's price is 0.
    const isRenewFlow = Boolean(activePlanId)
    const isActivePlanSelected =
        isRenewFlow && selectedPlan?.id === activePlanId
    const renewOrShiftLabel = isActivePlanSelected
        ? t('Renew')
        : t('Shift Plan')

    const buttonLabel =
        ctaLabel ??
        (selectedPlan && selectedPlan.price === 0
            ? t('Start Free Trial')
            : isRenewFlow
            ? renewOrShiftLabel
            : t('Subscribe Now'))

    const heading = !hideHeading && (
        <Stack alignItems="center" spacing={0.5}>
            <Typography fontSize="20px" fontWeight={700} textAlign="center">
                {t('Choose Your Plan')}
            </Typography>
            <Typography
                fontSize="13px"
                color="text.secondary"
                textAlign="center"
            >
                {t(
                    'Unlock exclusive benefits, save more on every order, and enjoy free deliveries.'
                )}
            </Typography>
        </Stack>
    )

    // Crown circle + brand title + subtitle. Same in both layouts; only the
    // alignment differs (centered in stacked, left-aligned in split).
    const brandHeader = (
        <Stack
            alignItems={'center'}
            spacing={1}

        >
            <Box
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: ORANGE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <EmojiEventsRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
            </Box>
            <Stack
                alignItems={layout === 'split' ? 'flex-start' : 'center'}
                spacing={0.25}
                sx={{ mt: 0.25 }}
            >
                <Typography
                    fontSize="16px"
                    fontWeight={400}
                    color="text.primary"
                >
                    {t(headerTitle)}
                </Typography>
                <Typography fontSize="14px" color="text.secondary">
                    {t(headerSubtitle)}
                </Typography>
            </Stack>
        </Stack>
    )

    const benefitsList = (
        <Stack spacing={1.75}>
            {plansLoading && benefits === FALLBACK_BENEFITS
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Stack
                        key={`benefit-skel-${i}`}
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                    >
                        <Skeleton variant="circular" width={22} height={22} />
                        <Stack spacing={0.25} sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="80%" />
                        </Stack>
                    </Stack>
                ))
                : benefits.map((b: Benefit) => (
                    <Stack
                        key={b.title}
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                    >
                        <Box
                            sx={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                backgroundColor: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                mt: '1px',
                            }}
                        >
                            <CheckRoundedIcon
                                sx={{ color: GREEN, fontSize: 16 }}
                            />
                        </Box>
                        <Stack spacing={0.25}>
                            <Typography
                                fontSize="16px"
                                fontWeight={400}
                                color="text.primary"
                            >
                                {t(b.title)}
                            </Typography>
                            <Typography
                                fontSize="14px"
                                color="text.secondary"
                            >
                                {t(b.description)}
                            </Typography>
                        </Stack>
                    </Stack>
                ))}
        </Stack>
    )

    const durationSelector = (
        <Stack spacing={1}>
            <Typography
                fontSize="13px"
                fontWeight={500}
                color="text.primary"
            >
                {t('Select duration')}
            </Typography>
            <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ minWidth: 0 }}
            >
                {canScrollLeft && (
                    <IconButton
                        aria-label="scroll left"
                        onClick={() => {
                            const el = durationScrollRef.current
                            if (el) {
                                el.scrollBy({
                                    left: -Math.max(120, el.clientWidth * 0.6),
                                    behavior: 'smooth',
                                })
                            }
                        }}
                        sx={{
                            flexShrink: 0,
                            width: 32,
                            height: 32,
                            border: (theme) =>
                                `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                )}
                <Box
                    ref={durationScrollRef}
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexWrap: 'nowrap',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                        p: 0.75,
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? '#192238'
                                : NEUTRAL_BG,
                        borderRadius: '14px',
                    }}
                >
                {plansLoading && plans.length === 0
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <Box
                            key={`skeleton-${i}`}
                            sx={{
                                flexShrink: 0,
                                py: 1.5,
                                px: 1,
                            }}
                        >
                            <Skeleton variant="rounded" height={20} />
                        </Box>
                    ))
                    : plans.map((plan) => {
                        const isSelected = plan.id === selectedId
                        return (
                            <Box
                                key={plan.id}
                                data-plan-id={plan.id}
                                onClick={() => setSelectedId(plan.id)}
                                sx={{
                                    flexShrink: 0,
                                    py: 1.5,
                                    px: 1,
                                    whiteSpace: 'nowrap',
                                    borderRadius: '10px',
                                    textAlign: 'center',
                                    fontSize: '13px',
                                    fontWeight: isSelected ? 700 : 500,
                                    cursor: 'pointer',
                                    backgroundColor: (theme) =>
                                        isSelected
                                            ? theme.palette.background.paper
                                            : 'transparent',
                                    color: (theme) =>
                                        isSelected
                                            ? PURPLE
                                            : theme.palette.text.primary,
                                    boxShadow: isSelected
                                        ? '0 1px 2px rgba(0,0,0,0.06)'
                                        : 'none',
                                    userSelect: 'none',
                                    transition:
                                        'background-color 120ms, color 120ms',
                                }}
                            >
                                {plan.label}
                            </Box>
                        )
                    })}
                </Box>
                {canScrollRight && (
                    <IconButton
                        aria-label="scroll right"
                        onClick={() => {
                            const el = durationScrollRef.current
                            if (el) {
                                el.scrollBy({
                                    left: Math.max(120, el.clientWidth * 0.6),
                                    behavior: 'smooth',
                                })
                            }
                        }}
                        sx={{
                            flexShrink: 0,
                            width: 32,
                            height: 32,
                            border: (theme) =>
                                `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                )}
            </Stack>
        </Stack>
    )

    const priceCard = (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
                backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'rgba(139, 92, 246, 0.18)'
                        : LIGHT_PURPLE,
                borderRadius: '12px',
                px: 2,
                py: 1,
            }}
        >
            {selectedPlan ? (
                <>
                    <Typography
                        fontSize="14px"
                        fontWeight={700}
                        color="text.primary"
                    >
                        {selectedPlan.price === 0
                            ? t('Free Trial')
                            : t(selectedPlan.title)}
                    </Typography>
                    <Stack
                        direction="row"
                        alignItems="baseline"
                        spacing={0.5}
                    >
                        <Typography
                            fontSize="28px"
                            fontWeight={800}
                            color="text.primary"
                        >
                            {getAmount(
                                selectedPlan.price,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                        </Typography>
                        <Typography fontSize="12px" color="text.secondary">
                            / {selectedPlan.days} {t('days')}
                        </Typography>
                    </Stack>
                </>
            ) : (
                <Skeleton variant="text" width="100%" height={40} />
            )}
        </Stack>
    )

    const isFreeTrial = selectedPlan?.price === 0
    const ctaButton = (
        <Button
            fullWidth={!isFreeTrial}
            variant="contained"
            disabled={!selectedPlan || isSubmitting}
            onClick={() => selectedPlan && onSubscribe?.(selectedPlan)}
            sx={{
                background: isFreeTrial
                    ? '#111827'
                    : `linear-gradient(90deg, ${PURPLE} 0%, #A78BFA 100%)`,
                // Free-trial CTA renders as a compact, centered pill instead of
                // the full-width gradient button used for paid plans.
                width: isFreeTrial ? '270px' : undefined,
                maxWidth: isFreeTrial ? '100%' : undefined,
                alignSelf: isFreeTrial ? 'center' : undefined,
                mx: isFreeTrial ? 'auto' : undefined,
                mt: 2,
                height: '40px',
                minHeight: '40px',
                py: 0,
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '6px',
                boxShadow: 'none',
                color: '#fff',
                '&:hover': {
                    background: isFreeTrial
                        ? '#000'
                        : `linear-gradient(90deg, ${PURPLE_DARK} 0%, ${PURPLE} 100%)`,
                    boxShadow: 'none',
                },
                '&.Mui-disabled': {
                    color: '#fff',
                    opacity: 0.85,
                },
            }}
        >
            {isSubmitting ? (
                <CircularProgress size={18} color="inherit" />
            ) : (
                buttonLabel
            )}
        </Button>
    )

    if (layout === 'split') {
        return (
            <Stack spacing={2}>
                {heading}
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems="stretch"
                >
                    <Box
                        sx={{
                            flex: 1,
                            backgroundColor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'rgba(139, 92, 246, 0.15)'
                                    : LIGHT_PURPLE,
                            borderRadius: '14px',

                        }}
                    >
                        <Stack spacing={2.25}>
                            <Box
                                sx={{
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.04)'
                                            : 'rgba(255, 255, 255, 0.45)',
                                    borderBottomLeftRadius: '14px',
                                    borderBottomRightRadius: '14px',
                                    px: 2.5,
                                    pt: 2.5,
                                    pb: 2.5,
                                }}
                            >
                                {brandHeader}
                            </Box>
                            <Box
                                sx={{ px: 2.5, py: 2.25 }}>
                                {benefitsList}
                            </Box>

                        </Stack>
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            backgroundColor: (theme) =>
                                theme.palette.background.paper,
                            border: (theme) =>
                                `1px solid ${theme.palette.divider}`,
                            borderRadius: '14px',
                            p: 2.5,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                            {durationSelector}
                            {priceCard}
                            {ctaButton}
                        </Stack>
                    </Box>
                </Stack>
            </Stack>
        )
    }

    return (
        <Stack spacing={2}>
            {heading}
            <Box
                sx={{
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: '14px',
                    overflow: 'hidden',
                    
                }}
            >
                <Box
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(139, 92, 246, 0.15)'
                                : LIGHT_PURPLE,
                                
                    }}
                >
                    <Box
                        sx={{
                            backgroundColor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.04)'
                                    : 'rgba(255, 255, 255, 0.45)',
                            borderBottomLeftRadius: '14px',
                            borderBottomRightRadius: '14px',
                            px: 2.5,
                            pt: 2.5,
                            pb: 2.5,
                        }}
                    >
                        {brandHeader}
                    </Box>
                    <Box sx={{ px: 2.5, py: 2.25 }}>{benefitsList}</Box>
                </Box>
                <Stack
                    spacing={2}
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.background.paper,
                        px: 2.5,
                        py: 2.5,
                    }}
                >
                    {durationSelector}
                    {priceCard}
                    {ctaButton}
                </Stack>
            </Box>

            {faqs.length > 0 && (
                <Box
                    sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '16px',
                        p: 2,
                    }}
                >
                    <Typography
                        fontWeight={700}
                        mb={1.25}
                        color="text.primary"
                    >
                        {t('Frequently Asked Questions')}
                    </Typography>
                    <Stack>
                        {faqs.map((faq, i) => (
                            <Accordion
                                key={i}
                                disableGutters
                                elevation={0}
                                sx={{
                                    background: 'transparent',
                                    '&:before': { display: 'none' },
                                    borderBottom:
                                        i < faqs.length - 1
                                            ? `1px solid ${theme.palette.divider}`
                                            : 'none',
                                    // Constrain long answer text so it never
                                    // overflows the modal width on narrow
                                    // screens; the FloatingCart drawer renders
                                    // this in a tighter container than the
                                    // full-page Subscription view.
                                    '& .MuiAccordionDetails-root': {
                                        wordBreak: 'break-word',
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreRoundedIcon />}
                                    sx={{ px: 0 }}
                                >
                                    <Typography
                                        fontSize="14px"
                                        color="text.primary"
                                        sx={{
                                            wordBreak: 'break-word',
                                            pr: 1,
                                        }}
                                    >
                                        {faq.question}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ px: 0, pt: 0 }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ wordBreak: 'break-word' }}
                                    >
                                        {faq.answer}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Stack>
                </Box>
            )}

            <Divider />
            <Typography
                textAlign="center"
                sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => setTermsOpen(true)}
            >
                {t('Terms and Condition')}
            </Typography>

            <ProTermsModal
                open={termsOpen}
                onClose={() => setTermsOpen(false)}
            />
        </Stack>
    )
}

export default ChoosePlanContent
