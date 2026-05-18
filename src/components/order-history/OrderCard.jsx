import React, { useState } from "react";
import {
  alpha,
  Button,
  Card,
  Stack,
  Typography,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { getAmount } from "@/utils/customFunctions";
import CustomFormatedDateTime from "../date/CustomFormatedDateTime";
import CustomNextImage from "@/components/CustomNextImage";
import ReviewSideDrawer from "@/components/order-details/ReviewSideDrawer";
import { setDeliveryManInfoByDispatch } from "@/redux/slices/searchFilter";

const OrderCard = ({ order, refetch }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openReviewModal, setOpenReviewModal] = useState(false);

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

  const handleReviewClick = () => {
    dispatch(setDeliveryManInfoByDispatch(order?.delivery_man));
    setOpenReviewModal(true);
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

  return (
    <>
      <Card
        onClick={handleClick}
        sx={{
          p: { xs: 1.25, sm: 2 },
          borderRadius: 1,
          cursor: "pointer",
          backgroundColor: alpha(theme.palette.neutral[200], 0.5),
          boxShadow: 1,
        }}
      >
        <Stack spacing={{ xs: 1, sm: 1.2 }}>
          {/* TOP ROW */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ minWidth: 0, flex: 1 }}
            >
              {/* Restaurant Logo */}
              <CustomNextImage
                src={order?.restaurant?.logo_full_url}
                width={isMobile ? 36 : 40}
                height={isMobile ? 36 : 40}
                borderRadius="50%"
              />

              <Stack sx={{ minWidth: 0, flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                  flexWrap="wrap"
                  rowGap={0.5}
                >
                  <Typography
                    fontWeight={600}
                    fontSize={{ xs: 13, sm: 14 }}
                    noWrap
                  >
                    Order #{order?.id}
                  </Typography>

                  {/* Status Badge */}
                  <Typography
                    sx={{
                      px: 1,
                      py: "2px",
                      borderRadius: 1,
                      fontSize: { xs: 10.5, sm: 12 },
                      fontWeight: 500,
                      bgcolor: alpha(getStatusColor(), 0.15),
                      color: getStatusColor(),
                      textTransform: "capitalize",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t(order?.order_status).replaceAll("_", " ")}
                  </Typography>
                </Stack>
                <Typography
                  fontSize={{ xs: 11, sm: 12 }}
                  color="text.secondary"
                >
                  <CustomFormatedDateTime date={order?.created_at} />
                </Typography>
              </Stack>
            </Stack>

            {/* Amount */}
            <Typography
              fontWeight={700}
              fontSize={{ xs: 14, sm: 16 }}
              sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {getAmount(
                order?.order_amount,
                currencySymbolDirection,
                currencySymbol,
                digitAfterDecimalPoint
              )}
            </Typography>
          </Stack>

          {/* ITEMS + ORDER TYPE */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={{ xs: 1, sm: 0 }}
            sx={{
              backgroundColor: theme.palette.neutral[100],
              p: 1,
              borderRadius: 1,
            }}
          >
            <Typography fontSize={{ xs: 12, sm: 13 }} color="text.secondary">
              {order?.details_count ?? order?.details?.length ?? 0}{" "}
              {t("Items")}
              &nbsp; | &nbsp;
              <span
                style={{
                  textTransform: "capitalize",
                  color:
                    order?.order_type === "delivery"
                      ? "#4CAF50"
                      : order?.order_type === "take_away"
                      ? "#2196F3"
                      : order?.order_type === "dine_in"
                      ? "#FF9800"
                      : "inherit",
                }}
              >
                {t(order?.order_type?.replace("_", " "))}
              </span>
            </Typography>

            {/* ACTION BUTTONS */}
            {order?.order_status === "delivered" && !order?.is_reviewed ? (
              <Button
                size="small"
                variant="outlined"
                fullWidth={isMobile}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReviewClick();
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  color: "#FF9800",
                  fontSize: { xs: 12, sm: 13 },
                }}
              >
                ⭐ {t("Give Review")}
              </Button>
            ) : order?.order_status !== "delivered" &&
              order?.order_status !== "canceled" &&
              order?.order_status !== "failed" ? (
              <Button
                size="small"
                variant="contained"
                fullWidth={isMobile}
                startIcon={<LocalShippingIcon />}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTrackOrder();
                }}
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  px: 2,
                  fontSize: { xs: 12, sm: 13 },
                  backgroundColor: "#ff7a00",
                  "&:hover": {
                    backgroundColor: "#e56d00",
                  },
                }}
              >
                {t("Track Order")}
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Card>

      {/* REVIEW DRAWER */}
      <ReviewSideDrawer
        open={openReviewModal}
        onClose={() => setOpenReviewModal(false)}
        orderId={order?.id}
        refetch={refetch}
      />
    </>
  );
};

export default OrderCard;
