import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useInView } from 'react-intersection-observer'

// Watches for the bottom of a results grid coming into view and pulls the next
// page. rootMargin starts the fetch half a viewport early so the grid keeps
// growing before the user actually hits the end.
const InfiniteScrollSentinel = ({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
}) => {
    const { ref, inView } = useInView({ rootMargin: '0px 0px 50% 0px' })

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

    return (
        <Box
            ref={ref}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                minHeight: '10px',
                py: hasNextPage || isFetchingNextPage ? 3 : 0,
            }}
        >
            {isFetchingNextPage && <CircularProgress size={24} />}
        </Box>
    )
}

export default InfiniteScrollSentinel
