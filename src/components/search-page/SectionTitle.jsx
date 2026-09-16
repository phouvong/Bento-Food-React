import { Typography } from '@mui/material'

// Shared section heading styling for the search page (Figma "Heading/Medium" —
// 20px bold on desktop). Exported so slider sections can hand the same
// typography to SliderSectionHeader via its titleSx prop.
export const sectionTitleSx = {
    fontSize: { xs: '16px', md: '20px' },
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.6px',
}

const SectionTitle = ({ children, sx }) => (
    <Typography
        component="h2"
        sx={{
            ...sectionTitleSx,
            color: (theme) => theme.palette.text.primary,
            mb: '12px',
            ...sx,
        }}
    >
        {children}
    </Typography>
)

export default SectionTitle
