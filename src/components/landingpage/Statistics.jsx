import { alpha, Typography } from '@mui/material'
import { Box, Stack } from '@mui/system'
import StorefrontIcon from '@mui/icons-material/Storefront'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'
import GroupIcon from '@mui/icons-material/Group'
import ShieldIcon from '@mui/icons-material/Shield'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import StarIcon from '@mui/icons-material/Star'
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic'
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

    const stats = [
        {
            label: t('Restaurants'),
            value: total_restaurant ? `${formatNumber(total_restaurant)}+` : '200+',
            icon: <StorefrontIcon sx={{ fontSize: '28px' }} />,
        },
        {
            label: t('Happy Customer'),
            value: total_customer ? `${formatNumber(total_customer)}+` : '200+',
            icon: <GroupIcon sx={{ fontSize: '28px' }} />,
        },
        {
            label: t('Average Delivery'),
            value: avg_delivery ? `${avg_delivery} min` : '30 min',
            icon: <DeliveryDiningIcon sx={{ fontSize: '28px' }} />,
        },
    ]

    const trustItems = [
        { label: t('Secure checkout'), icon: <ShieldIcon sx={{ fontSize: '16px' }} /> },
        { label: t('On-time delivery'), icon: <LocalShippingIcon sx={{ fontSize: '16px' }} /> },
        { label: t('4.8 / 5 average rating'), icon: <StarIcon sx={{ fontSize: '16px' }} /> },
        { label: t('24/7 support'), icon: <HeadsetMicIcon sx={{ fontSize: '16px' }} /> },
    ]

    return (
        <CustomContainer>
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 3,
                    margin: {
                        xs: '-24px 0 32px',
                        sm: '-28px 24px 40px',
                        md: '-32px 40px 56px',
                    },
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: '16px',
                    boxShadow: '0 14px 34px rgba(15,23,42,.10)',
                    overflow: 'hidden',
                }}
            >
                {stats.map((item, index) => (
                    <Stack
                        key={index}
                        direction="row"
                        alignItems="center"
                        spacing={2.25}
                        sx={{
                            padding: { xs: '18px 20px', md: '22px 26px' },
                            borderRight: {
                                xs: 'none',
                                sm:
                                    index < stats.length - 1
                                        ? `1px solid ${alpha(theme.palette.text.primary, 0.06)}`
                                        : 'none',
                            },
                            borderBottom: {
                                xs:
                                    index < stats.length - 1
                                        ? `1px solid ${alpha(theme.palette.text.primary, 0.06)}`
                                        : 'none',
                                sm: 'none',
                            },
                        }}
                    >
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '14px',
                                background: `linear-gradient(135deg, ${alpha(
                                    theme.palette.primary.main,
                                    0.1
                                )}, ${alpha(theme.palette.primary.main, 0.22)})`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                color: theme.palette.primary.main,
                            }}
                        >
                            {item.icon}
                        </Box>
                        <Box>
                            <Typography
                                sx={{
                                    fontSize: { xs: '20px', md: '24px' },
                                    fontWeight: 800,
                                    color: theme.palette.text.primary,
                                    letterSpacing: '-0.01em',
                                    lineHeight: 1.1,
                                }}
                            >
                                {item.value}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '13px',
                                    color: theme.palette.text.secondary,
                                    fontWeight: 500,
                                    marginTop: '2px',
                                }}
                            >
                                {item.label}
                            </Typography>
                        </Box>
                    </Stack>
                ))}
            </Box>

            {/* <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.2, sm: 4 }}
                alignItems="center"
                justifyContent="center"
                flexWrap="wrap"
                useFlexGap
                sx={{ marginTop: '28px' }}
            >
                {trustItems.map((item, index) => (
                    <Stack
                        key={index}
                        direction="row"
                        alignItems="center"
                        spacing={0.75}
                    >
                        <Box
                            sx={{
                                color: theme.palette.primary.main,
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        >
                            {item.icon}
                        </Box>
                        <Typography
                            sx={{
                                fontSize: '12.5px',
                                fontWeight: 600,
                                color: theme.palette.text.secondary,
                            }}
                        >
                            {item.label}
                        </Typography>
                    </Stack>
                ))}
            </Stack> */}
        </CustomContainer>
    )
}

export default Statistics
