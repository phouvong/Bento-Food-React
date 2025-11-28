import styled from "@emotion/styled";
import { Box } from "@mui/system";

export const RegistrationCardWrapper = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.neutral[200]}`,
  borderRadius: "20px",
  padding: "30px",
  marginTop: "30px",
  marginBottom: "30px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", // ✅ Added subtle box shadow
  backgroundColor: theme.palette.background.paper, // Optional: ensures nice contrast
  [theme.breakpoints.down("md")]: {
    padding: "16px",
    marginTop: "30px",
  },
}));

export const ActonButtonsSection = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "end",
  alignItems: "center",
  gap: "15px",
}));

export const FormSection = styled(Box)(({ theme }) => ({}));
export const TitleTopSection = styled(Box)(({ theme }) => ({}));
