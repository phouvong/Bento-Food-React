import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import {
  Box,
  CircularProgress,
  Grow,
  IconButton,
  InputBase,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import useGetAiChatMessages from "@/hooks/react-query/ai-chat/useGetAiChatMessages";
import ChatBogoOfferChips from "./ChatBogoOfferChips";
import ChatCartCard from "./ChatCartCard";
import ChatCartChips from "./ChatCartChips";
import ChatCategoryChips from "./ChatCategoryChips";
import ChatCuisineChips from "./ChatCuisineChips";
import ChatDetailShimmer from "./ChatDetailShimmer";
import ChatHappyHourChips from "./ChatHappyHourChips";
import ChatProductChips from "./ChatProductChips";
import ChatStoreChips from "./ChatStoreChips";
import { formatDayLabel, isSameDay } from "./sampleData";
import {
  cartHasContent,
  mapApiMessage,
  type AiChatMessagesResponse,
  type ChatBogoDetails,
  type ChatBogoOffer,
  type ChatCategory,
  type ChatCuisine,
  type ChatHappyHour,
  type ChatMessage,
  type ChatStore,
} from "./types";

interface ChatDetailViewProps {
  conversationId: string | null;
  pendingMessages?: ChatMessage[];
  messagesCount?: number;
  onSend: (text: string) => void;
  onStoreSelect?: (store: ChatStore) => void;
  onCategorySelect?: (category: ChatCategory) => void;
  onCuisineSelect?: (cuisine: ChatCuisine) => void;
  onBogoOfferSelect?: (offer: ChatBogoOffer) => void;
  onHappyHourSelect?: (happyHour: ChatHappyHour) => void;
  onBundleSelect?: (details: ChatBogoDetails) => void;
  isTyping?: boolean;
  /** A send is in flight. Every send is a paid AI call, so the composer locks
   *  rather than letting a double-tap burn the customer's daily allowance. */
  isSending?: boolean;
  /** Hard lock — the daily allowance is spent and retrying cannot succeed. */
  composerDisabled?: boolean;
  /** Advisory line above the composer, e.g. a low daily allowance warning. */
  notice?: string | null;
}

const isServerId = (id: string | null): id is string =>
  !!id && /^\d+$/.test(id);

// Bot replies arrive as light markdown; render **bold** inline without pulling
// in a full markdown dependency. Bold sits in `& strong` styling at the callsite.
const BOLD_SEGMENT = /(\*\*[^*]+\*\*)/g;
const renderInline = (text: string): React.ReactNode =>
  text.split(BOLD_SEGMENT).map((part, i) => {
    const bold = /^\*\*([^*]+)\*\*$/.exec(part);
    return bold ? <strong key={i}>{bold[1]}</strong> : <span key={i}>{part}</span>;
  });

const ChatDetailView = ({
  conversationId,
  pendingMessages = [],
  messagesCount = 0,
  onSend,
  onStoreSelect,
  onCategorySelect,
  onCuisineSelect,
  onBogoOfferSelect,
  onHappyHourSelect,
  onBundleSelect,
  isTyping,
  isSending,
  composerDisabled,
  notice,
}: ChatDetailViewProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { global } = useSelector((state: any) => state.globalSettings) ?? {};
  const productImageUrl: string | undefined = global?.base_urls?.product_image_url;
  const categoryImageUrl: string | undefined = global?.base_urls?.category_image_url;
  const cuisineImageUrl: string | undefined = global?.base_urls?.cuisine_image_url;

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const didInitialScrollRef = useRef<boolean>(false);
  const isNearBottomRef = useRef<boolean>(true);
  const seenPagesCountRef = useRef<number>(0);
  const prevScrollHeightRef = useRef<number>(0);

  const enabled = isServerId(conversationId);
  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    isLoading,
  } = useGetAiChatMessages({
    conversationId: enabled ? conversationId : null,
    enabled,
    messagesCount,
  });

  const fetchedMessages = useMemo<ChatMessage[]>(() => {
    if (!data?.pages) return [];
    const all: ChatMessage[] = [];
    (data.pages as AiChatMessagesResponse[]).forEach((p) => {
      (p?.data ?? []).forEach((m) => all.push(mapApiMessage(m)));
    });
    return all;
  }, [data]);

  const messages = useMemo<ChatMessage[]>(() => {
    const byId = new Map<string, ChatMessage>();
    fetchedMessages.forEach((m) => byId.set(m.id, m));
    pendingMessages.forEach((pending) => {
      const duplicate = fetchedMessages.some(
        (fetched) =>
          fetched.role === pending.role &&
          fetched.text === pending.text &&
          Math.abs(fetched.createdAt - pending.createdAt) < 60_000
      );
      if (!duplicate) byId.set(pending.id, pending);
    });
    return Array.from(byId.values()).sort((a, b) => a.createdAt - b.createdAt);
  }, [fetchedMessages, pendingMessages]);

  const decorations = useMemo(() => {
    return messages.map((m, i) => {
      const prev = messages[i - 1];
      const next = messages[i + 1];
      const isFirstInBurst = !prev || prev.role !== m.role;
      const isLastInBurst = !next || next.role !== m.role;
      const isFirstOfDay = !prev || !isSameDay(prev.createdAt, m.createdAt);
      const hasMedia =
        Boolean(m.metadata?.products?.length) ||
        Boolean(m.metadata?.stores?.length) ||
        Boolean(m.metadata?.categories?.length) ||
        Boolean(m.metadata?.cuisines?.length) ||
        Boolean(m.metadata?.bogo_offers?.length) ||
        Boolean(m.metadata?.happy_hours?.length) ||
        Boolean(m.metadata?.cart_items?.length) ||
        cartHasContent(m.metadata?.cart);
      return { isFirstInBurst, isLastInBurst, isFirstOfDay, hasMedia };
    });
  }, [messages]);

  useEffect(() => {
    didInitialScrollRef.current = false;
    isNearBottomRef.current = true;
    seenPagesCountRef.current = 0;
    prevScrollHeightRef.current = 0;
  }, [conversationId]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const handleScroll = () => {
      const distanceFromBottom =
        root.scrollHeight - root.scrollTop - root.clientHeight;
      isNearBottomRef.current = distanceFromBottom < 120;
    };
    root.addEventListener("scroll", handleScroll, { passive: true });
    return () => root.removeEventListener("scroll", handleScroll);
  }, [conversationId]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root || !hasPreviousPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          hasPreviousPage &&
          !isFetchingPreviousPage &&
          didInitialScrollRef.current
        ) {
          prevScrollHeightRef.current = root.scrollHeight;
          fetchPreviousPage();
        }
      },
      { root, rootMargin: "100px 0px 0px 0px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    hasPreviousPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
    conversationId,
  ]);

  useLayoutEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const pagesCount = data?.pages?.length ?? 0;
    const newPageLoaded = pagesCount > seenPagesCountRef.current;
    seenPagesCountRef.current = pagesCount;

    if (!didInitialScrollRef.current && messages.length > 0) {
      root.scrollTop = root.scrollHeight;
      didInitialScrollRef.current = true;
      isNearBottomRef.current = true;
      return;
    }

    if (newPageLoaded) {
      const heightDiff = root.scrollHeight - prevScrollHeightRef.current;
      if (heightDiff > 0) {
        root.scrollTop += heightDiff;
      }
      prevScrollHeightRef.current = 0;
      return;
    }

    if (isNearBottomRef.current) {
      root.scrollTop = root.scrollHeight;
    }
  }, [messages, isTyping, data]);

  // Every send is a paid AI call and a double-tap burns the customer's daily
  // allowance, so an in-flight send blocks the next one at the source rather
  // than relying on the button being visually disabled.
  const canSend = Boolean(draft.trim()) && !isSending && !composerDisabled;

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || isSending || composerDisabled) return;
    isNearBottomRef.current = true;
    onSend(trimmed);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showInitialLoader = enabled && isLoading && messages.length === 0;

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowAnchor: "none",
          px: 2,
          py: 1.5,
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(theme.palette.text.primary, 0.15),
            borderRadius: 3,
          },
        }}
      >
        <div ref={topSentinelRef} />

        {isFetchingPreviousPage && !showInitialLoader && (
          <Stack alignItems="center" sx={{ py: 1 }}>
            <CircularProgress size={18} />
          </Stack>
        )}

        {showInitialLoader && <ChatDetailShimmer rows={5} />}

        {!showInitialLoader && messages.length === 0 && enabled && (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{
              flex: 1,
              minHeight: 240,
              textAlign: "center",
              px: 3,
              opacity: 0.85,
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
              }}
            >
              <SmartToyOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography fontWeight={700} fontSize={14} color="text.primary">
              {t("Start the conversation")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("Ask anything — orders, deals, restaurants, recommendations.")}
            </Typography>
          </Stack>
        )}

        <Stack
          spacing={0.25}
          sx={{
            "& .chat-bubble-row": {
              animation: "chatBubbleEnter 220ms ease-out both",
            },
            "@keyframes chatBubbleEnter": {
              "0%": { opacity: 0, transform: "translateY(6px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {messages.map((m, i) => {
            const isUser = m.role === "user";
            // Every metadata key is always present and empty when unused, so a
            // missing one is never an error — each channel just renders when
            // non-empty, in array order (the order the assistant mentions them).
            const products = m.metadata?.products ?? [];
            const stores = m.metadata?.stores ?? [];
            const categories = m.metadata?.categories ?? [];
            const cuisines = m.metadata?.cuisines ?? [];
            const bogoOffers = m.metadata?.bogo_offers ?? [];
            const happyHours = m.metadata?.happy_hours ?? [];
            const cart = m.metadata?.cart;
            // Pre-release messages stored the cart as a flat `cart_items`
            // array; the new `cart` object supersedes it when present.
            const legacyCartItems = m.metadata?.cart_items ?? [];
            const d = decorations[i] ?? {
              isFirstInBurst: true,
              isLastInBurst: true,
              isFirstOfDay: i === 0,
              hasMedia: false,
            };

            return (
              <Box key={m.id} data-msg-id={m.id}>
                {d.isFirstOfDay && (
                  <Stack
                    direction="row"
                    justifyContent="center"
                    sx={{ my: 1.25 }}
                  >
                    <Box
                      sx={{
                        px: 1.25,
                        py: 0.25,
                        borderRadius: 999,
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        backgroundColor: alpha(
                          theme.palette.text.primary,
                          0.06
                        ),
                      }}
                    >
                      {formatDayLabel(m.createdAt)}
                    </Box>
                  </Stack>
                )}
                <Stack
                  className="chat-bubble-row"
                  direction="row"
                  justifyContent={isUser ? "flex-end" : "flex-start"}
                  sx={{ mt: d.isFirstInBurst ? 1.5 : 0.5 }}
                >
                  <Stack
                    alignItems={isUser ? "flex-end" : "flex-start"}
                    spacing={0.75}
                    sx={{
                      maxWidth: isUser ? "85%" : "100%",
                      width: isUser ? "auto" : "100%",
                    }}
                  >
                    {isUser ? (
                      <Box
                        sx={{
                          px: 2,
                          py: 1.25,
                          borderRadius: 3,
                          backgroundColor: alpha(
                            theme.palette.text.primary,
                            0.03
                          ),
                          border: `1px solid ${theme.palette.divider}`,
                          color: theme.palette.text.primary,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 15,
                            lineHeight: 1.55,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {m.text}
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={1} sx={{ width: "100%" }}>
                        {m.text
                          .split(/\n{2,}/)
                          .filter((para) => para.trim().length > 0)
                          .map((para, pi) => (
                            <Typography
                              key={pi}
                              sx={{
                                fontSize: 15,
                                lineHeight: 1.55,
                                color: theme.palette.text.primary,
                                whiteSpace: "pre-wrap",
                                "& strong": { fontWeight: 700 },
                              }}
                            >
                              {renderInline(para)}
                            </Typography>
                          ))}
                      </Stack>
                    )}
                    {products.length > 0 && (
                      <ChatProductChips
                        products={products}
                        productImageUrl={productImageUrl}
                      />
                    )}
                    {stores.length > 0 && (
                      <ChatStoreChips
                        stores={stores}
                        onSelect={onStoreSelect}
                      />
                    )}
                    {categories.length > 0 && (
                      <ChatCategoryChips
                        categories={categories}
                        categoryImageUrl={categoryImageUrl}
                        onSelect={onCategorySelect}
                      />
                    )}
                    {cuisines.length > 0 && (
                      <ChatCuisineChips
                        cuisines={cuisines}
                        cuisineImageUrl={cuisineImageUrl}
                        onSelect={onCuisineSelect}
                      />
                    )}
                    {bogoOffers.length > 0 && (
                      <ChatBogoOfferChips
                        offers={bogoOffers}
                        onSelect={onBogoOfferSelect}
                      />
                    )}
                    {happyHours.length > 0 && (
                      <ChatHappyHourChips
                        happyHours={happyHours}
                        capturedAt={m.createdAt}
                        onSelect={onHappyHourSelect}
                      />
                    )}
                    {cartHasContent(cart) ? (
                      <ChatCartCard
                        cart={cart}
                        productImageUrl={productImageUrl}
                        onBundleSelect={onBundleSelect}
                      />
                    ) : (
                      legacyCartItems.length > 0 && (
                        <ChatCartChips
                          items={legacyCartItems}
                          productImageUrl={productImageUrl}
                        />
                      )
                    )}
                  </Stack>
                </Stack>
              </Box>
            );
          })}

          {isTyping && (
            <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ mt: 1 }}>
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  borderTopLeftRadius: 4,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" spacing={0.5}>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: alpha(theme.palette.text.primary, 0.4),
                        animation: "chatbotDot 1.2s infinite",
                        animationDelay: `${i * 0.15}s`,
                        "@keyframes chatbotDot": {
                          "0%, 60%, 100%": { opacity: 0.25 },
                          "30%": { opacity: 1 },
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </Stack>
      </Box>

      <Box
        sx={{
          px: 1.25,
          py: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {notice && (
          <Typography
            fontSize={11}
            fontWeight={600}
            sx={{
              mb: 0.75,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              color: composerDisabled
                ? theme.palette.error.main
                : theme.palette.warning.main,
              backgroundColor: alpha(
                composerDisabled
                  ? theme.palette.error.main
                  : theme.palette.warning.main,
                0.12
              ),
            }}
          >
            {notice}
          </Typography>
        )}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            px: 1.5,
            py: 0.5,
            minHeight: 44,
            backgroundColor: alpha(theme.palette.text.primary, 0.02),
            transition:
              "border-color 140ms ease, background-color 140ms ease, box-shadow 140ms ease",
            "&:focus-within": {
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.palette.background.paper,
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
            },
          }}
        >
          <InputBase
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={composerDisabled}
            placeholder={
              (composerDisabled
                ? t("Daily limit reached")
                : t("Type a message...")) as string
            }
            multiline
            maxRows={5}
            sx={{
              flex: 1,
              fontSize: 14,
              lineHeight: 1.45,
              alignSelf: "stretch",
              display: "flex",
              alignItems: "center",
              "& textarea": {
                resize: "none",
                py: 0,
                lineHeight: 1.45,
              },
              "& .MuiInputBase-input": {
                py: 0,
                lineHeight: 1.45,
              },
            }}
          />
          <Grow in={Boolean(draft.trim()) || Boolean(isSending)} unmountOnExit>
            <IconButton
              onClick={handleSend}
              disabled={!canSend}
              aria-label={t("Send") as string}
              sx={{
                flexShrink: 0,
                width: 36,
                height: 36,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                boxShadow: `0 4px 10px ${alpha(
                  theme.palette.primary.main,
                  0.35
                )}`,
                transition:
                  "transform 140ms ease, background-color 140ms ease, box-shadow 140ms ease",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                  color: theme.palette.primary.contrastText,
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                "&.Mui-disabled": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.35),
                  color: theme.palette.primary.contrastText,
                  boxShadow: "none",
                },
              }}
            >
              {isSending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SendRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Grow>
        </Stack>
      </Box>
    </Stack>
  );
};

export default ChatDetailView;
