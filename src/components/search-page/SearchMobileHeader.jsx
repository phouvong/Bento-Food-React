import { Badge, Box, IconButton, Stack, alpha } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

import SearchBox from '@/components/home/hero-section-with-search/SearchBox'
import { searchBoxSx } from '@/components/home/hero-section-with-search/searchBoxSx'
import { FilterIcon } from '@/components/home/filter-tabs/icons'

const SearchMobileHeader = ({ query, filterCount = 0, onFilterClick }) => {
    const { t } = useTranslation()
    const router = useRouter()

    // Mirrors NewNavbar's logo tap: a user without a saved location has no
    // /home to land on yet.
    const handleClose = () => {
        const hasLocation =
            typeof window !== 'undefined' &&
            Boolean(localStorage.getItem('location'))
        router.push(hasLocation ? '/home' : '/')
    }

    return (
        <Box
            sx={(theme) => ({
                display: { xs: 'block', md: 'none' },
                position: 'sticky',
                top: 0,
                zIndex: 1200,
                mb: '12px',
                backgroundColor: theme.palette.background.paper,
                boxShadow: `0px 1px 2px 0px ${alpha(
                    theme.palette.common.black,
                    0.05
                )}`,
                mx: `-${theme.spacing(2)}`,
            })}
        >
            <Stack
                direction="row"
                alignItems="center"
                gap="8px"
                sx={{ pt: '12px', pb: '8px', px: '8px' }}
            >
                <IconButton
                    onClick={handleClose}
                    aria-label={t('Close')}
                    sx={{ width: 40, height: 40, p: '8px', flexShrink: 0 }}
                >
                    <CloseIcon
                        sx={{
                            fontSize: 20,
                            color: (theme) => theme.palette.text.primary,
                        }}
                    />
                </IconButton>

                <Box sx={{ flex: 1, ...searchBoxSx }}>
                    <SearchBox query={query} />
                </Box>

                {onFilterClick && (
                    <IconButton
                        onClick={onFilterClick}
                        aria-label={t('Filter')}
                        sx={{ width: 40, height: 40, p: '8px', flexShrink: 0 }}
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
                                sx={{
                                    display: 'inline-flex',
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                }}
                            >
                                <FilterIcon size={20} />
                            </Box>
                        </Badge>
                    </IconButton>
                )}
            </Stack>
        </Box>
    )
}

export default SearchMobileHeader
