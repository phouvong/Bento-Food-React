import { Avatar, Box, Stack, Typography, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import type { ChatCuisine } from "./types";

interface ChatCuisineChipsProps {
  cuisines: ChatCuisine[];
  cuisineImageUrl?: string;
  onSelect?: (cuisine: ChatCuisine) => void;
}

// `image_full_url` is `null` whenever the file is missing — that is normal on
// api/* routes, not an error, so fall back to the relative name and then to
// the Avatar's initial rather than treating it as a failure.
const buildImageSrc = (
  cuisine: ChatCuisine,
  cuisineImageUrl?: string
): string | undefined => {
  if (cuisine.image_full_url) return cuisine.image_full_url;
  if (!cuisine.image) return undefined;
  if (/^https?:\/\//i.test(cuisine.image)) return cuisine.image;
  if (!cuisineImageUrl) return undefined;
  return `${cuisineImageUrl.replace(/\/$/, "")}/${cuisine.image}`;
};

const ChatCuisineChips = ({
  cuisines,
  cuisineImageUrl,
  onSelect,
}: ChatCuisineChipsProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  if (!cuisines?.length) return null;

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
        spacing={1}
        sx={{ pt: 1, pb: 0.5, pr: 1, minWidth: "min-content" }}
      >
        {cuisines.map((cuisine) => {
          const imgSrc = buildImageSrc(cuisine, cuisineImageUrl);
          return (
            <Stack
              key={cuisine.id}
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : -1}
              onClick={() => onSelect?.(cuisine)}
              onKeyDown={(e) => {
                if (onSelect && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSelect(cuisine);
                }
              }}
              direction="column"
              alignItems="center"
              spacing={0.75}
              sx={{
                width: 72,
                py: 1,
                px: 0.5,
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                cursor: onSelect ? "pointer" : "default",
                transition:
                  "border-color 120ms ease, background-color 120ms ease, transform 120ms ease",
                "&:hover": onSelect
                  ? {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      transform: "translateY(-2px)",
                    }
                  : undefined,
              }}
            >
              <Avatar
                src={imgSrc}
                alt={cuisine.name}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {!imgSrc && cuisine.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography
                fontSize={11}
                fontWeight={600}
                textAlign="center"
                noWrap
                sx={{
                  width: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  px: 0.25,
                  color: theme.palette.text.primary,
                }}
                title={cuisine.name}
              >
                {t(cuisine.name)}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};

export default ChatCuisineChips;
