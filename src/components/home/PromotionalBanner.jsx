import { Stack } from '@mui/material'
import CustomImageContainer from '../CustomImageContainer'

const PromotionalBanner = ({ global }) => {
    return (
        <Stack marginTop="8px">
            <CustomImageContainer
                src={global?.banner_data?.promotional_banner_image_full_url}
                alt={global?.banner_data?.promotional_banner_title}
                borderRadius="8px"
            />
        </Stack>
    )
}

export default PromotionalBanner
