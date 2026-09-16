import { Breadcrumbs, Link, Skeleton, Stack, Typography } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NextLink from 'next/link'
import { useTranslation } from 'react-i18next'
import FoodOrRestaurantToggle from './FoodOrRestaurantToggle'

const ResultsHeader = ({
    count,
    activeTab,
    onTabChange,
    sectionTitle,
    showTabs = true,
    extraCrumb,
    endSlot,
    isLoading = false,
}) => {
    const { t } = useTranslation()

    const crumbLabel = sectionTitle
        ? sectionTitle
        : activeTab === 'restaurants'
        ? t('Restaurants')
        : t('Foods')

    return (
        <Stack
            direction="row"
            gap={{ xs: 1, sm: 2 }}
            alignItems="center"
            justifyContent="space-between"
        >
            <Stack gap={{ xs: '2px', sm: '6px' }} sx={{ minWidth: 0 }}>
                {!sectionTitle && isLoading ? (
                    <Skeleton
                        variant="text"
                        width={160}
                        height={28}
                        sx={{ display: { xs: 'none', sm: 'block' } }}
                    />
                ) : (
                    <Typography
                        component="h1"
                        sx={{
                            // MobilePageHeader already shows this title on mobile.
                            display: { xs: 'none', sm: 'block' },
                            fontSize: { xs: '16px', sm: '20px' },
                            fontWeight: 700,
                            lineHeight: 1.2,
                            letterSpacing: '-0.6px',
                            color: (theme) => theme.palette.text.primary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {sectionTitle || t('{{count}} results found', { count })}
                    </Typography>
                )}
                <Breadcrumbs
                    separator={
                        <NavigateNextIcon
                            sx={{ fontSize: { xs: 12, sm: 14 } }}
                        />
                    }
                    sx={{
                        fontSize: { xs: '12px', sm: '14px' },
                        color: (theme) => theme.palette.text.secondary,
                        '& .MuiBreadcrumbs-separator': {
                            mx: { xs: '4px', sm: '8px' },
                        },
                    }}
                >
                    <Link
                        component={NextLink}
                        href="/home"
                        underline="hover"
                        color="text.secondary"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: 'inherit',
                        }}
                    >
                        <HomeIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
                        {t('Home')}
                    </Link>
                    {extraCrumb && (
                        <Link
                            component={NextLink}
                            href={extraCrumb.href}
                            underline="hover"
                            color="text.secondary"
                            sx={{ fontSize: 'inherit' }}
                        >
                            {extraCrumb.label}
                        </Link>
                    )}
                    <Typography color="text.secondary" fontSize="inherit">
                        {crumbLabel}
                    </Typography>
                </Breadcrumbs>
            </Stack>

            {showTabs ? (
                <FoodOrRestaurantToggle
                    value={activeTab}
                    onChange={onTabChange}
                />
            ) : (
                endSlot
            )}
        </Stack>
    )
}

export default ResultsHeader
