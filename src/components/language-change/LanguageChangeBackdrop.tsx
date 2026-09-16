import { Backdrop, CircularProgress, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setIsLanguageChanging } from "@/redux/slices/languageChange";

interface LanguageChangeBackdropProps {
  // Optional override; when omitted the backdrop drives itself from the
  // `isLanguageChanging` redux flag so a single global instance works.
  // `boolean | undefined` (not defaulted to false) lets us distinguish
  // "caller controls it" from "read the store".
  open?: boolean;
  // Optional label override; defaults to the translated "Changing language...".
  label?: string;
}

/**
 * Full-screen blocking overlay shown while a language switch is in flight
 * (i18n swap + react-query refetches). Rendered once globally in _app.js so
 * it survives the switcher's parent menu/drawer unmounting, and sits above
 * the modal layer so menus and popovers stay covered until the new-language
 * data has arrived.
 */
const LanguageChangeBackdrop = ({
  open,
  label,
}: LanguageChangeBackdropProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  // `state` is untyped (the redux store is plain JS) — `any` here matches how
  // the rest of the codebase consumes useSelector.
  const isLanguageChanging = useSelector(
    (state: any) => state.languageChange?.isLanguageChanging ?? false
  );

  // The languageChange slice is redux-persisted; a refresh mid-change would
  // rehydrate a stuck `true`. A switch never survives a page load, so clear
  // the flag once on mount.
  useEffect(() => {
    dispatch(setIsLanguageChanging(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Backdrop
      open={open ?? isLanguageChanging}
      sx={{
        zIndex: theme.zIndex.modal + 1,
        flexDirection: "column",
        gap: 2,
        color: theme.palette.common.white,
      }}
    >
      <CircularProgress color="inherit" size={40} />
      <Stack alignItems="center">
        <Typography fontSize="14px" fontWeight={500}>
          {label ?? (t("Changing language...") as string)}
        </Typography>
      </Stack>
    </Backdrop>
  );
};

export default LanguageChangeBackdrop;
