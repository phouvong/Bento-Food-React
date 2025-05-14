import bannerImg from '../../../public/static/rr_landing/rrlb.webp'
import CustomContainer from '../container'
import { Stack } from '@mui/system'
import BannerForm from '@/components/restaurant-resgistration-landing/BannerForm'
import CustomNextImage from '@/components/CustomNextImage'
import ImageNotFound from '../../../public/static/no-image-found.png'


const RestaurantRegLanBanner = ({hero_image_content_full_url,business_name}) => {

    let location
    if (typeof window !== 'undefined') {
        location = localStorage.getItem('location')
    }
    return (
        <Stack marginTop={location?"3rem":""}>
            <CustomContainer>
                <Stack sx={{ "> img": { objectFit: 'cover', position: "absolute", left: 0, top: 0, zIndex: -1, width: "100%", height: "100%" }, position: 'relative', zIndex: 1 }}>
                    <CustomNextImage
                        height={bannerImg?.height}
                        width={bannerImg?.width}
                        src={hero_image_content_full_url}
                        altSrc={ImageNotFound}
                        alt="Restaurant Registration Landing"
                        priority={true}
                        // objectFit="contain"
                    />
                    <BannerForm business_name={business_name} />
                </Stack>
            </CustomContainer>
        </Stack>
    )
}

export default RestaurantRegLanBanner;