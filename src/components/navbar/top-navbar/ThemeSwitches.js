import { Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../../contexts/use-settings'
import { CustomSwitch } from './TopNav.style'
const getValues = (settings) => ({
    direction: settings.direction,
    responsiveFontSizes: settings.responsiveFontSizes,
    theme: settings.theme,
})

const ThemeSwitches = ({ noText }) => {
    const { settings, saveSettings } = useSettings()
    const [values, setValues] = useState(getValues(settings))

    const { t } = useTranslation()
    const theme = useTheme()
    const handleChange = (event) => {
        if (event.target.checked) {
            localStorage.setItem('mode', 'light')
            saveSettings({
                ...values,
                theme: 'light',
            })
        } else {
            localStorage.setItem('mode', 'dark')
            saveSettings({
                ...values,
                theme: 'dark',
            })
        }
        setValues({ ...values, theme: event.target.checked ? 'light' : 'dark' })
    }


    return (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.8}
        >
            <CustomSwitch
                checked={settings.theme === 'light'}
                onChange={handleChange}
            />
            {!noText ? (
                <Typography fontSize="14px" color={theme.palette.neutral[1000]}>
                    {settings.theme === 'light'
                        ? t('Light Mode')
                        : t('Dark Mode')}
                </Typography>
            ) : null}
        </Stack>
    )
}

export default ThemeSwitches
