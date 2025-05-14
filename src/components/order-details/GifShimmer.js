import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import Skeleton from '@mui/material/Skeleton'

const GifShimmer = () => {
    return (
        <CustomPaperBigCard>
            <CustomStackFullWidth
                alignItems="center"
                justifyContent="flex-start"
                spacing={1}
            >
                <Skeleton width={200} height={200} variant="circular" />
                <Skeleton width={200} height="20px" variant="text" />
                <Skeleton width={150} height="20px" variant="text" />
            </CustomStackFullWidth>
        </CustomPaperBigCard>
    )
}

GifShimmer.propTypes = {}

export default GifShimmer
