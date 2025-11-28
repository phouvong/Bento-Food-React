import { alpha, Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useSettings } from '@/contexts/use-settings'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useRouter } from 'next/router'

const ThemeSwitches = () => {
    const theme = useTheme();
    const router = useRouter();
    const { settings, saveSettings } = useSettings();

    //check the context is browser
    let location = undefined;
    if (typeof window !== 'undefined') {
        location = localStorage.getItem('location')
    }

    const handleChange = () => {
        const newTheme = theme.palette.mode === 'light' ? 'dark' : 'light'
        localStorage.setItem('mode', newTheme)
        saveSettings({
            ...settings,
            theme: newTheme,
        })
    }

    return (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.8}
            onClick={handleChange}
            backgroundColor={alpha(theme.palette.primary.light, 0.2)}
            height={location ? '24px' : '38px'}
            width={location ? '24px' : '38px'}
            borderRadius="50%"
            padding="6px"
            sx={{
                cursor: 'pointer',
                svg: {
                    height: location ? '1rem' : '1em',
                    width: location ? '1rem' : '1em',
                }
            }}
        >
            {theme.palette.mode === 'light' ? (
                <LightModeIcon
                    sx={{
                        color: theme.palette.primary.main,
                        fontSize: '25px',
                    }}
                />
            ) : (
                <DarkModeIcon
                    sx={{
                        color: theme.palette.neutral[500],
                        fontSize: '25px',
                    }}
                />
            )}
        </Stack>
    )
}

export default ThemeSwitches
