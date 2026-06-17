import { Stack } from '@mui/material'
import CustomImageContainer from '../CustomImageContainer'

const PromotionalBanner = ({ global }) => {
    return (
        <Stack
            marginTop="8px"
            sx={{
                maxWidth:" 100%",
                maxHeight: 200,
                width: '100%',
                overflow: 'hidden',
            }}
        >
            <CustomImageContainer
                src={global?.banner_data?.promotional_banner_image_full_url}
                alt={global?.banner_data?.promotional_banner_title}
                width="100%"
                height="100%"
                maxWidth="100%"
                objectFit="cover"
                borderRadius="8px"
            />
        </Stack>
    )
}

export default PromotionalBanner
