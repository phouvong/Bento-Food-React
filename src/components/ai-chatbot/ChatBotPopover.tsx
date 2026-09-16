import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import {
    Box,
    Fade,
    IconButton,
    Stack,
    Typography,
    alpha,
    useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactElement,
} from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'
import useDeleteAiChatConversation from '@/hooks/react-query/ai-chat/useDeleteAiChatConversation'
import useGetAiChatConversations from '@/hooks/react-query/ai-chat/useGetAiChatConversations'
import useSendAiChatMessage from '@/hooks/react-query/ai-chat/useSendAiChatMessage'
import { getGuestId } from '@/utils/localStorage'
import { noteAiChatError, type AiChatLimits } from './aiChatErrors'
import ChatDetailView from './ChatDetailView'
import ChatListView from './ChatListView'
import ChatWelcomeView from './ChatWelcomeView'
import {
    mapApiConversation,
    type AiChatConversationApi,
    type AiChatConversationsResponse,
    type ChatBogoDetails,
    type ChatBogoOffer,
    type ChatCategory,
    type ChatConversation,
    type ChatCuisine,
    type ChatHappyHour,
    type ChatMessage,
    type ChatStore,
} from './types'

// The happy-hour card opens the same modal the home banner does; it fetches its
// own store list, so only the window's display fields are handed over.
const HappyHourViewModal = dynamic(
    () => import('@/components/happy-hour/HappyHourViewModal'),
    { ssr: false }
) as unknown as (props: {
    isOpenModal: boolean
    onCloseModal: () => void
    activeBogoItem: Record<string, unknown> | null
}) => ReactElement

interface ChatBotPopoverProps {
    open: boolean
    onClose: () => void
}

const makeId = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

const isServerId = (id: string) => /^\d+$/.test(id)

// Warn once the customer is within this many messages of the daily cap, so
// hitting it is not a surprise.
const DAILY_REMAINING_WARN_AT = 3
// A transient 429 is retried, but only so far — a server that keeps refusing
// must not turn into an unbounded resend loop.
const MAX_RATE_LIMIT_RETRIES = 2

const ChatBotPopover = ({ open, onClose }: ChatBotPopoverProps) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const queryClient = useQueryClient()
    const router = useRouter()
    const { userData } = useSelector((state: any) => state.user) ?? {}
    const [conversations, setConversations] = useState<ChatConversation[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [isTyping, setIsTyping] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [limits, setLimits] = useState<AiChatLimits | null>(null)
    const [dailyLimitReached, setDailyLimitReached] = useState(false)
    const [retryCountdown, setRetryCountdown] = useState(0)
    const [activeHappyHour, setActiveHappyHour] =
        useState<ChatHappyHour | null>(null)

    // The in-flight guard is a ref as well as state: `handleSend` is re-entered
    // from its own retry path, where a state update has not landed yet.
    const sendingRef = useRef(false)
    const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([])

    const {
        data: conversationsData,
        refetch: refetchConversations,
        isFetching: isFetchingConversations,
    } = useGetAiChatConversations({ enabled: false })

    const { mutateAsync: sendMessageAsync } = useSendAiChatMessage()
    const { mutateAsync: deleteConversationAsync } =
        useDeleteAiChatConversation()

    const identityKey = userData?.id
        ? `user:${userData.id}`
        : `guest:${(typeof window !== 'undefined' && getGuestId()) || ''}`

    // Every scheduled timer is owned here so a close or unmount mid-backoff
    // cannot fire a retry into a torn-down widget.
    const schedule = useCallback((fn: () => void, delayMs: number) => {
        const id = setTimeout(fn, delayMs)
        timersRef.current.push(id)
        return id
    }, [])

    useEffect(() => {
        return () => {
            timersRef.current.forEach(clearTimeout)
            timersRef.current = []
        }
    }, [])

    useEffect(() => {
        setConversations([])
        setActiveId(null)
        // Limits are per identity (a guest's allowance is counted by IP), so a
        // switch clears whatever the previous identity had spent.
        setLimits(null)
        setDailyLimitReached(false)
        queryClient.removeQueries(['ai-chat-conversations'])
        queryClient.removeQueries(['ai-chat-messages'])
    }, [identityKey, queryClient])

    useEffect(() => {
        if (open) refetchConversations()
    }, [open, identityKey, refetchConversations])

    useEffect(() => {
        const apiData = (
            conversationsData as AiChatConversationsResponse | undefined
        )?.data
        if (!Array.isArray(apiData)) return
        setConversations((prev) => {
            const localOnly = prev.filter(
                (p) =>
                    !apiData.some(
                        (api: AiChatConversationApi) => String(api.id) === p.id
                    )
            )
            const mapped = apiData.map(mapApiConversation).map((api) => {
                const existing = prev.find((p) => p.id === api.id)
                return existing
                    ? {
                          ...api,
                          messages: existing.messages,
                          unread: existing.unread,
                      }
                    : api
            })
            return [...localOnly, ...mapped].sort(
                (a, b) => b.updatedAt - a.updatedAt
            )
        })
    }, [conversationsData])

    const activeChat = useMemo(
        () => conversations.find((c) => c.id === activeId) ?? null,
        [conversations, activeId]
    )

    const handleSelect = useCallback((id: string) => {
        setActiveId(id)
        setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
        )
    }, [])

    const handleNewChat = useCallback(() => {
        const id = makeId()
        const greeting: ChatMessage = {
            id: makeId(),
            role: 'bot',
            text: t(
                "Hi! I'm your assistant. Ask me about orders, restaurants, or promos."
            ) as string,
            createdAt: Date.now(),
        }
        const fresh: ChatConversation = {
            id,
            title: t('New chat') as string,
            preview: greeting.text,
            updatedAt: Date.now(),
            unread: 0,
            messages: [greeting],
            isDraft: true,
        }
        setConversations((prev) => [fresh, ...prev])
        setActiveId(id)
    }, [t])

    const handleBack = useCallback(() => setActiveId(null), [])

    const handleDeleteConversation = useCallback(
        async (id: string) => {
            if (!isServerId(id)) {
                setConversations((prev) => prev.filter((c) => c.id !== id))
                setActiveId((curr) => (curr === id ? null : curr))
                return
            }
            try {
                await deleteConversationAsync(id)
                setConversations((prev) => prev.filter((c) => c.id !== id))
                setActiveId((curr) => (curr === id ? null : curr))
                queryClient.removeQueries(['ai-chat-messages', id])
                await queryClient.refetchQueries(['ai-chat-conversations'])
                toast.success(t('Chat deleted') as string)
            } catch (err: any) {
                const { message } = noteAiChatError(err)
                toast.error(message || (t('Failed to delete chat') as string))
                throw err
            }
        },
        [deleteConversationAsync, queryClient, t]
    )

    // A conversation id the server does not recognise as ours: drop it locally
    // and let the customer start a fresh one rather than retrying against it.
    const dropStaleConversation = useCallback(
        (id: string) => {
            setConversations((prev) => prev.filter((c) => c.id !== id))
            setActiveId((curr) => (curr === id ? null : curr))
            queryClient.removeQueries(['ai-chat-messages', id])
            queryClient.refetchQueries(['ai-chat-conversations'])
            toast.error(t('That chat is no longer available') as string)
        },
        [queryClient, t]
    )

    const handleSend = useCallback(
        async (
            text: string,
            opts?: { conversationIdOverride?: string; attempt?: number }
        ) => {
            const sendingFromId = opts?.conversationIdOverride ?? activeId
            if (!sendingFromId) return
            const attempt = opts?.attempt ?? 0
            // Guard the first attempt only — a scheduled retry is already the owner
            // of the in-flight slot it is resuming.
            if (attempt === 0 && (sendingRef.current || dailyLimitReached))
                return

            sendingRef.current = true
            setIsSending(true)

            const isLocalOnly = !isServerId(sendingFromId)

            // A retry re-sends a message that is already in the thread.
            if (attempt === 0) {
                const userMsg: ChatMessage = {
                    id: makeId(),
                    role: 'user',
                    text,
                    createdAt: Date.now(),
                }
                setConversations((prev) =>
                    prev.map((c) =>
                        c.id === sendingFromId
                            ? {
                                  ...c,
                                  preview: text,
                                  updatedAt: Date.now(),
                                  messages: [...(c.messages ?? []), userMsg],
                                  isDraft: false,
                              }
                            : c
                    )
                )
            }
            setIsTyping(true)

            try {
                const { reply, limits: replyLimits } = await sendMessageAsync({
                    conversationId: isLocalOnly
                        ? undefined
                        : Number(sendingFromId),
                    message: text,
                })

                setLimits(replyLimits)
                setRetryCountdown(0)

                const serverId =
                    reply?.conversation_id != null
                        ? String(reply.conversation_id)
                        : null
                const targetId = serverId ?? sendingFromId

                if (serverId && serverId !== sendingFromId) {
                    setConversations((prev) =>
                        prev.map((c) =>
                            c.id === sendingFromId ? { ...c, id: serverId } : c
                        )
                    )
                    setActiveId((curr) =>
                        curr === sendingFromId ? serverId : curr
                    )
                }

                const botReply: ChatMessage = {
                    id: makeId(),
                    role: 'bot',
                    text: reply?.content ?? '',
                    createdAt: Date.now(),
                    toolName: reply?.tool_name ?? null,
                    metadata: reply?.metadata ?? null,
                }

                setConversations((prev) =>
                    prev.map((c) =>
                        c.id === targetId
                            ? {
                                  ...c,
                                  preview: reply?.content ?? c.preview,
                                  updatedAt: Date.now(),
                                  messages: [...(c.messages ?? []), botReply],
                              }
                            : c
                    )
                )
                setIsTyping(false)
                sendingRef.current = false
                setIsSending(false)

                queryClient.refetchQueries(['ai-chat-conversations'])

                // The customer may have changed their cart by talking, from a screen
                // that is not the cart — refresh the badge and any open cart screen.
                if (reply?.metadata?.cart_updated) {
                    queryClient.invalidateQueries('cart-itemss')
                    queryClient.invalidateQueries('cart-groups')
                }
            } catch (err: any) {
                const { status, code, message, retryAfter, limit } =
                    noteAiChatError(err)
                setIsTyping(false)

                // Sending too fast — transient. Back off for `retry_after` seconds and
                // resend the message that was refused, keeping the composer locked.
                if (
                    status === 429 &&
                    code === 'too_many_requests' &&
                    attempt < MAX_RATE_LIMIT_RETRIES
                ) {
                    const waitSeconds = Math.max(1, Math.ceil(retryAfter ?? 5))
                    setRetryCountdown(waitSeconds)
                    for (let s = 1; s <= waitSeconds; s += 1) {
                        schedule(
                            () => setRetryCountdown(waitSeconds - s),
                            s * 1000
                        )
                    }
                    schedule(() => {
                        handleSend(text, {
                            conversationIdOverride: sendingFromId,
                            attempt: attempt + 1,
                        })
                    }, waitSeconds * 1000)
                    return
                }

                sendingRef.current = false
                setIsSending(false)
                setRetryCountdown(0)

                // No response at all — a timeout or a dropped connection. A timeout is
                // not proof the reply was lost: the model call may have completed and
                // been saved. Refetch the thread rather than resending, which would
                // bill a second AI call for the same message.
                if (!err?.response) {
                    if (isServerId(sendingFromId)) {
                        queryClient.invalidateQueries([
                            'ai-chat-messages',
                            sendingFromId,
                        ])
                    }
                    toast.error(
                        err?.code === 'ECONNABORTED'
                            ? (t(
                                  'That took a while — checking for a reply.'
                              ) as string)
                            : message || (t('Failed to send message') as string)
                    )
                    return
                }

                // Daily allowance spent — not transient, so do not retry.
                if (status === 429 && code === 'ai_chat_limit') {
                    setDailyLimitReached(true)
                    setLimits((prev) => ({
                        ...(prev ?? {}),
                        dailyRemaining: 0,
                        dailyLimit: limit ?? prev?.dailyLimit,
                    }))
                    toast.error(
                        message ||
                            (t(
                                "You've used all your messages for today. Try again tomorrow."
                            ) as string)
                    )
                    return
                }

                // The admin switched the assistant off; the launcher hides itself off
                // the same flag, so the widget just closes.
                if (status === 503 && code === 'ai_disabled') {
                    onClose()
                    return
                }

                if (status === 404 && code === 'not_found') {
                    dropStaleConversation(sendingFromId)
                    return
                }

                toast.error(message || (t('Failed to send message') as string))
            }
        },
        [
            activeId,
            dailyLimitReached,
            dropStaleConversation,
            onClose,
            queryClient,
            schedule,
            sendMessageAsync,
            t,
        ]
    )

    const handleStoreSelect = useCallback(
        (store: ChatStore) => {
            const slugOrId = store?.slug || store?.id
            if (!slugOrId) return
            router.push(`/restaurants/${slugOrId}`)
            onClose()
        },
        [router, onClose]
    )

    // Same redirect convention as FeaturedCategoryCard (the homepage "Whats on
    // Your Mind?" cuisine tiles): push to /category/[slug-or-id] with the name
    // as a query param, then close the widget.
    const handleCategorySelect = useCallback(
        (category: ChatCategory) => {
            const slugOrId = category?.slug || category?.id
            if (!slugOrId) return
            router.push({
                pathname: `/category/${slugOrId}`,
                query: { name: category?.name },
            })
            onClose()
        },
        [router, onClose]
    )

    const handleCuisineSelect = useCallback(
        (cuisine: ChatCuisine) => {
            const slugOrId = cuisine?.slug || cuisine?.id
            if (!slugOrId) return
            router.push({ pathname: `/cuisines/${slugOrId}` })
            onClose()
        },
        [router, onClose]
    )

    // The assistant cannot add a bundle to the cart — enrolling means choosing
    // variations and add-ons per item — so the card hands off to the existing
    // BOGO offer screen, deep-linked to this offer.
    const openBogoOffer = useCallback(
        (offerId?: number) => {
            if (!offerId) return
            router.push({ pathname: '/bogo-list', query: { offer: offerId } })
            onClose()
        },
        [router, onClose]
    )

    const handleBogoOfferSelect = useCallback(
        (offer: ChatBogoOffer) => openBogoOffer(offer?.id),
        [openBogoOffer]
    )

    // `bogo_offer_id` is the id that opens the offer screen — not `bundle_id`
    // (the restaurant's enrolment) and not `bogo_group_id` (this cart line).
    const handleBundleSelect = useCallback(
        (details: ChatBogoDetails) => openBogoOffer(details?.bogo_offer_id),
        [openBogoOffer]
    )

    const handleHappyHourSelect = useCallback(
        (happyHour: ChatHappyHour) => setActiveHappyHour(happyHour),
        []
    )

    // Adapts the metadata card to the modal's `activeBogoItem` contract, the same
    // way HappyHourBanner does — the modal fetches its own store list.
    const happyHourModalData = useMemo(() => {
        if (!activeHappyHour) return null
        const seconds = Number(activeHappyHour.remaining_seconds)
        return {
            title: `${
                activeHappyHour.discount
                    ? `${activeHappyHour.discount}${t('% OFF')}! `
                    : ''
            }${activeHappyHour.title ?? t('Happy Hour')}`,
            description: activeHappyHour.short_description,
            expire_at:
                Number.isFinite(seconds) && seconds > 0
                    ? new Date(Date.now() + seconds * 1000).toISOString()
                    : null,
            cover_image_full_url: activeHappyHour.cover_image_full_url,
            min_order_amount: Number(activeHappyHour.min_order_amount) || 0,
            discount: Number(activeHappyHour.discount) || 0,
            started_at: activeHappyHour.started_at,
            ends_at: activeHappyHour.ends_at,
        }
    }, [activeHappyHour, t])

    const handleQuickStart = useCallback(
        async (text: string) => {
            // Without this a double-tapped suggestion would spin up a second local
            // conversation that handleSend then refuses, leaving an empty stub.
            if (sendingRef.current || dailyLimitReached) return
            const id = makeId()
            const fresh: ChatConversation = {
                id,
                title: text.slice(0, 60),
                preview: text,
                updatedAt: Date.now(),
                unread: 0,
                messages: [],
            }
            setConversations((prev) => [fresh, ...prev])
            setActiveId(id)
            await handleSend(text, { conversationIdOverride: id })
        },
        [handleSend, dailyLimitReached]
    )

    // One advisory line, most urgent first.
    const composerNotice = useMemo(() => {
        if (dailyLimitReached) {
            return limits?.dailyLimit
                ? (t(
                      "You've used all {{count}} messages for today. Resets tomorrow.",
                      {
                          count: limits.dailyLimit,
                      }
                  ) as string)
                : (t('Daily message limit reached. Resets tomorrow.') as string)
        }
        if (retryCountdown > 0) {
            return t('Sending too fast — retrying in {{count}}s', {
                count: retryCountdown,
            }) as string
        }
        const remaining = limits?.dailyRemaining
        if (
            typeof remaining === 'number' &&
            remaining <= DAILY_REMAINING_WARN_AT
        ) {
            return t('{{count}} messages left today', {
                count: remaining,
            }) as string
        }
        return null
    }, [dailyLimitReached, limits, retryCountdown, t])

    return (
        <>
            <Fade in={open} unmountOnExit>
                <Box
                    role="dialog"
                    aria-label={t('AI Assistant') as string}
                    sx={{
                        position: 'fixed',
                        zIndex: (th) => th.zIndex.appBar + 50,
                        ...(isMobile
                            ? { inset: 0 }
                            : {
                                  right: 24,
                                  bottom: 96,
                                  width: 400,
                                  height: 560,
                              }),
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: isMobile
                            ? 'none'
                            : `0 18px 40px ${alpha(
                                  theme.palette.text.primary,
                                  0.18
                              )}`,
                        borderRadius: isMobile ? 0 : 3,
                        overflow: 'hidden',
                        border: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Box
                        sx={{
                            px: 1.5,
                            py: 1,
                            backgroundColor: theme.palette.background.paper,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <Box
                            sx={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 30,
                            }}
                        >
                            {/* Back arrow pinned left, only in detail view. */}
                            {activeChat && (
                                <IconButton
                                    onClick={handleBack}
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        left: 0,
                                        color: theme.palette.text.primary,
                                    }}
                                    aria-label={
                                        t('Back to chat list') as string
                                    }
                                >
                                    <ArrowBackIcon fontSize="small" />
                                </IconButton>
                            )}

                            {/* Wordmark centered against the full header width. */}
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                            >
                                <Box
                                    component="img"
                                    src="/static/hexa-ai.png"
                                    alt=""
                                    aria-hidden
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                    }}
                                />
                                <Typography
                                    fontWeight={700}
                                    fontSize={18}
                                    noWrap
                                    sx={{ color: theme.palette.text.primary }}
                                >
                                    {t('AI Chat Bot')}
                                </Typography>
                            </Stack>

                            {/* Close pinned right — the primary way to dismiss the widget:
                  the floating launcher bubble hides itself while open, so this
                  is the only close control on both mobile and desktop. */}
                            <IconButton
                                onClick={onClose}
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    right: 0,
                                    color: theme.palette.text.primary,
                                }}
                                aria-label={t('Close') as string}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            position: 'relative',
                            flex: 1,
                            minHeight: 0,
                            overflow: 'hidden',
                        }}
                    >
                        <Fade in={!activeChat} timeout={220} unmountOnExit>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {conversations.length === 0 &&
                                !isFetchingConversations ? (
                                    <ChatWelcomeView
                                        onStart={handleQuickStart}
                                    />
                                ) : (
                                    <ChatListView
                                        conversations={conversations}
                                        onSelect={handleSelect}
                                        onNewChat={handleNewChat}
                                        onSuggestionSelect={handleQuickStart}
                                        onDelete={handleDeleteConversation}
                                        isLoading={isFetchingConversations}
                                    />
                                )}
                            </Box>
                        </Fade>
                        <Fade
                            in={Boolean(activeChat)}
                            timeout={220}
                            unmountOnExit
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {activeChat && (
                                    <ChatDetailView
                                        conversationId={activeChat.id}
                                        pendingMessages={
                                            activeChat.messages ?? []
                                        }
                                        messagesCount={
                                            activeChat.messagesCount ?? 0
                                        }
                                        onSend={handleSend}
                                        onStoreSelect={handleStoreSelect}
                                        onCategorySelect={handleCategorySelect}
                                        onCuisineSelect={handleCuisineSelect}
                                        onBogoOfferSelect={
                                            handleBogoOfferSelect
                                        }
                                        onHappyHourSelect={
                                            handleHappyHourSelect
                                        }
                                        onBundleSelect={handleBundleSelect}
                                        isTyping={isTyping}
                                        isSending={isSending}
                                        composerDisabled={dailyLimitReached}
                                        notice={composerNotice}
                                    />
                                )}
                            </Box>
                        </Fade>
                    </Box>
                </Box>
            </Fade>

            {happyHourModalData && (
                <HappyHourViewModal
                    isOpenModal={Boolean(activeHappyHour)}
                    onCloseModal={() => setActiveHappyHour(null)}
                    activeBogoItem={happyHourModalData}
                />
            )}
        </>
    )
}

export default ChatBotPopover
