import { Box } from '@mui/material'
import HomeSidebar from './HomeSidebar'

// Shared grid: sticky sidebar (desktop only) + main content.
// Reused wherever a home-style page needs HomeSidebar alongside its content.
const HomeSidebarLayout = ({ children, contentSx, bogoActive = true }) => {
    return (
        <Box
            sx={{
                display: { xs: 'block', md: 'grid' },
                gridTemplateColumns: { md: '260px 1fr' },
                columnGap: { md: '32px' },
            }}
        >
            <Box
                sx={{
                    display: { xs: 'none', md: 'block' },
                    position: 'relative',
                }}
            >
                <HomeSidebar bogoActive={bogoActive} />
            </Box>
            <Box sx={{ minWidth: 0, ...contentSx }}>{children}</Box>
        </Box>
    )
}

export default HomeSidebarLayout
