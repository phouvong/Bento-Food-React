import { Box, ButtonBase, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const DEFAULT_TABS = [
    { key: 'foods', label: 'Foods' },
    { key: 'restaurants', label: 'Restaurants' },
]

// `tabs` lets the search page add its own "All" tab without a second toggle.
const FoodOrRestaurantToggle = ({ value, onChange, tabs = DEFAULT_TABS }) => {
    const { t } = useTranslation()

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                p: { xs: '3px', sm: '4px' },
                borderRadius: { xs: '10px', sm: '12px' },
                backgroundColor: (theme) => theme.palette.background.paper,
                flexShrink: 0,
            }}
        >
            {tabs.map(({ key, label }) => {
                const active = value === key
                return (
                    <ButtonBase
                        key={key}
                        onClick={() => onChange(key)}
                        sx={{
                            height: { xs: '30px', sm: '36px' },
                            px: { xs: 1.25, sm: 2 },
                            borderRadius: { xs: '7px', sm: '8px' },
                            backgroundColor: active
                                ? (theme) => theme.palette.primary.main
                                : 'transparent',
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: '12px', sm: '14px' },
                                fontWeight: 600,
                                letterSpacing: '-0.42px',
                                whiteSpace: 'nowrap',
                                color: active
                                    ? (theme) => theme.palette.primary.contrastText
                                    : (theme) => theme.palette.text.primary,
                            }}
                        >
                            {t(label)}
                        </Typography>
                    </ButtonBase>
                )
            })}
        </Box>
    )
}

export default FoodOrRestaurantToggle
