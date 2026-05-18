import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomImageContainer from '../../CustomImageContainer'
import Skeleton from '@mui/material/Skeleton'
import Image from 'next/image'
import placeholder from '../../../../public/static/notimage.png'
import CustomNextImage from '@/components/CustomNextImage'

const BannerCard = ({ banner, handleBannerClick, onlyShimmer }) => {
    const bannerImage = banner?.image_full_url
    const isSmall = window.innerWidth < 600
    return (
        <>
            {onlyShimmer ? (
                <CustomStackFullWidth>
                    <Skeleton
                        width="100%"
                        height="auto"
                        variant="rounded"
                        sx={{
                            borderRadius: '16px',
                            aspectRatio: { xs: '2 / 0.77', md: '2 / 1' },
                        }}
                    />
                </CustomStackFullWidth>
            ) : (
                <CustomStackFullWidth
                    sx={{
                        borderRadius: '16px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease',
                        // boxShadow: '0px 10px 30px rgba(0, 0, 0, 0)',
                        '&:hover': {
                            transform: 'scale(1.02)',
                            // boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.16)',
                        },
                    }}
                    onClick={() => handleBannerClick(banner)}
                >
                    <CustomNextImage
                        src={bannerImage}
                        width={370}
                        height={isSmall ? 142 : 185}
                        alt="banner"
                        priority
                        borderRadius="16px"
                        objectFit="cover"
                        style={{
                            width: '100%',
                            height: '100%',
                            transition: 'transform 0.4s ease',
                        }}
                    />
                </CustomStackFullWidth>
            )}
        </>
    )
}

export default BannerCard
