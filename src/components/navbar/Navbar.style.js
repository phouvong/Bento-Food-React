import Drawer from '@mui/material/Drawer'
import {
    AppBar,
    styled,
    Link as MenuLink,
    Button,
    Switch,
    Stack,
    IconButton,
    alpha,
} from '@mui/material'

export const CustomDrawer = styled(Drawer)(({ theme }) => ({
    zIndex: 1172,
    '& .MuiDrawer-paper': {
        maxWidth: '265px',
        width: '100%',
        top: '30px',
        borderBottomRightRadius: '10px',
        borderBottomLeftRadius: '10px',
    },
}))

export const ButtonContainer = styled(Stack)(({ theme, marginBottom }) => ({
    marginLeft: '15px',
    marginRight: '15px',
    marginTop: 'auto',
    position: 'sticky',
    marginBottom: marginBottom ?? '40px',
}))

export const AppBarStyle = styled(AppBar, {
    shouldForwardProp: (prop) => !['scrolling', 'isSmall', 'disableGutters'].includes(prop),
})(({ theme, scrolling, isSmall }) => ({
    background: 'transparent !important',
    boxShadow: 'none !important',
    
    WebkitAnimation:
        !isSmall && scrolling ? 'fadeInUp 0.4s' : 'fadeInDown 0.4s',
    animation: !isSmall && scrolling ? 'fadeInUp 0.4s' : 'fadeInDown 0.4s',
    '@keyframes fadeInUp': {
        '0%': {
            transform: 'translateY(30px)',
        },
        '100%': {
            transform: 'translateY(0)',
        },
    },
    '@keyframes fadeInDown': {
        '0%': {
            transform: 'translateY(-30px)',
        },
        '100%': {
            transform: 'translateY(0)',
        },
    },
}));

export const NavLinkStyle = styled(Stack, {
    shouldForwardProp: (prop) => prop !== 'active' && prop !== 'languageDirection',
})(({ theme, active }) => {
    const activeBg =
        theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.main, 0.18)
            : '#FFF4EC'
    const inactiveColor =
        theme.palette.mode === 'dark' ? '#fff' : '#334155'
    return {
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        color: active ? theme.palette.primary.main : inactiveColor,
        padding: '6px 12px',
        borderRadius: '8px',
        textAlign: 'center',
        lineHeight: 1,
        backgroundColor: active ? activeBg : 'transparent',
        fontWeight: 600,
        fontSize: '13px',
        whiteSpace: 'nowrap',
        transition: 'background-color 0.18s ease, color 0.18s ease',
        '&:hover': {
            color: theme.palette.primary.main,
            backgroundColor: activeBg,
        },
    }
})
export const NavMenuLink = styled(MenuLink)(({ theme }) => ({
    color: theme.palette.mode === 'dark' ? '#fff' : '#334155',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '13px',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    transition: 'background-color 0.18s ease, color 0.18s ease',
    '&:hover': {
        color: theme.palette.primary.main,
        backgroundColor:
            theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.main, 0.15)
                : '#FFF4EC',
    },
}))
export const TopBarButton = styled(Button)(({ theme, formMobileMenu,noLocation }) => ({
    padding: formMobileMenu === 'true' ? '7px 5px' : '',
    color: theme.palette.neutral[100],
    backgroundColor: noLocation && theme.palette.neutral[200],
    minWidth: '40px',
    maxWidth: '200px',
    borderRadius:"6px"
}))
export const CustomSwitch = styled(Switch)(({ theme, noimage }) => ({
    width: 42,
    height: 22,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 1,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: '#fff',
            '& .MuiSwitch-thumb:before': {
                backgroundImage:
                    noimage === 'true'
                        ? null
                        : `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="15" width="15" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                              theme.palette.primary.main
                          )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
            },
            '& + .MuiSwitch-track': {
                backgroundColor:
                    theme.palette.mode === 'dark'
                        ? theme.palette.primary.light
                        : theme.palette.primary.main,
                opacity: 1,
                border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
            },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: theme.palette.primary.light,
            border: '6px solid #fff',
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color:
                theme.palette.mode === 'light'
                    ? theme.palette.grey[100]
                    : theme.palette.grey[600],
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
        },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor:
            theme.palette.mode === 'dark'
                ? noimage === 'true'
                    ? '#fff'
                    : '#003892'
                : '#fff',
        width: 20,
        height: 20,
        '&:before': {
            content: "''",
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                '#fff'
            )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
        },
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}))
export const CustomNavSearchIcon = styled(IconButton)(({ theme }) => ({
    marginInlineEnd: '1rem',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: `1px solid ${theme.palette.primary.main} `,
    alignItems: 'center',
    justifyContent: 'center',
}))

export const LefRightBorderBox = styled(Stack)(
    ({ theme, languageDirection, location, isMobile }) => ({
       
        //height: !isMobile && '64px',
        alignItems: 'center',
        justifyContent: 'center',
        paddingInline: '.5rem',


    })
)
