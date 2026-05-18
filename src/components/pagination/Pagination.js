import React from 'react'
import { Box, Pagination, useMediaQuery, useTheme, styled } from '@mui/material'

export const StyledPagination = styled(Pagination)(({ theme }) => ({
    '& .MuiPaginationItem-root': {
        fontWeight: '700',
        color: theme.palette.neutral[400],
    },
    '& .Mui-selected': {
        backgroundColor: `${theme.palette.primary.main} !important`,
        color: theme.palette.neutral[100],
        fontWeight: '700',
    },
}))
export default function CustomePagination({
    total_size,
    page_limit,
    offset,
    setOffset,
}) {
    const theme = useTheme()
    const isXsmall = useMediaQuery(theme.breakpoints.down('sm'))
    return (
        <Box
            sx={{
                display: total_size > page_limit ? 'flex' : 'none' ,
                justifyContent: 'center',
                paddingBlockStart: '25px',
            }}
        >
            <StyledPagination
                size={isXsmall ? 'medium' : 'large'}
                variant="outlined"
                count={Math.ceil(total_size / page_limit)}
                onChange={(e, value) => {
                    setOffset(value)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                page={offset}
            />
        </Box>
    )
}
