import { Drawer, styled } from '@mui/material'

export const CustomDrawerForSidebar = styled(Drawer)(({ theme }) => ({
    zIndex: theme.zIndex.appBar + 100,
}))
