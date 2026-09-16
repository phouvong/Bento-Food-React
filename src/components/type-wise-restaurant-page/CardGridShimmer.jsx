import { Grid } from '@mui/material'

// Renders the loading placeholders in the exact grid (columns + gap) the
// real cards use, so the layout doesn't jump when data arrives.
const CardGridShimmer = ({ CardSkeleton, gridSizes, count = 10 }) => (
    <Grid item container spacing={{ xs: 2.5, md: 3 }}>
        {[...Array(count)].map((_, index) => (
            <Grid item key={index} {...gridSizes}>
                <CardSkeleton />
            </Grid>
        ))}
    </Grid>
)

export default CardGridShimmer
