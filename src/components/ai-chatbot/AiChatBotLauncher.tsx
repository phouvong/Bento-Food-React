import { Box, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getToken } from "@/utils/localStorage";
import { useAiChatDisabled } from "./aiChatErrors";
import ChatBotPopover from "./ChatBotPopover";

interface AiChatBotLauncherProps {
  unreadCount?: number;
  mobileBottom?: number;
  desktopBottom?: number;
}

const AiChatBotLauncher = ({
  unreadCount = 0,
  mobileBottom = 80,
  desktopBottom = 53,
}: AiChatBotLauncherProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  // Tracked but not gated — see comment below.
  const [, setIsLoggedIn] = useState(false);
  const { userData } = useSelector((state: any) => state.user) ?? {};
  // Flips as soon as any ai-chat call comes back `503 ai_disabled`.
  const aiChatDisabled = useAiChatDisabled();

  useEffect(() => {
    setIsLoggedIn(Boolean(getToken()));
    const handleStorage = () => setIsLoggedIn(Boolean(getToken()));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [userData]);

  // Launcher is visible to guests too — the API supports guest_id chats.
  // Flip this back on (and read `isLoggedIn`) if guest chat should be hidden.
  // if (!isLoggedIn) return null;

  // The admin switched the assistant off: hide the entry point entirely rather
  // than leaving a bubble that only ever produces an error.
  if (aiChatDisabled) return null;

  // The popover owns its own header close button (both mobile full-screen
  // and desktop anchored panel), so the floating bubble just hides itself
  // while open instead of doubling as a second, differently-positioned
  // close control.
  return (
    <>
      {!open && (
        <Tooltip title={t("Ask AI Assistant") as string} placement="left">
          <Box
            role="button"
            tabIndex={0}
            aria-label={t("AI Assistant") as string}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(true);
              }
            }}
            sx={{
              position: "fixed",
              right: { xs: 16, sm: 24 },
              bottom: {
                xs: `${mobileBottom}px`,
                sm: desktopBottom,
              },
              zIndex: (th) => th.zIndex.appBar - 10,
              width: { xs: 44, sm: 56 },
              height: { xs: 44, sm: 56 },
              cursor: "pointer",
            }}
          >
            <Box
              component="img"
              src="/static/hexa-ai.png"
              alt={t("AI Assistant") as string}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                display: "block",
              }}
            />
          </Box>
        </Tooltip>
      )}

      <ChatBotPopover open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default AiChatBotLauncher;
