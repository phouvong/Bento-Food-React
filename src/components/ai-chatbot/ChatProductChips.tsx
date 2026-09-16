import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import {
  Box,
  Chip,
  Collapse,
  Rating,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import dynamic from "next/dynamic";
import { useState, type ReactElement, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CustomImageContainerImpl from "@/components/CustomImageContainer";
import { RTL } from "@/components/RTL/RTL";
import { handleBadge } from "@/utils/customFunctions";
import useFormatAmount from "./useFormatAmount";
import type { ChatProduct } from "./types";

// FoodDetailModal is a plain JS component with its own data-fetching (it
// looks the product up by id), so passing the lighter ChatProduct shape is
// enough — same pattern NewFoodCard/FoodCard use.
const FoodDetailModal = dynamic(() =>
  import("@/components/foodDetail-modal/FoodDetailModal")
);

// CustomImageContainer is a JS component whose props are all optional, but
// destructured-prop inference makes TS treat them as required. Re-type it
// with an explicit (loose) prop shape so the call site stays clean.
const CustomImageContainer = CustomImageContainerImpl as unknown as (props: {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  objectFit?: string;
  borderRadius?: string;
}) => ReactElement;

type ChatVariation = NonNullable<ChatProduct["variations"]>[number];
type ChatAddon = NonNullable<ChatProduct["add_ons"]>[number];

interface ChatProductChipsProps {
  products: ChatProduct[];
  productImageUrl?: string;
}

const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

interface CollapsibleSectionProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}

// White, softly-shadowed accordion card. Collapse + a rotating chevron instead
// of MUI Accordion, which drags in a lot of default margin/summary styling.
const CollapsibleSection = ({
  title,
  subtitle,
  children,
}: CollapsibleSectionProps) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{
        borderRadius: "10px",
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        boxShadow: `0 1px 6px ${alpha(theme.palette.text.primary, 0.06)}`,
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
          }
        }}
        sx={{ px: 2, py: 1, cursor: "pointer" }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography fontSize={14} fontWeight={700} color={theme.palette.text.primary}>
            {title}
          </Typography>
          <KeyboardArrowDownRoundedIcon
            sx={{
              fontSize: 26,
              color: theme.palette.text.secondary,
              transition: "transform 160ms ease",
              transform: open ? "rotate(180deg)" : "none",
            }}
          />
        </Stack>
        {subtitle}
      </Box>
      <Collapse in={open} unmountOnExit>
        <Stack spacing={1.5} sx={{ px: 2, pb: 2 }}>
          {children}
        </Stack>
      </Collapse>
    </Box>
  );
};

const RequirementChip = ({ required }: { required: boolean }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Chip
      label={required ? t("Required") : t("Optional")}
      size="small"
      sx={{
        height: 24,
        fontSize: 12,
        fontWeight: 400,
        borderRadius: 1,
        backgroundColor: alpha(
          required ? theme.palette.success.main : theme.palette.text.primary,
          required ? 0.14 : 0.06
        ),
        color: required
          ? theme.palette.success.main
          : theme.palette.text.secondary,
      }}
    />
  );
};

interface OptionRowProps {
  label: string;
  price?: number;
  selected: boolean;
}

// Read-only per spec: just reflects the payload's default selection via
// label color, no radio/checkbox control.
const OptionRow = ({ label, price, selected }: OptionRowProps) => {
  const formatAmount = useFormatAmount();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 1 }}
    >
      <Stack minWidth={0}>
        <Typography
          fontSize={14}
          fontWeight={400}
          color={selected ? "primary.main" : "text.primary"}
        >
          {label}
        </Typography>
        {typeof price === "number" && price > 0 && (
          <Typography fontSize={13} color="text.secondary">
            {formatAmount(price)}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

const VariationGroup = ({ group }: { group: ChatVariation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMulti = group.type === "multi";
  const isRequired = group.required === "on";
  const max = toNumber(group.max);

  const subtitle =
    isMulti && max > 0
      ? (t("Select up to {{count}} options", { count: max }) as string)
      : (t("Select at least One") as string);

  return (
    <Box
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        borderRadius: 1,
        p: 1,
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 0.5 }}
      >
        <Stack minWidth={0}>
          <Typography  fontSize={14} fontWeight={700} color={theme.palette.text.primary}>
            {group.name}
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            {subtitle}
          </Typography>
        </Stack>
        <RequirementChip required={isRequired} />
      </Stack>
      <Stack
        sx={{
          "& > *:not(:last-child)": {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          },
        }}
      >
        {(group.values ?? []).map((v, i) => (
          <OptionRow
            key={v.option_id ?? `${v.label}-${i}`}
            label={v.label}
            price={toNumber(v.optionPrice)}
            selected={Boolean(v.isSelected || v.isChecked)}
          />
        ))}
      </Stack>
    </Box>
  );
};

interface ProductCardProps {
  product: ChatProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const formatAmount = useFormatAmount();
  const [descOpen, setDescOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { global } = useSelector((state: any) => state.globalSettings) ?? {};

  const currencySymbol = global?.currency_symbol;
  const currencySymbolDirection = global?.currency_symbol_direction;
  const digitAfterDecimalPoint = global?.digit_after_decimal_point;
  const languageDirection =
    typeof window !== "undefined" ? localStorage.getItem("direction") : "ltr";

  const imageUrl = product?.image_full_url;
  const hasDiscount = product.price > product.discounted_price;
  const variations = (product.variations ?? []).filter(
    (g) => (g.values?.length ?? 0) > 0
  );
  const addons = product.add_ons ?? [];
  const isLongDesc = (product.description?.length ?? 0) > 80;

  return (
    <>
      <Stack
        spacing={2}
        onClick={() => setOpenModal(true)}
        sx={{
          width: "100%",
          p: 2,
          borderRadius: 2,
          cursor: "pointer",
          border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          backgroundColor: alpha(theme.palette.text.primary, 0.03),
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: "10px",
              overflow: "hidden",
              flexShrink: 0,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <CustomImageContainer
              src={product?.image_full_url}
              alt={product.name}
              width="100px"
              height="100px"
              objectFit="cover"
              borderRadius="10px"
            />
          </Box>

          <Stack flex={1} minWidth={0} spacing={0}>
            {product.store_name && (
              <Typography
                fontSize={14}
                fontWeight={600}
                color="primary.main"
                noWrap
              >
                {product.store_name}
              </Typography>
            )}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                fontSize={16}
                fontWeight={500}
                noWrap
                title={product.name}
                color={theme.palette.text.primary}
              >
                {product.name}
              </Typography>
              {typeof product.veg === "boolean" && (
                <Box
                  aria-label={(product.veg ? t("Veg") : t("Non-veg")) as string}
                  sx={{
                    width: 14,
                    height: 14,
                    flexShrink: 0,
                    borderRadius: "4px",
                    border: `2px solid ${
                      product.veg
                        ? theme.palette.success.main
                        : theme.palette.error.main
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: product.veg
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                    }}
                  />
                </Box>
              )}
            </Stack>

            {(product.avg_rating > 0 || product.rating_count > 0) && (
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Rating
                  value={product.avg_rating || 0}
                  precision={0.5}
                  readOnly
                  sx={{ color: theme.palette.primary.main, fontSize: 20 }}
                />
                <Typography fontSize={13} color="text.secondary">
                  ({product.rating_count}+)
                </Typography>
              </Stack>
            )}

            <Stack direction="row" alignItems="baseline" spacing={1}>
              {hasDiscount && (
                <Typography
                  fontSize={16}
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  {formatAmount(product.price)}
                </Typography>
              )}
              <Typography fontSize={18} fontWeight={700} color={theme.palette.text.primary}>
                {formatAmount(product.discounted_price)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {product.description && (
          <Box>
            <Typography fontSize={16} fontWeight={700} sx={{ mb: 0.75 }} color={theme.palette.text.primary}>
              {t("Description")}
            </Typography>
            <Typography
              fontSize={14}
              color="text.secondary"
              sx={{
                lineHeight: 1.6,
                ...(descOpen
                  ? {}
                  : {
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }),
              }}
            >
              {product.description}
            </Typography>
            {isLongDesc && (
              <Typography
                component="span"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setDescOpen((v) => !v);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    setDescOpen((v) => !v);
                  }
                }}
                fontSize={14}
                fontWeight={600}
                color="primary.main"
                sx={{ cursor: "pointer" }}
              >
                {descOpen ? t("See Less") : t("See More")}
              </Typography>
            )}
          </Box>
        )}

        {variations.length > 0 && (
          <CollapsibleSection title={t("Variations") as string}>
            {variations.map((group, i) => (
              <VariationGroup key={`${group.name}-${i}`} group={group} />
            ))}
          </CollapsibleSection>
        )}

        {addons.length > 0 && (
          <CollapsibleSection
            title={t("Add-ons") as string}
            subtitle={
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 0.75 }}
              >
                <Typography fontSize={13} color="text.secondary">
                  {t("Select at least One")}
                </Typography>
                <RequirementChip required={false} />
              </Stack>
            }
          >
            <Stack
              sx={{
                "& > *:not(:last-child)": {
                  borderBottom: `1px solid ${alpha(
                    theme.palette.divider,
                    0.6
                  )}`,
                },
              }}
            >
              {addons.map((a: ChatAddon, i) => (
                <OptionRow
                  key={a.id ?? `${a.name}-${i}`}
                  label={a.name}
                  price={toNumber(a.price)}
                  selected={Boolean(a.isChecked)}
                />
              ))}
            </Stack>
          </CollapsibleSection>
        )}
      </Stack>

      {openModal && (
        <RTL direction={languageDirection}>
          <FoodDetailModal
            product={product}
            image={imageUrl}
            open={openModal}
            handleModalClose={() => setOpenModal(false)}
            setOpen={setOpenModal}
            currencySymbolDirection={currencySymbolDirection}
            currencySymbol={currencySymbol}
            digitAfterDecimalPoint={digitAfterDecimalPoint}
            productUpdate={undefined}
            handleBadge={handleBadge}
            campaign={undefined}
            paperSx={undefined}
            reelId={undefined}
          />
        </RTL>
      )}
    </>
  );
};

const ChatProductChips = ({ products }: ChatProductChipsProps) => {
  const theme = useTheme();
  if (!products?.length) return null;

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        "&::-webkit-scrollbar": { height: 4 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: alpha(theme.palette.text.primary, 0.15),
          borderRadius: "16px",
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="flex-start"
        sx={{ pb: 0.5, pr: 1, minWidth: "min-content", mt: 1 }}
      >
        {products.map((p) => (
          <Stack key={p.id} spacing={1.5} sx={{ width: 344, flexShrink: 0 }}>
            <ProductCard product={p} />
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default ChatProductChips;
