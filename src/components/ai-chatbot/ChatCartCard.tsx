import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Avatar, Box, Stack, Typography, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import BogoCartItemCardImpl from "@/components/floating-cart/restaurant-cart/BogoCartItemCard";
import useFormatAmount from "./useFormatAmount";
import type {
  ChatBogoBundleItem,
  ChatBogoDetails,
  ChatCart,
  ChatCartLine,
  ChatCartStore,
} from "./types";

// The bundle line reuses the app's shared BOGO card — the same one checkout's
// order summary and order details render, in the same display-only mode. It is
// a plain JS component, hence the explicit (loose) prop shape.
const BogoCartItemCard = BogoCartItemCardImpl as unknown as (props: {
  name?: string;
  price?: string;
  oldPrice?: string;
  buyItems?: Array<{ id?: number; image?: string }>;
  freeItems?: Array<{ id?: number; image?: string }>;
  quantity?: number;
  hideStepper?: boolean;
}) => ReactElement;

interface ChatCartCardProps {
  cart: ChatCart;
  productImageUrl?: string;
  /** Opens the offer screen for a bundle line, keyed by `bogo_offer_id`. */
  onBundleSelect?: (details: ChatBogoDetails) => void;
}

// `image_full_url` is `null` whenever the file is missing — normal on api/*
// routes, so fall back to the relative name before giving up.
const resolveImage = (
  line: { image?: string; image_full_url?: string | null },
  productImageUrl?: string
): string | undefined => {
  if (line.image_full_url) return line.image_full_url;
  const raw = line.image;
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (!productImageUrl) return undefined;
  return `${productImageUrl.replace(/\/$/, "")}/${raw}`;
};

const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// Same shape the checkout and order-details call sites build. `buy_items` /
// `free_items` are full cart rows, so the image sits under `item` — the flatter
// spellings are accepted too rather than assuming one nesting.
const mapBogoAvatarItems = (
  rows: ChatBogoBundleItem[] = []
): Array<{ id?: number; image?: string }> =>
  rows.map((row) => ({
    id: row?.item_id ?? row?.id,
    image:
      ((row?.item as { image_full_url?: string } | undefined)
        ?.image_full_url as string | undefined) ??
      row?.image_full_url ??
      row?.image,
  }));

const BundleLine = ({
  line,
  onBundleSelect,
}: {
  line: ChatCartLine;
  onBundleSelect?: (details: ChatBogoDetails) => void;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const formatAmount = useFormatAmount();

  // Narrowed by the caller, but re-asserted so this component stands alone.
  const details = line.bogo_details;
  if (!details) return null;

  const bundlePrice = toNumber(
    details.final_price ?? details.bundle_price ?? line.unit_price
  );
  const originalPrice = toNumber(details.original_price);
  // Only a genuine markdown earns the strikethrough.
  const saving = originalPrice > bundlePrice ? originalPrice - bundlePrice : 0;

  // Absent means available; only an explicit `false` marks a stale bundle.
  const isUnavailable = details.is_available === false;
  const clickable = Boolean(onBundleSelect);

  return (
    <Stack sx={{ px: 1.25, py: 1.25 }} spacing={0.75}>
      <Box
        // The offer screen is reached by `bogo_offer_id` — not `bundle_id`
        // (the restaurant's enrolment) and not `bogo_group_id` (this line).
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : -1}
        onClick={() => onBundleSelect?.(details)}
        onKeyDown={(e) => {
          if (clickable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onBundleSelect?.(details);
          }
        }}
        sx={{ cursor: clickable ? "pointer" : "default" }}
      >
        <BogoCartItemCard
          name={line.name || details.offer_title}
          price={formatAmount(bundlePrice)}
          oldPrice={saving > 0 ? formatAmount(originalPrice) : undefined}
          buyItems={mapBogoAvatarItems(details.buy_items)}
          freeItems={mapBogoAvatarItems(details.free_items)}
          quantity={toNumber(line.quantity) || toNumber(details.quantity) || 1}
          // The assistant cannot re-quantify a bundle — it is one unit — so the
          // card renders in the same display-only mode checkout uses.
          hideStepper
        />
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        flexWrap="wrap"
        useFlexGap
      >
        {saving > 0 && (
          <Typography
            fontSize={10.5}
            fontWeight={700}
            sx={{ color: theme.palette.success.main }}
          >
            {`${t("You save")} ${formatAmount(saving)}`}
          </Typography>
        )}
        {/* A happy hour is the one promotion that also reaches a bundle. */}
        {details.is_happy_hour && (
          <Typography
            fontSize={10}
            fontWeight={700}
            sx={{
              px: 0.625,
              py: 0.125,
              borderRadius: 999,
              color: theme.palette.warning.main,
              backgroundColor: alpha(theme.palette.warning.main, 0.14),
            }}
          >
            {t("Happy Hour")}
          </Typography>
        )}
      </Stack>

      {isUnavailable && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{
            px: 0.75,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            color: theme.palette.error.main,
          }}
        >
          <ErrorOutlineRoundedIcon sx={{ fontSize: 14, flexShrink: 0 }} />
          <Typography fontSize={10.5} fontWeight={600}>
            {details.unavailable_reason || t("This offer is no longer available")}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

const OrdinaryLine = ({
  line,
  productImageUrl,
}: {
  line: ChatCartLine;
  productImageUrl?: string;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const formatAmount = useFormatAmount();

  const quantity = toNumber(line.quantity);
  const lineTotal = toNumber(line.line_total ?? toNumber(line.unit_price) * quantity);

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ px: 1.25, py: 0.875 }}
    >
      <Avatar
        src={resolveImage(line, productImageUrl)}
        alt={line.name ?? ""}
        variant="rounded"
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
        }}
      />
      <Stack flex={1} minWidth={0}>
        <Typography fontSize={12.5} fontWeight={600} noWrap color="text.primary">
          {line.name}
        </Typography>
        <Typography fontSize={11} color="text.secondary" noWrap>
          {[line.variation, quantity > 0 ? `${t("Qty")}: ${quantity}` : ""]
            .filter(Boolean)
            .join(" · ")}
        </Typography>
      </Stack>
      <Typography fontSize={12.5} fontWeight={700} color="primary.main">
        {formatAmount(lineTotal)}
      </Typography>
    </Stack>
  );
};

const StoreGroup = ({
  store,
  productImageUrl,
  onBundleSelect,
}: {
  store: ChatCartStore;
  productImageUrl?: string;
  onBundleSelect?: (details: ChatBogoDetails) => void;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const formatAmount = useFormatAmount();
  const items = store?.items ?? [];
  if (!items.length) return null;

  return (
    <Stack>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
          px: 1.25,
          py: 0.625,
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
        }}
      >
        <StorefrontOutlinedIcon
          sx={{ fontSize: 14, color: theme.palette.text.secondary }}
        />
        <Typography fontSize={11.5} fontWeight={700} noWrap flex={1}>
          {store.store_name}
        </Typography>
        <Typography fontSize={11.5} fontWeight={700} color="text.secondary">
          {formatAmount(toNumber(store.store_subtotal))}
        </Typography>
      </Stack>

      <Stack
        divider={<Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }} />}
      >
        {items.map((line, index) =>
          // Branch on `bogo_details`, never on `item_id` — both ids are
          // deliberately `null` on a bundle line.
          line?.bogo_details ? (
            <BundleLine
              key={line.bogo_details.bogo_group_id ?? `bundle-${index}`}
              line={line}
              onBundleSelect={onBundleSelect}
            />
          ) : (
            <OrdinaryLine
              key={line?.cart_id ?? `item-${store.store_id}-${index}`}
              line={line}
              productImageUrl={productImageUrl}
            />
          )
        )}
      </Stack>

      {/* Each restaurant in a StackFood cart is checked out separately, so the
          per-store subtotal is stated rather than only the grand total. */}
      <Box sx={{ px: 1.25, pb: 0.75 }}>
        <Typography fontSize={10} color="text.secondary">
          {t("Checked out separately")}
        </Typography>
      </Box>
    </Stack>
  );
};

const ChatCartCard = ({
  cart,
  productImageUrl,
  onBundleSelect,
}: ChatCartCardProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const formatAmount = useFormatAmount();

  const stores = (cart?.stores ?? []).filter(
    (store) => (store?.items?.length ?? 0) > 0
  );
  if (!stores.length) return null;

  const totalItems = toNumber(cart?.total_items);
  // A bundle can go stale in the cart; checkout must be blocked until it is
  // resolved, so the warning is surfaced here rather than at checkout time.
  const hasUnavailable = stores.some((store) =>
    (store.items ?? []).some((line) => line?.bogo_details?.is_available === false)
  );

  return (
    <Stack
      sx={{
        width: "100%",
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 1.25,
          py: 0.75,
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.main,
        }}
      >
        <ShoppingCartCheckoutIcon sx={{ fontSize: 16 }} />
        <Typography fontSize={12} fontWeight={700}>
          {t("Your cart")}
        </Typography>
        {totalItems > 0 && (
          <Typography fontSize={11.5} color="text.secondary" sx={{ ml: "auto" }}>
            {t("{{count}} items", { count: totalItems })}
          </Typography>
        )}
      </Stack>

      <Stack
        divider={<Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }} />}
      >
        {stores.map((store) => (
          <StoreGroup
            key={store.store_id}
            store={store}
            productImageUrl={productImageUrl}
            onBundleSelect={onBundleSelect}
          />
        ))}
      </Stack>

      {hasUnavailable && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{
            px: 1.25,
            py: 0.75,
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            color: theme.palette.error.main,
          }}
        >
          <ErrorOutlineRoundedIcon sx={{ fontSize: 14, flexShrink: 0 }} />
          <Typography fontSize={11} fontWeight={600}>
            {t("Remove the unavailable offer before checking out")}
          </Typography>
        </Stack>
      )}

      <Stack
        direction="row"
        alignItems="center"
        sx={{
          px: 1.25,
          py: 0.875,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography fontSize={12.5} fontWeight={700} flex={1}>
          {t("Total")}
        </Typography>
        <Typography fontSize={14} fontWeight={700} color="primary.main">
          {formatAmount(toNumber(cart?.grand_total))}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default ChatCartCard;
