import { Box, Stack, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState, type ReactElement } from "react";
import BogoOfferCardImpl from "@/components/bogo-page/BogoOfferCard";
import type { ChatBogoOffer } from "./types";

// The chat's `bogo_offers` rows are byte-identical to `GET /bogo/offers`, so
// the BOGO list page's own card renders them as-is — no parallel design to keep
// in step. It is a plain JS component, hence the explicit (loose) prop shape.
const BogoOfferCard = BogoOfferCardImpl as unknown as (props: {
  item: ChatBogoOffer;
  onClick?: () => void;
  loading?: boolean;
}) => ReactElement;

interface ChatBogoOfferChipsProps {
  offers: ChatBogoOffer[];
  onSelect?: (offer: ChatBogoOffer) => void;
}

const ChatBogoOfferChips = ({ offers, onSelect }: ChatBogoOfferChipsProps) => {
  const theme = useTheme();
  // Tapping hands off to the offer screen, which takes a moment to route. The
  // card has its own spinner overlay for exactly this, same as the list page.
  const [pendingId, setPendingId] = useState<number | null>(null);
  if (!offers?.length) return null;

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        "&::-webkit-scrollbar": { height: 4 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: alpha(theme.palette.text.primary, 0.15),
          borderRadius: 2,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ pt: 1, pb: 0.5, pr: 1, minWidth: "min-content" }}
      >
        {offers.map((offer) => (
          <Box key={offer.id} sx={{ width: 260, flexShrink: 0 }}>
            <BogoOfferCard
              item={offer}
              loading={pendingId === offer.id}
              onClick={
                onSelect
                  ? () => {
                      setPendingId(offer.id);
                      onSelect(offer);
                    }
                  : undefined
              }
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default ChatBogoOfferChips;
