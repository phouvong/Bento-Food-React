import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import KeyboardVoiceOutlinedIcon from "@mui/icons-material/KeyboardVoiceOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import {
  Box,
  Grow,
  IconButton,
  InputBase,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ChatWelcomeViewProps {
  // Sending the first message spins up a fresh conversation upstream.
  onStart: (text: string) => void;
}

const ChatWelcomeView = ({ onStart }: ChatWelcomeViewProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [draft, setDraft] = useState("");

  const handleStart = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onStart(trimmed);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleStart();
    }
  };

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{
          flex: 1,
          px: 3,
          textAlign: "center",
          overflowY: "auto",
        }}
      >
        <Typography
          component="span"
          aria-hidden
          sx={{ fontSize: 44, lineHeight: 1 }}
        >
          👋
        </Typography>
        <Typography fontSize={18} sx={{ color: theme.palette.text.secondary }}>
          {t("Hi There,")}
        </Typography>
        <Typography fontWeight={700} fontSize={20} color="text.primary">
          {t("Welcome ! How can I help?")}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 320, lineHeight: 1.6,fontSize: "14px" }}
        >
          {t(
            "I'm here to help to process your order more easy then ever. Simply tell me what you need or upload a similar image that you want to buy."
          )}
        </Typography>
      </Stack>

      <Box
        sx={{
          px: 1.5,
          py: 1.5,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={.5}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 999,
            pl: 2,
            pr: 1,
            py: 0.5,
            minHeight: 48,
            backgroundColor: theme.palette.background.paper,
            transition: "border-color 140ms ease, box-shadow 140ms ease",
            "&:focus-within": {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
            },
          }}
        >
          <InputBase
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("Write me about your food") as string}
            sx={{ flex: 1, fontSize: 14 }}
          />
          {draft.trim() ? (
            <Grow in unmountOnExit>
              <IconButton
                onClick={handleStart}
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
                    "transform 140ms ease, background-color 140ms ease",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                    color: theme.palette.primary.contrastText,
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "translateY(0)" },
                }}
              >
                <SendRoundedIcon fontSize="small" />
              </IconButton>
            </Grow>
          ) : (
            <>
              {/* Visual placeholders for upcoming voice / image-search input. */}
              <IconButton
                aria-label={t("Voice input") as string}
                sx={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  border: `1.5px solid ${theme.palette.primary.main}`,
                  color: theme.palette.primary.main,
                }}
              >
                <KeyboardVoiceOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                aria-label={t("Upload image") as string}
                sx={{ flexShrink: 0, color: theme.palette.primary.main }}
              >
                <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </>
          )}
        </Stack>
      </Box>
    </Stack>
  );
};

export default ChatWelcomeView;
