import {
    Paper,
    styled,
} from '@mui/material'


export const BannerFormPaper = styled(Paper)(({ theme }) => ({
    padding: "2rem 2.5rem 2.5rem",
    borderRadius: "0 0 1.25rem 1.25rem",
    width: "500px",
    maxWidth: "92%",
    marginLeft: "auto",
    marginRight: "4%",
    marginBottom: "2.5rem",
    [theme.breakpoints.down('sm')]: {
        padding: "2rem 1.5rem",
    },
}))
