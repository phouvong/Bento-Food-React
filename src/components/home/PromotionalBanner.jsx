import { Stack } from '@mui/material'
import CustomImageContainer from '../CustomImageContainer'

const PromotionalBanner = ({ global }) => {
    return (
        <Stack padding={{xs:"30px 0px 5px", md:"40px 0 15px"}} >
            <CustomImageContainer
                src={global?.banner_data?.promotional_banner_image_full_url}
                alt={global?.banner_data?.promotional_banner_title}
                borderRadius="8px"
            />
        </Stack>
    )
}

export default PromotionalBanner
