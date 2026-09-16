import type { RunningHappyHour } from "@/hooks/react-query/happy-hour/useGetRunningHappyHour";

export type ChatRole = "user" | "bot";

export interface ChatProduct {
  id: number;
  name: string;
  price: number;
  discounted_price: number;
  discount: number;
  discount_type: "percent" | "amount" | string;
  discount_label: string;
  avg_rating: number;
  rating_count: number;
  image: string;
  image_full_url?: string;
  store_id: number;
  store_name: string;
  store_logo?: string;
  store_logo_full_url?: string;
  category_name?: string;
  stock?: number;
  veg?: boolean;
  description?: string;
  // StackFood "new variation" format: groups of choices. Prices arrive as
  // string|number from the API, so callers coerce before formatting.
  variations?: Array<{
    name: string;
    type?: "single" | "multi" | string;
    min?: string | number;
    max?: string | number;
    required?: "on" | "off" | string;
    values?: Array<{
      label: string;
      optionPrice?: string | number;
      option_id?: number;
      isSelected?: boolean;
      isChecked?: boolean;
    }>;
  }>;
  add_ons?: Array<{
    id?: number;
    name: string;
    price?: string | number;
    isChecked?: boolean;
  }>;
}

export interface ChatStore {
  id: number;
  name: string;
  slug?: string;
  logo?: string;
  logo_full_url?: string | null;
  cover_photo?: string;
  cover_photo_full_url?: string | null;
  avg_rating: number;
  rating_count?: number;
  order_count?: number;
  delivery_time?: string;
  minimum_order?: number;
  free_delivery?: boolean;
  is_open?: boolean;
  featured?: boolean;
  delivery?: boolean;
  take_away?: boolean;
  veg?: boolean;
  non_veg?: boolean;
}

export interface ChatCartItem {
  id?: number;
  cart_id?: number;
  item_id?: number;
  name?: string;
  image?: string;
  image_full_url?: string;
  price?: number;
  unit_price?: number;
  discounted_price?: number;
  quantity: number;
  total_price?: number;
  store_id?: number;
  store_name?: string;
  variation?: unknown;
  item?: ChatProduct & Record<string, any>;
}

export interface ChatCategory {
  id: number;
  name: string;
  image?: string;
  image_full_url?: string;
  slug?: string;
  parent_id?: number | null;
  priority?: number;
}

export interface ChatCuisine {
  id: number;
  name: string;
  slug?: string;
  image?: string;
  image_full_url?: string | null;
}

// Byte-identical to a `GET /bogo/offers` row plus `item_type`, which is why
// the existing BogoOfferCard takes one of these as-is.
export interface ChatBogoOffer {
  id: number;
  slug?: string;
  title: string;
  description?: string;
  image_full_url?: string | null;
  buy_qty?: number;
  get_qty?: number;
  offer_label?: string;
  start_date?: string;
  end_date?: string;
  valid_until?: string;
  usage_limit_per_customer?: number | null;
  // Scoped to this customer. `null` means no per-customer limit at all, which
  // is not the same as `0` (allowance spent) — don't collapse them.
  remaining_uses?: number | null;
  item_type?: "bogo_offer" | (string & {});
}

// Identical to the `happy_hour` object on `GET /happy-hour/running`, so the
// shape is reused rather than restated — one definition to keep in step.
export type ChatHappyHour = RunningHappyHour & {
  item_type?: "happy_hour" | (string & {});
};

// A row inside a bundle's buy_items / free_items. Kept open-ended: these are
// full cart rows and only the display fields are read here.
export interface ChatBogoBundleItem extends Record<string, unknown> {
  id?: number;
  item_id?: number;
  name?: string;
  image?: string;
  image_full_url?: string | null;
  quantity?: number;
  price?: number;
}

export interface ChatBogoDetails {
  // Three ids, deliberately not interchangeable:
  //   bogo_group_id -> this cart line   (removing this bundle)
  //   bundle_id     -> the enrolment    (linking to that restaurant's bundle)
  //   bogo_offer_id -> the offer itself (opening the offer screen)
  bogo_group_id: string;
  bundle_id?: number;
  bogo_offer_id: number;
  offer_title?: string;
  offer_slug?: string;
  offer_start_date?: string;
  offer_end_date?: string;
  quantity?: number;
  bundle_price?: number;
  total_price?: number;
  original_price?: number;
  discount_percentage?: number;
  discount_amount?: number;
  final_price?: number;
  total_discount_amount?: number;
  total_final_price?: number;
  // A happy hour is the one promotion that also reaches a bundle.
  is_happy_hour?: boolean;
  happy_hour?: Record<string, unknown> | null;
  // A bundle can go stale in the cart (sold out, store closed, allowance
  // spent). Surface the reason and block checkout.
  is_available?: boolean;
  unavailable_reason?: string | null;
  buy_items?: ChatBogoBundleItem[];
  free_items?: ChatBogoBundleItem[];
}

export interface ChatCartLine {
  // Both are `null` on a bundle line by design — no single cart row represents
  // a bundle. Branch on `bogo_details`, never on these.
  cart_id: number | null;
  item_id: number | null;
  name?: string;
  variation?: string;
  image?: string;
  image_full_url?: string | null;
  quantity?: number;
  unit_price?: number;
  line_total?: number;
  bogo_details: ChatBogoDetails | null;
}

// A StackFood cart can hold several restaurants and each is checked out
// separately, so the grouping is part of the data, not just presentation.
export interface ChatCartStore {
  store_id: number;
  store_name?: string;
  items?: ChatCartLine[];
  store_subtotal?: number;
}

export interface ChatCart {
  stores?: ChatCartStore[];
  grand_total?: number;
  total_items?: number;
}

// A type predicate, so a `cartHasContent(cart)` check also narrows away the
// null/undefined at the call site.
export const cartHasContent = (cart?: ChatCart | null): cart is ChatCart =>
  Boolean(cart?.stores?.some((store) => (store?.items?.length ?? 0) > 0));

export interface ChatMessageMetadata {
  products?: ChatProduct[];
  stores?: ChatStore[];
  categories?: ChatCategory[];
  cuisines?: ChatCuisine[];
  bogo_offers?: ChatBogoOffer[];
  happy_hours?: ChatHappyHour[];
  cart?: ChatCart | null;
  // Pre-release shape: a bundle arrived as its separate rows, including a free
  // item priced 0. Retained because `GET /messages` replays stored metadata,
  // so conversations saved before the release still carry it.
  cart_items?: ChatCartItem[];
  cart_updated?: boolean;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
  toolName?: string | null;
  metadata?: ChatMessageMetadata | null;
}

export interface ChatConversation {
  id: string;
  title: string;
  preview?: string;
  updatedAt: number;
  unread?: number;
  messagesCount?: number;
  status?: string;
  messages?: ChatMessage[];
  isDraft?: boolean;
}

export interface AiChatConversationApi {
  id: number;
  user_id: number | null;
  guest_id: string | null;
  module_id: number | null;
  zone_id: number | null;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages_count: number;
}

export interface AiChatConversationsResponse {
  total_size: number;
  limit: number;
  offset: number;
  data: AiChatConversationApi[];
}

export const mapApiConversation = (
  c: AiChatConversationApi
): ChatConversation => ({
  id: String(c.id),
  title: c.title || "Untitled chat",
  updatedAt: c.updated_at ? new Date(c.updated_at).getTime() : Date.now(),
  messagesCount: c.messages_count,
  status: c.status,
  unread: 0,
});

export interface AiChatMessageApi {
  id: number;
  conversation_id: number;
  role: "user" | "assistant" | string;
  content: string;
  tool_name: string | null;
  metadata: ChatMessageMetadata | null;
  created_at: string;
  updated_at: string;
}

export interface AiChatMessagesResponse {
  total_size?: number;
  limit?: number;
  offset: number;
  conversation_id: number;
  data: AiChatMessageApi[];
}

export const mapApiMessage = (m: AiChatMessageApi): ChatMessage => ({
  id: String(m.id),
  role: m.role === "user" ? "user" : "bot",
  text: m.content ?? "",
  createdAt: m.created_at ? new Date(m.created_at).getTime() : Date.now(),
  toolName: m.tool_name,
  metadata: m.metadata,
});
