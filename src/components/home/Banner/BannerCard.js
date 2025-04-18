import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomImageContainer from '../../CustomImageContainer'

const BannerCard = ({ banner, handleBannerClick }) => {
    const bannerImage = banner?.image_full_url

    return (
        <CustomStackFullWidth onClick={() => handleBannerClick(banner)} >
            <CustomImageContainer
                src={bannerImage}
                width="100%"
                objectFit="contain"
                borderRadius="16px"
                cursor="pointer"
                aspectRatio="2/1"
                loading={true}
            />
        </CustomStackFullWidth>
    )
}

export default BannerCard
