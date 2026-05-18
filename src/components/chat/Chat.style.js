import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { alpha, Drawer, Stack } from '@mui/material'
import zIndex from '@mui/material/styles/zIndex'


export const CustomBoxFullWidth = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: `calc(100vh - 100px)`,
    width: '100%',
    overflow: 'hidden',
}))

export const ChatSidebarDesktop = styled(Drawer)(({ theme }) => ({
    flexShrink: 0,
    width: 260,
    //minHeight: '77vh',
    height: '100%',
    padding:"0px",
    '& .MuiDrawer-paper': {
        position: 'relative',
        width: 260,
        height: '100%',
        background: theme.palette.background.paper,
        //minHeight: '77vh',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        zIndex: 1,
    },
}))

export const ChatSidebarMobile = styled(Drawer)({
    maxWidth: '100%',
    width: '100%',
    '& .MuiDrawer-paper': {
        paddingTop: '70px',
        height: 'calc(100% - 59px)',
        maxWidth: '100%',
        top: 50,
        width: '100%',
        zIndex:99
    },
})

export const ChatUserTop = styled(Stack)(({ theme, mdUp }) => ({
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '10px',
    marginBottom: '10px',
    width: '100%',
    borderBottom: '1px solid',
    borderColor: theme.palette.neutral[300],
}))
