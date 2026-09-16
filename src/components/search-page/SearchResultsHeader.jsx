import { Badge, Box, IconButton, Skeleton, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import FoodOrRestaurantToggle from '@/components/type-wise-restaurant-page/FoodOrRestaurantToggle'

export const SEARCH_TABS = [
    { key: 'all', label: 'All' },
    { key: 'foods', label: 'Foods' },
    { key: 'restaurants', label: 'Restaurants' },
]

// Search page header (Figma node 254:81006): result count for the query, the
// All/Foods/Restaurants toggle, and the filter-panel trigger.
const SearchResultsHeader = ({
    count,
    query,
    activeTab,
    onTabChange,
    filterCount = 0,
    onFilterClick,
    isLoading = false,
}) => {
    const { t } = useTranslation()

    return (
        <Stack
            direction="row"
            gap={{ xs: 1, sm: 2 }}
            alignItems="center"
            justifyContent="space-between"
            sx={{ pt: { xs: 0, md: '24px' } }}
        >
            {isLoading ? (
                <Skeleton
                    variant="text"
                    width={220}
                    height={28}
                    sx={{ display: { xs: 'none', md: 'block' }, flex: 1, minWidth: 0 }}
                />
            ) : (
                <Typography
                    component="h1"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        flex: 1,
                        minWidth: 0,
                        fontSize: '20px',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        letterSpacing: '-0.6px',
                        color: (theme) => theme.palette.text.primary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {t('{{count}} Result For', { count })} {`“${query}”`}
                </Typography>
            )}

            <FoodOrRestaurantToggle
                value={activeTab}
                onChange={onTabChange}
                tabs={SEARCH_TABS}
            />

            {onFilterClick && (
                <IconButton
                    onClick={onFilterClick}
                    aria-label="filter"
                    sx={{
                        display: { xs: 'none', md: 'inline-flex' },
                        width: 40,
                        height: 40,
                        p: '8px',
                        borderRadius: '12px',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        flexShrink: 0,
                    }}
                >
                    <Badge
                        badgeContent={filterCount}
                        color="primary"
                        overlap="circular"
                        sx={{
                            '& .MuiBadge-badge': {
                                fontSize: 10,
                                height: 16,
                                minWidth: 16,
                            },
                        }}
                    >
                        <Box
                            component="i"
                            className="fi fi-rr-filter"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                fontSize: '20px',
                                lineHeight: 1,
                                color: (theme) => theme.palette.text.primary,
                            }}
                        />
                    </Badge>
                </IconButton>
            )}
        </Stack>
    )
}

export default SearchResultsHeader
