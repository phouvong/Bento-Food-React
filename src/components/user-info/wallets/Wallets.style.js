import { styled, Box, Card, alpha, Stack } from '@mui/material'

export const WalletBox = styled(Stack)(({ theme }) => ({

    background: "linear-gradient(180deg, #FE961C 0%, #FF6B00 100%)",
    borderRadius: '10px',
    padding: '15px 15px 15px 20px',
}))

export const WalletBoxSection = styled(Box)((theme) => ({
    backgroundColor: theme.palette.primary.main,
    borderRadius: '10px',
    padding: '20px',
    marginTop: '2rem',
}))
