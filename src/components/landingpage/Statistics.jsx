import { alpha, Typography } from '@mui/material'
import { Box, Stack } from '@mui/system'
import StorefrontIcon from '@mui/icons-material/Storefront'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'
import GroupIcon from '@mui/icons-material/Group';
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import CustomContainer from '@/components/container'


const Statistics = ({ avg_delivery, total_restaurant, total_customer }) => {
    const theme = useTheme()
    const { t } = useTranslation()

    const formatNumber = (num) => {
        if (!num) return '0'
        const n = parseInt(num)
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
        return n.toString()
    }

    // Example stats (you can adjust or add more dynamically)
    const stats = [
        {
            label: t('Restaurants'),
            value: total_restaurant ? `${formatNumber(total_restaurant)}+` : '200+',
            icon: <StorefrontIcon />,
        },
        {
            label: t('Happy Customer'),
            value: total_customer ? `${formatNumber(total_customer)}+` : '200+',
            icon: <GroupIcon />,
        },
        {
            label: t('Average Delivery'),
            value: avg_delivery ? `${(avg_delivery)} min` : '30 min',
            icon: <DeliveryDiningIcon />,
        },
    ]

    return (
        <CustomContainer>
            <Stack
                maxWidth={742}
                sx={{
                    marginInline: 'auto',
                    marginTop: '-3rem',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <Stack
                    direction="row"
                    gap={2}
                    pb={3}
                    sx={{
                        overflowX: 'auto',
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}
                >
                    {stats.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                padding:{xs:"16px",sm:"20px",md:"30px"},
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: '10px',
                                boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
                                flex: {xs:"1 0 200px",md:"1 0 200px"},
                                minWidth: {xs:"200px",sm:"220px"},
                                transition: 'box-shadow 0.3s ease-in-out',
                                '&:hover': {
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                                },
                            }}
                        >
                            <Stack direction="row" justifyContent="space-between" gap={1}>
                                <Stack>
                                    <Typography

                                        fontSize="19px"
                                        fontWeight="500"
                                        color={theme.palette.text.primary}
                                    >
                                        {item.value}
                                    </Typography>
                                    <Typography variant="body1" fontSize="14px" color={theme.palette.text.secondary}>
                                        {item.label}
                                    </Typography>
                                </Stack>

                                <Box
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: theme.palette.neutral[600],
                                        minWidth: "50px"
                                    }}
                                >
                                    {item.icon}
                                </Box>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Stack>
        </CustomContainer>
    )
}

export default Statistics
