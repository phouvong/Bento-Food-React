import React from 'react'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useQueryClient } from 'react-query'
import { useRouter } from 'next/router'
import moment from 'moment'
import toast from 'react-hot-toast'

import { ProfileApi } from '@/hooks/react-query/config/profileApi'
import { setUser } from '@/redux/slices/customer'
import useGetProActiveOffer from '@/hooks/react-query/pro-plans/useGetProActiveOffer'
import useGetProFaqs, {
    resolveFaq,
    toFaqList,
} from '@/hooks/react-query/pro-plans/useGetProFaqs'
import useSubscribeProPlan from '@/hooks/react-query/pro-plans/useSubscribeProPlan'
import useCancelProPlan from '@/hooks/react-query/pro-plans/useCancelProPlan'
import useGetProPlans from '@/hooks/react-query/pro-plans/useGetProPlans'
import { getAmount } from '@/utils/customFunctions'
import ChoosePlanContent, {
    PlanDuration,
} from '@/components/floating-cart/restaurant-cart/ChoosePlanContent'
import ProTermsModal from './ProTermsModal'
import RenewSubscriptionModal from './RenewSubscriptionModal'
import ProPlanSubscriptionModal from '@/components/floating-cart/restaurant-cart/ProPlanSubscriptionModal'
import CancelSubscriptionModal from './CancelSubscriptionModal'
import CustomModalRaw from '@/components/custom-modal/CustomModal'
import AllPaymentMethodRaw from '@/components/checkout-page/AllPaymentMethod'
import Meta from '../../Meta'
import { replace } from 'lodash'

// The JS components don't list every prop in their destructure (e.g.
// `handleClose`, `setPaymenMethod` are read off `...rest`), so their inferred
// prop type is too narrow. Cast to a permissive type — these are stable JS
// components in this repo and the prop contract is already used as-is by
// FloatingCart.
const CustomModal = CustomModalRaw as unknown as React.ComponentType<
    Record<string, unknown> & { children?: React.ReactNode }
>
const AllPaymentMethod = AllPaymentMethodRaw as unknown as React.ComponentType<
    Record<string, unknown>
>

// Known fields on /api/v1/customer/pro-customer/active-offer. Every key is
// optional because the backend may not yet return the full screenshot data —
// the UI degrades to "—" instead of crashing.
type ApiBenefit = {
    type?: string
    subscription_id?: number | string
    plan_id?: number | string
    percentage?: number | string
    max_amount?: number | string
    min_order_status?: number | string
    min_order_amount?: number | string
    // delivery_fee benefits carry these extra keys.
    offer_type?: string
    charge_discount_percentage?: number | string
}

// Stackfood returns plan info under `plan_details` with `start_at` /
// `end_at` / `total_orders`. Older/sibling backends use different names
// (`subscription` / `plan` envelope, `start_date`, `orders_placed`), so we
// accept every variant and let the resolver below pick the first present.
type SubscriptionInfo = {
    plan_name?: string
    name?: string
    total_saved?: number | string
    total_orders?: number | string
    orders_placed?: number | string
    order_count?: number | string
    start_at?: string
    start_date?: string
    active_since?: string
    end_at?: string
    end_date?: string
    expires_on?: string
    days_remaining?: number | string
    payment_method?: string
    paid_by?: string
}

// The response may expose subscription details under `plan_details` (current
// stackfood backend) or `subscription` / `plan` (older variants), or flat at
// the root. We accept all three so the page works across deployments.
type ActiveOfferResponse = SubscriptionInfo & {
    status?: boolean
    message?: string
    benefit?: ApiBenefit
    plan_details?: SubscriptionInfo
    subscription?: SubscriptionInfo
    plan?: SubscriptionInfo
}

type GlobalSettings = {
    currency_symbol?: string
    currency_symbol_direction?: string
    digit_after_decimal_point?: number
    business_name?: string
}

type RootState = {
    globalSettings: { global: GlobalSettings }
    cart: { walletAmount: number | string | null }
}

const DASH = '—'

// Module-level dedupe timestamp. Survives React StrictMode's
// double-mount cycle in dev (a `useRef` inside the component would
// re-init on the simulated remount, defeating the guard).
let lastResultOpenAt = 0

const toNumber = (v: unknown, fallback = 0): number => {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
}

const formatDate = (raw?: string): string => {
    if (!raw) return DASH
    const m = moment(raw)
    return m.isValid() ? m.format('MMMM D, YYYY') : DASH
}

const DetailRow: React.FC<{
    icon: React.ReactNode
    label: string
    value: string
}> = ({ icon, label, value }) => (
    <Stack direction="row" alignItems="flex-start" spacing={1.25}>
        <Box sx={{ color: 'text.secondary', mt: '2px' }}>{icon}</Box>
        <Stack>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography
                fontSize="14px"
                fontWeight={600}
                color="text.primary"
            >
                {value}
            </Typography>
        </Stack>
    </Stack>
)

const StatTile: React.FC<{ label: string; value: string }> = ({
    label,
    value,
}) => (
    <Box
        sx={{
            flex: 1,
            backgroundColor: (theme) => theme.palette.background.paper,
            borderRadius: '10px',
            px: 1.75,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
        }}
    >
        <Typography variant="body2" color="text.secondary">
            {label}
        </Typography>
        <Typography fontWeight={700} color="text.primary">
            {value}
        </Typography>
    </Box>
)


// `page` mirrors the value ProfileBody dispatches based on the URL — for the
// payment-gateway callback it arrives as 'subscription?flag=success' or
// 'subscription?flag=cancel'. Optional so the component still works when
// used standalone (e.g. tests / direct render).
interface SubscriptionPlanPageProps {
    page?: string
}

const SubscriptionPlanPage: React.FC<SubscriptionPlanPageProps> = ({ page }) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const { global } = useSelector((state: RootState) => state.globalSettings)
    const walletAmount = useSelector(
        (state: RootState) => Number(state?.cart?.walletAmount) || 0
    )
    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point

    const { data: activeOfferRaw, isLoading } = useGetProActiveOffer() as {
        data?: ActiveOfferResponse
        isLoading: boolean
    }

    const [termsOpen, setTermsOpen] = React.useState(false)
    const openTerms = () => setTermsOpen(true)
    const closeTerms = () => setTermsOpen(false)

    // Renew confirm modal — opened from the active-state Renew button, then
    // funnels into the same payment flow (no plan-selection step since the
    // user is renewing their current plan).
    const [renewOpen, setRenewOpen] = React.useState(false)
    // Change-plan flow — only surfaced when the active subscription is a free
    // trial. Lets the user pick a paid plan and hands off to the existing
    // payment-method modal.
    const [changePlanOpen, setChangePlanOpen] = React.useState(false)

    // Subscription payment flow — mirrors FloatingCart. The user picks a plan
    // (PlanDuration), then we open the AllPaymentMethod modal and POST to
    // /subscribe with whatever method they choose.
    const queryClient = useQueryClient()
    const dispatch = useDispatch()

    // Refresh the customer slice (`state.user.userData`) after subscription
    // changes — ProBadge and other pro-gated UI read from it. Invalidating
    // the react-query cache only refetches when there's an observer mounted,
    // so we drive the API + redux dispatch directly here.
    const refreshUserProfile = React.useCallback(async () => {
        try {
            const res = (await ProfileApi.profileInfo()) as {
                data?: { data?: unknown }
            }
            const payload = res?.data?.data ?? res?.data
            if (payload) dispatch(setUser(payload))
        } catch {
            // Surfaced by the global error handlers when relevant; no-op here.
        }
    }, [dispatch])

    const [proPlanSelected, setProPlanSelected] =
        React.useState<PlanDuration | null>(null)
    const [proPlanPaymentOpen, setProPlanPaymentOpen] = React.useState(false)
    // AllPaymentMethod adapter slots. These are passed through opaquely to a
    // JS component, so loose types are intentional — over-typing would force
    // casts on every prop.
    const [paymenMethod, setPaymenMethod] = React.useState<string>('')
    const [selected, setSelected] = React.useState<unknown>(null)
    const [paymentMethodDetails] = React.useState<unknown>(null)
    const [switchToWallet, setSwitchToWallet] = React.useState(false)
    const [isCheckedOffline, setIsCheckedOffline] = React.useState(false)
    const [changeAmount, setChangeAmount] = React.useState<string>('')

    // Payment-callback result modal. The backend redirects to
    // /info?page=subscription&flag=success|cancel after the gateway closes,
    // which ProfileBody passes through as page === 'subscription?flag=...'.
    // We open the dialog once per landing — `resultShown` guards re-fires
    // on re-renders (same pattern as WalletList's `hasMounted`).
    const [resultShown, setResultShown] = React.useState(false)
    // Single source of truth for open + variant. Combining into one state
    // object means a single render flips both atomically.
    type ResultVariant = 'success' | 'cancel' | 'fail'
    const [resultState, setResultState] = React.useState<{
        open: boolean
        variant: ResultVariant | null
    }>({ open: false, variant: null })
    const resultModal = resultState.variant
    const resultModalOpen = resultState.open
    // Uses the module-level `lastResultOpenAt` (defined above the
    // component) so the dedupe survives React StrictMode's mount /
    // unmount / remount simulation in dev — a component-scoped useRef
    // would re-initialize each cycle and let the second invocation pass.
    const openResultModal = (variant: ResultVariant) => {
        const now = Date.now()
        if (now - lastResultOpenAt < 1000) return
        lastResultOpenAt = now
        setResultState({ open: true, variant })
    }
    const router = useRouter()

    // Refetch every subscription-related query whenever the user lands on
    // this page. Cached data may be stale (e.g. after subscribing from
    // FloatingCart or RestaurantDetails) — invalidating on mount guarantees
    // the active-offer panel, plan list, FAQs, terms, and profile-info
    // refetch. Keys mirror the actual `useQuery` keys used by the hooks
    // under `src/hooks/react-query/pro-plans/`.
    React.useEffect(() => {
        queryClient.invalidateQueries('pro-customer-active-offer')
        queryClient.invalidateQueries('pro-customer-plans')
        queryClient.invalidateQueries('pro-customer-faqs')
        queryClient.invalidateQueries('pro-customer-terms-and-conditions')
        queryClient.invalidateQueries(['profile-info'])
        refreshUserProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useEffect(() => {
        if (resultShown) return
        if (page === 'subscription?flag=success') {
            openResultModal('success')
            setResultShown(true)
            queryClient.invalidateQueries('pro-customer-active-offer')
            queryClient.invalidateQueries(['profile-info'])
            refreshUserProfile()
        } else if (page === 'subscription?flag=cancel') {
            openResultModal('cancel')
            setResultShown(true)
        } else if (page === 'subscription?flag=fail') {
            openResultModal('fail')
            setResultShown(true)
        }
    }, [page, resultShown, queryClient, refreshUserProfile])

    // Close handler for the result modal: dismiss the dialog AND strip the
    // gateway-callback query (?flag=success|cancel) so the URL settles at
    // /info?page=subscription. Using router.replace (not push) keeps the
    // back button from re-triggering the callback flow.
    const handleResultClose = () => {
        // Reset the dedupe window so the next genuine open isn't ignored.
        lastResultOpenAt = 0
        setResultState((s) => ({ ...s, open: false }))
        router.replace(
            { pathname: '/info', query: { page: 'subscription' } },
            undefined,
            { shallow: true }
        )
    }

    const { mutate: subscribeProPlan, isLoading: subscribing } =
        useSubscribeProPlan() as {
            mutate: (
                payload: Record<string, unknown>,
                options: {
                    onSuccess: (resp: Record<string, unknown>) => void
                    onError: (err: {
                        response?: { data?: { message?: string } }
                    }) => void
                }
            ) => void
            isLoading: boolean
        }

    // AllPaymentMethod gates wallet / partial-pay / COD sections off
    // `subscriptionStates.order`. Setting it to '0' shows every method, which
    // is what we want for the subscription flow.
    const proPlanSubscriptionStates = {
        order: '0',
        type: '',
        startDate: '',
        endDate: '',
        days: '',
    }

    const { data: faqsRaw } = useGetProFaqs()
    const faqs = toFaqList(faqsRaw)
        .map(resolveFaq)
        .filter((f) => f.question.length > 0 || f.answer.length > 0)

    // Resolve the active-offer payload from either the axios-wrapped `.data`
    // or a flat top-level shape. Existing hooks in this repo return both
    // shapes depending on the endpoint, so accept either.
    const offer: ActiveOfferResponse =
        ((activeOfferRaw as unknown) as { data?: ActiveOfferResponse })?.data ??
        activeOfferRaw ??
        {}

    const isActive = offer?.status === true

    // Subscription fields may live at the root or under `subscription` / `plan`.
    const sub: SubscriptionInfo =
        offer.plan_details ??
        offer.subscription ??
        offer.plan ??
        (offer as SubscriptionInfo)
    const benefit = offer.benefit

    const planName = sub.plan_name ?? sub.name ?? DASH

    const totalSavedNumber = toNumber(sub.total_saved, NaN)
    const totalSavedDisplay = Number.isFinite(totalSavedNumber)
        ? getAmount(
            totalSavedNumber,
            currencySymbolDirection,
            currencySymbol,
            digitAfterDecimalPoint
        )
        : DASH

    const ordersPlacedRaw =
        sub.total_orders ?? sub.orders_placed ?? sub.order_count
    const ordersPlacedDisplay =
        ordersPlacedRaw === undefined || ordersPlacedRaw === null
            ? DASH
            : String(ordersPlacedRaw)

    const activeSinceRaw = sub.start_at ?? sub.start_date ?? sub.active_since
    const expiresOnRaw = sub.end_at ?? sub.end_date ?? sub.expires_on
    const paidBy = sub.payment_method ?? sub.paid_by ?? DASH
    const isFreeTrial =
        (sub.payment_method ?? sub.paid_by) === 'free_trial'

    const daysRemainingExplicit = toNumber(sub.days_remaining, NaN)
    const daysRemainingDerived = expiresOnRaw
        ? Math.max(0, moment(expiresOnRaw).diff(moment(), 'days'))
        : NaN
    const daysRemainingValue = Number.isFinite(daysRemainingExplicit)
        ? daysRemainingExplicit
        : daysRemainingDerived
    const daysRemainingDisplay = Number.isFinite(daysRemainingValue)
        ? `${daysRemainingValue} ${t('days')}`
        : DASH
    // Benefits are derived strictly from the active-offer payload — no
    // hardcoded fallback lines. Shapes handled:
    //   - discount       → "X% off" with optional "(up to $Y)" cap
    //   - delivery_fee   → "Free delivery" (full_free) or
    //                      "X% off delivery" (partial_free)
    //   - coupon         → "Pro coupon benefit unlocked"
    // A "Minimum order $Z" qualifier is appended whenever
    // min_order_status === 1 and min_order_amount > 0.
    const benefitPercentage = toNumber(benefit?.percentage, 0)
    const benefitMaxAmount = toNumber(benefit?.max_amount, 0)
    const chargeDiscountPct = toNumber(benefit?.charge_discount_percentage, 0)
    const minOrderAmount = toNumber(benefit?.min_order_amount, 0)
    const minOrderQualifier =
        toNumber(benefit?.min_order_status, 0) === 1 && minOrderAmount > 0
            ? ` (${t('on orders above')} ${getAmount(
                  minOrderAmount,
                  currencySymbolDirection,
                  currencySymbol,
                  digitAfterDecimalPoint
              )})`
            : ''

    const benefits: string[] = []
    if (benefit?.type === 'discount' && benefitPercentage > 0) {
        const cap =
            benefitMaxAmount > 0
                ? ` (${t('up to')} ${getAmount(
                      benefitMaxAmount,
                      currencySymbolDirection,
                      currencySymbol,
                      digitAfterDecimalPoint
                  )})`
                : ''
        benefits.push(
            `${benefitPercentage}% ${t('off on all orders')}${cap}${minOrderQualifier}`
        )
    } else if (benefit?.type === 'delivery_fee') {
        if (benefit?.offer_type === 'full_free') {
            benefits.push(`${t('Free delivery')}${minOrderQualifier}`)
        } else if (
            benefit?.offer_type === 'partial_free' &&
            chargeDiscountPct > 0
        ) {
            benefits.push(
                `${chargeDiscountPct}% ${t('off delivery')}${minOrderQualifier}`
            )
        }
    } else if (benefit?.type === 'coupon') {
        benefits.push(t('Pro coupon benefit unlocked'))
    }

    const [cancelOpen, setCancelOpen] = React.useState(false)
    const { mutate: cancelProPlan, isLoading: cancelling } =
        useCancelProPlan() as {
            mutate: (
                payload: void,
                options: {
                    onSuccess: (resp: Record<string, unknown>) => void
                    onError: (err: {
                        response?: { data?: { message?: string } }
                    }) => void
                }
            ) => void
            isLoading: boolean
        }
    const handleCancel = () => {
        setCancelOpen(true)
    }
    const handleConfirmCancel = () => {
        cancelProPlan(undefined as unknown as void, {
            onSuccess: (resp) => {
                setCancelOpen(false)
                queryClient.invalidateQueries('pro-customer-active-offer')
                queryClient.invalidateQueries(['profile-info'])
                refreshUserProfile()
                toast.success(
                    ((resp?.message as string | undefined) ??
                        t('Subscription cancelled')) as string
                )
            },
            onError: (err) => {
                toast.error(
                    (err?.response?.data?.message ??
                        t('Failed to cancel subscription')) as string
                )
            },
        })
    }
    const handleRenew = () => {
        setRenewOpen(true)
    }

    // Plan list — used at renew time to look up the active plan's price for
    // the payment-method modal's display total.
    const { data: plansResponse } = useGetProPlans() as {
        data?:
        | { data?: { plans?: Array<Record<string, unknown>> } }
        | { plans?: Array<Record<string, unknown>> }
    }
    const plansList: Array<Record<string, unknown>> = (() => {
        const raw = plansResponse as
            | { data?: { plans?: Array<Record<string, unknown>> } }
            | { plans?: Array<Record<string, unknown>> }
            | undefined
        const wrapped = (raw as { data?: { plans?: unknown } })?.data?.plans
        const flat = (raw as { plans?: unknown })?.plans
        const list = (Array.isArray(wrapped) ? wrapped : flat) ?? []
        return Array.isArray(list) ? list : []
    })()

    // Change-plan path — chosen plan flows straight into the existing
    // payment-method modal. Free-trial plans are rejected since the user is
    // already on the trial.
    const handleChangePlanSubscribe = (plan: PlanDuration) => {
        if (plan.price === 0) {
            toast.error(t('You are already on the free trial') as string)
            return
        }
        setChangePlanOpen(false)
        setProPlanSelected(plan)
        setProPlanPaymentOpen(true)
    }

    // Shared payment-method modal — rendered in both the no-active-offer
    // branch (initial subscribe) and the active branch (renew flow).
    const paymentMethodModalEl =
        proPlanPaymentOpen && proPlanSelected ? (
            <CustomModal
                openModal={proPlanPaymentOpen}
                handleClose={() => setProPlanPaymentOpen(false)}
                setModalOpen={setProPlanPaymentOpen}
                maxWidth="640px"
                bgColor={theme.palette.background.default}
                closeButton
            >
                <AllPaymentMethod
                    handleClose={() => setProPlanPaymentOpen(false)}
                    paymenMethod={paymenMethod}
                    usePartialPayment={false}
                    global={global}
                    hideWallet={
                        proPlanSelected
                            ? proPlanSelected.price > walletAmount
                            : false
                    }
                    setPaymenMethod={setPaymenMethod}
                    getPaymentMethod={(item: unknown) => {
                        setSelected(item)
                        setSwitchToWallet(false)
                    }}
                    setSelected={setSelected}
                    selected={selected}
                    handleSubmit={async () => {
                        if (!proPlanSelected || !selected) {
                            toast.error(
                                t('Select a payment method') as string
                            )
                            return
                        }
                        const sel = selected as {
                            name?: string
                            method?: string
                            method_name?: string
                        }
                        let payment_type = 'digital_payment'
                        let payment_method: string | undefined = sel?.name
                        if (sel?.method === 'offline_payment') {
                            payment_type = 'offline_payment'
                            payment_method = sel?.method_name ?? sel?.name
                        } else if (sel?.name === 'wallet') {
                            payment_type = 'wallet'
                            payment_method = 'wallet'
                        } else if (sel?.name === 'cash_on_delivery') {
                            payment_type = 'cash_on_delivery'
                            payment_method = 'cash_on_delivery'
                        }
                        const page = 'subscription'
                        const callbackUrl = `${window.location.origin}/info?page=${page}`

                        // Refresh customer/info into Redux before the payment
                        // call so downstream pro-gated UI sees current user
                        // state when the gateway redirects back.
                        await refreshUserProfile()

                        subscribeProPlan(
                            {
                                plan_id: proPlanSelected.id,
                                payment_type,
                                payment_method,
                                callback: callbackUrl,
                                payment_platform: "web"
                            },
                            {
                                onSuccess: (resp) => {
                                    const redirectLink = resp?.redirect_link as
                                        | string
                                        | undefined
                                    if (
                                        typeof redirectLink === 'string' &&
                                        redirectLink.length > 0
                                    ) {
                                        window.location.href = redirectLink
                                        return
                                    }
                                    setProPlanPaymentOpen(false)
                                    setProPlanSelected(null)
                                    queryClient.invalidateQueries(
                                        'pro-customer-active-offer'
                                    )
                                    // Defer the success Dialog so the
                                    // AllPaymentMethod close animation
                                    // starts cleanly first — without the
                                    // delay both modals animate in the same
                                    // React batch and the success dialog
                                    // visibly flickers as the backdrops
                                    // resolve stacking order.
                                    setResultShown(true)
                                    setTimeout(
                                        () => openResultModal('success'),
                                        300
                                    )
                                },
                                onError: (err) => {
                                    toast.error(
                                        (err?.response?.data?.message ??
                                            t(
                                                'Subscription failed'
                                            )) as string
                                    )
                                    setResultShown(true)
                                    setTimeout(
                                        () => openResultModal('fail'),
                                        300
                                    )
                                },
                            }
                        )
                    }}
                    subscriptionStates={proPlanSubscriptionStates}
                    offlinePaymentOptions={undefined}
                    setIsCheckedOffline={setIsCheckedOffline}
                    isCheckedOffline={isCheckedOffline}
                    offLineWithPartial={false}
                    paymentMethodDetails={paymentMethodDetails}
                    walletAmount={walletAmount}
                    totalAmount={proPlanSelected?.price ?? 0}
                    handlePartialPayment={() => {
                        // Mirrors PaymentOptions.js: applying the wallet
                        // promotes it to the active payment method, flips
                        // switchToWallet so AllPaymentMethod renders the full
                        // wallet UI, and stores a `{ name: 'wallet' }` selection
                        // so handleSubmit takes the wallet branch.
                        setPaymenMethod('wallet')
                        setSwitchToWallet(true)
                        setSelected({ name: 'wallet' })
                    }}
                    removePartialPayment={() => {
                        setPaymenMethod('')
                        setSwitchToWallet(false)
                        setSelected(null)
                    }}
                    switchToWallet={switchToWallet}
                    setChangeAmount={setChangeAmount}
                    changeAmount={changeAmount}
                    openModal={proPlanPaymentOpen}
                    orderType={'subscription'}
                    submitLabel={subscribing ? 'Subscribing…' : 'Proceed'}
                    hideCashOnDelivery={true}
                />
            </CustomModal>
        ) : null

    // Result modal — fires from the ?flag=success / ?flag=cancel callback.
    // Rendered in both the active and inactive branches so the dialog still
    // shows whichever state the page resolves into after the refetch.
    const resultModalEl = (
        <Dialog
            open={resultModalOpen}
            onClose={handleResultClose}
            keepMounted
            TransitionProps={{
                onExited: () =>
                    setResultState({ open: false, variant: null }),
            }}
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    p: 1,
                    width: { xs: '90%', sm: '400px' },
                },
            }}
        >
            <DialogContent>
                <Stack alignItems="center" spacing={1.5} sx={{ py: 1 }}>
                    {resultModal === 'success' ? (
                        <CheckCircleRoundedIcon
                            sx={{ fontSize: 64, color: '#22C55E' }}
                        />
                    ) : (
                        <CancelRoundedIcon
                            sx={{ fontSize: 64, color: '#EF4444' }}
                        />
                    )}
                    <Typography
                        fontSize="20px"
                        fontWeight={700}
                        color="text.primary"
                        textAlign="center"
                    >
                        {resultModal === 'success'
                            ? t('Subscription Successful')
                            : t('Subscription Failed')}
                    </Typography>
                    <Typography
                        fontSize="14px"
                        color="text.secondary"
                        textAlign="center"
                    >
                        {resultModal === 'success'
                            ? t(
                                  'Your Pro subscription is now active. Enjoy your benefits!'
                              )
                            : t(
                                  'Your subscription payment did not go through. Please try again.'
                              )}
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
                <Button
                    onClick={handleResultClose}
                    variant="contained"
                    sx={{
                        backgroundColor:
                            resultModal === 'success' ? '#22C55E' : '#EF4444',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 4,
                        borderRadius: '8px',
                        '&:hover': {
                            backgroundColor:
                                resultModal === 'success'
                                    ? '#16A34A'
                                    : '#DC2626',
                        },
                    }}
                >
                    {t('OK')}
                </Button>
            </DialogActions>
        </Dialog>
    )

    if (isLoading) {
        return (
            <>
                <Meta
                    title={` My Subscription-${global?.business_name}`}
                    description=""
                    ogImage=""
                    pathName=""
                    robotsMeta={undefined}
                />
                <Stack spacing={2.5} sx={{ p: { xs: 1, sm: 2 } }}>
                    {/* Title */}
                    <Stack alignItems="center">
                        <Skeleton
                            variant="text"
                            width={180}
                            height={32}
                        />
                    </Stack>

                    {/* Plan / subscription summary card */}
                    <Box
                        sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '16px',
                            p: 2,
                        }}
                    >
                        <Skeleton
                            variant="rectangular"
                            height={140}
                            sx={{ borderRadius: '12px', mb: 2 }}
                        />
                        <Stack spacing={1}>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="40%" />
                            <Skeleton variant="text" width="80%" />
                        </Stack>
                    </Box>

                    {/* FAQ rows */}
                    <Box
                        sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '16px',
                            p: 2,
                        }}
                    >
                        <Skeleton
                            variant="text"
                            width="50%"
                            height={28}
                            sx={{ mb: 1.5 }}
                        />
                        {[0, 1, 2].map((i) => (
                            <Stack
                                key={i}
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{
                                    py: 1.25,
                                    borderBottom:
                                        i < 2
                                            ? `1px solid ${theme.palette.divider}`
                                            : 'none',
                                }}
                            >
                                <Skeleton variant="text" width="70%" />
                                <Skeleton
                                    variant="circular"
                                    width={18}
                                    height={18}
                                />
                            </Stack>
                        ))}
                    </Box>

                    {/* Terms link */}
                    <Stack alignItems="center">
                        <Skeleton variant="text" width={140} />
                    </Stack>
                </Stack>
            </>
        )
    }
    console.log({faqs});
    

    if (!isActive) {
        const handleSubscribeFromPage = (plan: PlanDuration) => {
            // Free-trial plans skip the payment-method picker entirely and
            // subscribe directly with payment_type/method = 'free_trial'.
            // `price === 0` matches the same heuristic ChoosePlanContent uses
            // to flip the CTA label to "Start Free Trial".
            if (plan.price === 0) {
                const callbackUrl =
                    typeof window !== 'undefined' ? window.location.href : ''
                subscribeProPlan(
                    {
                        plan_id: plan.id,
                        payment_type: 'free_trial',
                        payment_method: 'free_trial',
                        callback_url: callbackUrl,
                    },
                    {
                        onSuccess: (resp) => {
                            const redirectLink = resp?.redirect_link as
                                | string
                                | undefined
                            if (
                                typeof redirectLink === 'string' &&
                                redirectLink.length > 0
                            ) {
                                window.location.href = redirectLink
                                return
                            }
                            queryClient.invalidateQueries(
                                'pro-customer-active-offer'
                            )
                            queryClient.invalidateQueries(['profile-info'])
                            refreshUserProfile()
                            openResultModal('success')
                            setResultShown(true)
                        },
                        onError: (err) => {
                            toast.error(
                                (err?.response?.data?.message ??
                                    t('Subscription failed')) as string
                            )
                            openResultModal('fail')
                            setResultShown(true)
                        },
                    }
                )
                return
            }
            setProPlanSelected(plan)
            setProPlanPaymentOpen(true)
        }
        return (
            <>
                <Meta
                    title={` My Subscription-${global?.business_name}`}
                    description=""
                    ogImage=""
                    pathName=""
                    robotsMeta={undefined}
                />
                <Stack spacing={2.5} sx={{ p: { xs: 1, sm: 2 } }}>
                    <ChoosePlanContent
                        t={t}
                        layout="split"
                        onSubscribe={handleSubscribeFromPage}
                        isSubmitting={subscribing}
                    />

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
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={
                                                <ExpandMoreRoundedIcon />
                                            }
                                            sx={{ px: 0 }}
                                        >
                                            <Typography
                                                fontSize="14px"
                                                color="text.primary"
                                            >
                                                {faq.question}
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ px: 0, pt: 0 }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
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
                        color="text.primary"
                        sx={{
                            textDecoration: 'underline',
                            cursor: 'pointer',
                        }}
                        onClick={openTerms}
                    >
                        {t('Terms and Condition')}
                    </Typography>
                </Stack>
                <ProTermsModal open={termsOpen} onClose={closeTerms} />
                {paymentMethodModalEl}
            </>
        )
    }

    return (
        <>
            <Meta
                title={` My Subscription-${global?.business_name}`}
                description=""
                ogImage=""
                pathName=""
                robotsMeta={undefined}
            />
            <Stack spacing={2.5} sx={{ p: { xs: 1, sm: 2 } }}>
                <Typography
                    variant="h5"
                    fontWeight={700}
                    textAlign="center"
                    color="text.primary"
                >
                    {t('My Subscription')}
                </Typography>

                <Box
                    sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '16px',
                        p: 2,
                    }}
                >
                    <Box
                        sx={{
                            backgroundColor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'rgba(139, 92, 246, 0.15)'
                                    : '#E9DFFF',
                            borderRadius: '12px',
                            p: 2,
                            mb: 2.5,
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            mb={1.75}
                        >
                            <Typography
                                fontSize="18px"
                                fontWeight={700}
                                color="text.primary"
                            >
                                {planName}
                            </Typography>
                            <Chip
                                label={t('Active')}
                                size="small"
                                sx={{
                                    fontWeight: 600,
                                    color: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? '#86EFAC'
                                            : '#16A34A',
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(34, 197, 94, 0.15)'
                                            : '#DCFCE7',
                                }}
                            />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                            <StatTile
                                label={t('Total Saved')}
                                value={totalSavedDisplay}
                            />
                            <StatTile
                                label={t('Orders Placed')}
                                value={ordersPlacedDisplay}
                            />
                        </Stack>
                    </Box>

                    <Box
                        sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '12px',
                            p: 2,
                            mb: 2,
                        }}
                    >
                        <Typography
                            fontWeight={700}
                            mb={1.5}
                            color="text.primary"
                        >
                            {t('Plan Details')}
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: '1fr 1fr',
                                },
                                rowGap: 1.5,
                                columnGap: 2,
                            }}
                        >
                            <DetailRow
                                icon={<CalendarMonthOutlinedIcon fontSize="small" />}
                                label={t('Active Since')}
                                value={formatDate(activeSinceRaw)}
                            />
                            <DetailRow
                                icon={<EventBusyOutlinedIcon fontSize="small" />}
                                label={t('Expires On')}
                                value={formatDate(expiresOnRaw)}
                            />
                            <DetailRow
                                icon={
                                    <HourglassEmptyRoundedIcon fontSize="small" />
                                }
                                label={t('Days Remaining')}
                                value={daysRemainingDisplay}
                            />
                            <DetailRow
                                icon={
                                    <ReceiptLongOutlinedIcon fontSize="small" />
                                }
                                label={t('Paid By')}
                                value={replace(paidBy, '_', ' ')}
                            />
                        </Box>
                    </Box>

                    {benefits.length > 0 && (
                    <Box
                        sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '12px',
                            p: 2,
                            mb: 2,
                        }}
                    >
                        <Typography
                            fontWeight={700}
                            mb={1.25}
                            color="text.primary"
                        >
                            {t('Package Benefits')}
                        </Typography>
                        <Stack spacing={1}>
                            {benefits.map((line, i) => (
                                <Stack
                                    key={i}
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: '#22C55E',
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Typography
                                        fontSize="14px"
                                        color="text.primary"
                                    >
                                        {line}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                    )}

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                        <Button
                            fullWidth
                            onClick={handleCancel}
                            sx={{
                                backgroundColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? '#192238'
                                        : '#F1F5F9',
                                color: theme.palette.text.primary,
                                fontWeight: 600,
                                py: 1.25,
                                borderRadius: '10px',
                                '&:hover': {
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? '#374151'
                                            : '#E2E8F0',
                                },
                            }}
                        >
                            {t('Cancel Subscription')}
                        </Button>

                            <Button
                                fullWidth
                                onClick={
                                     handleRenew
                                }
                                variant="contained"
                                sx={{
                                    backgroundColor: '#8B5CF6',
                                    fontWeight: 600,
                                    py: 1.25,
                                    borderRadius: '10px',
                                    '&:hover': { backgroundColor: '#7C3AED' },
                                }}
                            >
                                {t('Renew Subscription')}
                            </Button>
                        
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
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreRoundedIcon />}
                                        sx={{ px: 0 }}
                                    >
                                        <Typography
                                            fontSize="14px"
                                            color="text.primary"
                                        >
                                            {faq.question}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 0, pt: 0 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
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
                    color="text.primary"
                    sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={openTerms}
                >
                    {t('Terms and Condition')}
                </Typography>
            </Stack>
            <ProTermsModal open={termsOpen} onClose={closeTerms} />
            <RenewSubscriptionModal
                open={renewOpen}
                onClose={() => setRenewOpen(false)}
                onConfirm={() => {
                    setRenewOpen(false)
                    setChangePlanOpen(true)
                }}
                t={t}
                isWorking={subscribing}
            />
            <CancelSubscriptionModal
                open={cancelOpen}
                onClose={() => setCancelOpen(false)}
                onConfirm={handleConfirmCancel}
                t={t}
                isWorking={cancelling}
            />
            <ProPlanSubscriptionModal
                open={changePlanOpen}
                onClose={() => setChangePlanOpen(false)}
                onSubscribe={handleChangePlanSubscribe}
                isSubmitting={subscribing}
                hideFreePlans={true}
                activePlanId={
                    benefit?.plan_id !== undefined && benefit?.plan_id !== null
                        ? String(benefit.plan_id)
                        : undefined
                }
                t={t}
            />
            {paymentMethodModalEl}
            {resultModalEl}
        </>
    )
}

export default SubscriptionPlanPage
