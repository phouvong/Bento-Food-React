import { Box, styled } from '@mui/material'

export const SECTION_GUTTER_PX = { xs: 2, sm: 3, md: 0 }

const Section = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'bleedEnd',
})(({ theme, bleedEnd }) => ({
    paddingInlineStart: theme.spacing(SECTION_GUTTER_PX.xs),
    paddingInlineEnd: bleedEnd ? 0 : theme.spacing(SECTION_GUTTER_PX.xs),
    [theme.breakpoints.up('sm')]: {
        paddingInlineStart: theme.spacing(SECTION_GUTTER_PX.sm),
        paddingInlineEnd: bleedEnd ? 0 : theme.spacing(SECTION_GUTTER_PX.sm),
    },
    [theme.breakpoints.up('md')]: {
        paddingInline: 0,
    },
    '&:not(:has(*))': {
        display: 'none',
    },
}))

export default Section
