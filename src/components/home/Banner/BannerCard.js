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
                        sx={{ aspectRatio: '2 / 1.06' }}
                    />
                </CustomStackFullWidth>
            ) : (
                <CustomStackFullWidth
                    sx={{
                        borderRadius: '16px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.03)', // slight zoom/lift
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
                        objectFit="contain"
                        style={{
                            transition: 'transform 0.4s ease',
                        }}
                    />
                </CustomStackFullWidth>
            )}
        </>
    )
}

export default BannerCard
