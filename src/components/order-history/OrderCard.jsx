import React from "react";
import { alpha, Box, Button, Stack, Typography } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useTheme } from "@mui/material/styles";

import { getAmount } from "@/utils/customFunctions";
import { setDeliveryManInfoByDispatch } from "@/redux/slices/searchFilter";
import OrderItemThumbnails from "./OrderItemThumbnails";

// Figma node 261:39656 — restaurant/status | item thumbnails + names | price
// + action, all on one row. The date itself now lives in the group header
// (see OrderHistoryPage), so it's dropped from the card.
const OrderCard = ({ order, refetch }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch();

  const { global } = useSelector((state) => state.globalSettings);

  const currencySymbol = global?.currency_symbol;
  const currencySymbolDirection = global?.currency_symbol_direction;
  const digitAfterDecimalPoint = global?.digit_after_decimal_point;

  const handleClick = () => {
    if (order?.delivery_man) {
      dispatch(setDeliveryManInfoByDispatch(order.delivery_man));
    }
    router.push({
      pathname: "/info",
      query: { page: "order", orderId: order?.id },
    });
  };

  const handleTrackOrder = () => {
    if (order?.delivery_man) {
      dispatch(setDeliveryManInfoByDispatch(order.delivery_man));
    }
    router.push({
      pathname: "/info",
      query: {
        page: "order",
        orderId: order?.id,
        isTrackOrder: true,
      },
    });
  };

  const getStatusColor = () => {
    switch (order?.order_status) {
      case "pending":
        return theme.palette.warning.main;
      case "confirmed":
        return theme.palette.info.main;
      case "processing":
        return theme.palette.info.main;
      case "out_for_delivery":
        return theme.palette.primary.main;
      case "delivered":
        return theme.palette.success.main;
      case "canceled":
      case "failed":
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  // The order-list API doesn't return item images/names yet — only a count —
  // so this stays empty until that field ships, and the card falls back to
  // "N Items" below.
  const items = (order?.details || [])
    .map((detail) => ({
      id: detail?.id,
      name: detail?.food_details?.name,
      image: detail?.food_details?.image_full_url,
    }))
    .filter((item) => item?.name);
  const itemNames = items.map((item) => item.name).join(", ");
  const itemCount = order?.details_count ?? order?.details?.length ?? 0;

  const isActiveOrder =
    order?.order_status !== "delivered" &&
    order?.order_status !== "canceled" &&
    order?.order_status !== "failed";

  return (
    <Stack
      onClick={handleClick}
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      flexWrap="wrap"
      gap="16px"
      sx={{ width: "100%", cursor: "pointer", py: "4px" }}
    >
        {/* Restaurant + status */}
        <Stack
          sx={{ flex: 1, minWidth: { xs: "100%", sm: "220px" } }}
          gap="6px"
        >
          <Typography
            noWrap
            sx={{
              fontSize: "18px",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.54px",
              color: (theme) => theme.palette.text.primary,
            }}
          >
            {order?.restaurant?.name}
          </Typography>
          <Stack direction="row" alignItems="center" gap="8px">
            <Typography
              noWrap
              sx={{
                fontSize: "14px",
                color: (theme) => theme.palette.text.secondary,
              }}
            >
              {t("Order #")}
              {order?.id}
            </Typography>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                height: "20px",
                px: "8px",
                borderRadius: "999px",
                flexShrink: 0,
                backgroundColor: alpha(getStatusColor(), 0.15),
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 400,
                  letterSpacing: "-0.36px",
                  textTransform: "capitalize",
                  whiteSpace: "nowrap",
                  color: getStatusColor(),
                }}
              >
                {t(order?.order_status)?.replaceAll("_", " ")}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {/* Items */}
        <Stack
          direction="row"
          alignItems="center"
          gap="16px"
          sx={{ flex: 1, minWidth: { xs: "100%", sm: "220px" } }}
        >
          <OrderItemThumbnails items={items} />
          <Typography
            sx={{
              fontSize: "14px",
              color: (theme) => theme.palette.text.secondary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {itemNames || `${itemCount} ${t("Items")}`}
          </Typography>
        </Stack>

        {/* Price + action */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={{ xs: "space-between", sm: "flex-end" }}
          gap="16px"
          sx={{ flex: 1, minWidth: { xs: "100%", sm: "220px" } }}
        >
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.6px",
              whiteSpace: "nowrap",
              color: (theme) => theme.palette.text.primary,
            }}
          >
            {getAmount(
              order?.order_amount,
              currencySymbolDirection,
              currencySymbol,
              digitAfterDecimalPoint
            )}
          </Typography>

          {isActiveOrder ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<LocalShippingIcon />}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleTrackOrder();
              }}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                px: "16px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {t("Track Order")}
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                px: "16px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {t("Details")}
            </Button>
          )}
        </Stack>
    </Stack>
  );
};

export default OrderCard;
