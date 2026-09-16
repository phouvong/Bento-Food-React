import { Badge, Box, IconButton, Stack, Typography, alpha } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useRouter } from 'next/router'
import { FilterIcon } from '@/components/home/filter-tabs/icons'

// Mobile-only page header (Figma "Mobile nav bar", node 246:35519) for pages
// that hide NewNavbar on small screens: back button, page title, and a filter
// button badged with the active-filter count.
//
// onFilterClick is left to the host page so it can hand the click straight to
// its own filter controls — nothing about the filter state lives here.
const MobilePageHeader = ({ title, filterCount = 0, onFilterClick, onBack }) => {
    const router = useRouter()

    const handleBack = () => {
        if (onBack) onBack()
        else router.back()
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
                mx: (theme) => `-${theme.spacing(2)}`,
            })}
        >
            <Stack
                direction="row"
                alignItems="center"
                gap="8px"
                sx={{ pt: '12px', pb: '8px', px: '12px' }}
            >
                <IconButton
                    onClick={handleBack}
                    aria-label="back"
                    sx={{ width: 40, height: 40, p: '8px' }}
                >
                    <ArrowBackIcon
                        sx={{
                            fontSize: 20,
                            color: (theme) => theme.palette.text.primary,
                        }}
                    />
                </IconButton>

                <Typography
                    component="h1"
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: '18px',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        letterSpacing: '-0.54px',
                        color: (theme) => theme.palette.text.primary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {title}
                </Typography>

                {onFilterClick && (
                    <IconButton
                        onClick={onFilterClick}
                        aria-label="filter"
                        sx={{ width: 40, height: 40, p: '8px' }}
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
                                    color: (theme) => theme.palette.text.primary,
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

export default MobilePageHeader
