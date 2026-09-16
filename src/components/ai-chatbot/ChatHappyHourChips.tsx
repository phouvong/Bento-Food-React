import { Box, Stack, Typography, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import HappyHourIcon from "@/components/happy-hour/HappyHourIcon";
import type { ChatHappyHour } from "./types";

interface ChatHappyHourChipsProps {
  happyHours: ChatHappyHour[];
  /**
   * When the metadata was captured — the message's own timestamp. A reopened
   * conversation replays the `remaining_seconds` that were true when the reply
   * was written, so the elapsed time since is subtracted before counting down.
   * Live replies pass ~now, making this a no-op.
   */
  capturedAt?: number;
  onSelect?: (happyHour: ChatHappyHour) => void;
}

const pad = (value: number) => String(value).padStart(2, "0");

const HappyHourBannerCard = ({
  happyHour,
  capturedAt,
  onSelect,
}: {
  happyHour: ChatHappyHour;
  capturedAt?: number;
  onSelect?: (happyHour: ChatHappyHour) => void;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // The server-computed `remaining_seconds` is the authoritative seed — it is
  // immune to client clock and timezone drift, unlike parsing `ends_at`.
  const expiresAt = useMemo(() => {
    const seconds = Number(happyHour?.remaining_seconds);
    if (!Number.isFinite(seconds) || seconds <= 0) return null;
    return (capturedAt ?? Date.now()) + seconds * 1000;
  }, [happyHour?.id, happyHour?.remaining_seconds, capturedAt]);

  const [remaining, setRemaining] = useState(() =>
    expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : 0
  );

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(0);
      return;
    }
    const tick = () =>
      setRemaining(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const hasEnded = remaining <= 0;
  const discount = Number(happyHour?.discount) || 0;
  const clickable = Boolean(onSelect) && !hasEnded;

  // "25% OFF! Evening Happy Hour" — same composition the home banner uses,
  // reusing the existing '% OFF' translation key.
  const title = `${discount ? `${discount}${t("% OFF")}! ` : ""}${
    happyHour?.title ?? t("Happy Hour")
  }`;

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const showDays = days > 0;
  const showHours = showDays || hours > 0;
  const segments = [
    ...(showDays ? [pad(days)] : []),
    ...(showHours ? [pad(hours)] : []),
    pad(minutes),
    pad(seconds),
  ];
  // The chat panel is far narrower than the home feed, so the timer tightens
  // one step earlier than the banner's own `compact` threshold.
  const tight = segments.length > 3;

  // Fixed (not min-) width + tabular-nums so a digit changing width
  // (e.g. 9 -> 10) never reflows the box or shifts sibling segments.
  const timerNumberSx = {
    width: tight ? "22px" : "28px",
    flexShrink: 0,
    textAlign: "center" as const,
    fontSize: tight ? "12px" : "15px",
    fontWeight: 700,
    letterSpacing: "-0.48px",
    lineHeight: 1.1,
    padding: tight ? "4px" : "6px",
    backgroundColor: theme.palette.happyHourBanner.timerBg,
    borderRadius: "6px",
    color: theme.palette.whiteContainer.main,
    fontVariantNumeric: "tabular-nums",
    fontFeatureSettings: '"tnum"',
  };

  const colonSx = {
    width: tight ? "5px" : "8px",
    flexShrink: 0,
    textAlign: "center" as const,
    fontSize: tight ? "12px" : "15px",
    fontWeight: 700,
    color: theme.palette.happyHourBanner.timerColon,
  };

  return (
    <Stack
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : -1}
      onClick={() => clickable && onSelect?.(happyHour)}
      onKeyDown={(e) => {
        if (clickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect?.(happyHour);
        }
      }}
      direction="row"
      alignItems="center"
      sx={{
        width: "100%",
        gap: "8px",
        borderRadius: "16px",
        padding: "12px 12px 12px 14px",
        backgroundColor: theme.palette.happyHourBanner.bg,
        cursor: clickable ? "pointer" : "default",
        // A window that closed while the conversation sat in history still gets
        // its banner, so the reply's text is not left pointing at nothing.
        opacity: hasEnded ? 0.65 : 1,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: "32px",
          height: "32px",
          "& svg": { width: "100%", height: "100%" },
        }}
      >
        <HappyHourIcon />
      </Box>

      <Stack sx={{ flex: 1, minWidth: 0, gap: "4px" }}>
        <Typography
          component="h3"
          sx={{
            fontSize: "15px",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.48px",
            color: theme.palette.text.primary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={title}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: "12px",
            lineHeight: 1.3,
            color: theme.palette.referBanner.subtitle,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {happyHour?.short_description || t("Tap to View Offers.")}
        </Typography>
      </Stack>

      {hasEnded ? (
        <Typography
          sx={{
            flexShrink: 0,
            px: "8px",
            py: "4px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 700,
            color: theme.palette.text.secondary,
            backgroundColor: alpha(theme.palette.text.primary, 0.08),
          }}
        >
          {t("Ended")}
        </Typography>
      ) : (
        <Stack
          direction="row"
          sx={{
            flexShrink: 0,
            alignItems: "center",
            gap: tight ? "2px" : "4px",
            flexWrap: "nowrap",
          }}
        >
          {segments.map((value, index) => (
            <Fragment key={index}>
              {index > 0 && <Typography sx={colonSx}>:</Typography>}
              <Typography sx={timerNumberSx}>{value}</Typography>
            </Fragment>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

const ChatHappyHourChips = ({
  happyHours,
  capturedAt,
  onSelect,
}: ChatHappyHourChipsProps) => {
  if (!happyHours?.length) return null;

  // Full-width banners stacked, matching how the home feed places them — not
  // the horizontal scroller the item-style channels use.
  return (
    <Stack spacing={1} sx={{ width: "100%", pt: 1, pb: 0.5 }}>
      {happyHours.map((happyHour) => (
        <HappyHourBannerCard
          key={happyHour.id}
          happyHour={happyHour}
          capturedAt={capturedAt}
          onSelect={onSelect}
        />
      ))}
    </Stack>
  );
};

export default ChatHappyHourChips;
