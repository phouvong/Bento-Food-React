import errorImage from '../../../public/static/no-image-found.png'
import { Box } from '@mui/material'
import CustomImageContainer from '../CustomImageContainer'
import InstagramIcon from '@/assets/images/icons/socials/InstagramIcon'
import FacebookIcon from '@/assets/images/icons/socials/FacebookIcon'
import TwitterIcon from '@/assets/images/icons/socials/TwitterIcon'
import LinkedinIcon from '@/assets/images/icons/socials/LinkedinIcon'
import PinterestIcon from '@/assets/images/icons/socials/PinterestIcon'
import { footerColors } from './Footer.style'

const SocialLinks = ({ global }) => {
    const clickHandler = (link) => {
        window.open(link)
    }

    const iconHandler = (name) => {
        switch (name) {
            case 'facebook':
                return <FacebookIcon />
            case 'instagram':
                return <InstagramIcon />
            case 'twitter':
                return <TwitterIcon />
            case 'linkedin':
                return <LinkedinIcon />
            case 'pinterest':
                return <PinterestIcon />
            default:
                return (
                    <CustomImageContainer
                        src={errorImage.src}
                        alt="default"
                        height="16px"
                        width="16px"
                        objectFit="contain"
                    />
                )
        }
    }

    if (!global?.social_media?.length) return null

    return (
        <Box sx={{ display: 'flex', gap: { xs: '24px', md: '16px' } }}>
            {global.social_media.map((item, index) => (
                <Box
                    key={index}
                    component="span"
                    aria-label={item.name}
                    onClick={() => clickHandler(item.link)}
                    sx={{
                        width: { xs: 36, md: 40 },
                        height: { xs: 36, md: 40 },
                        borderRadius: '999px',
                        background: footerColors.scrim,
                        color: footerColors.text,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                    }}
                >
                    {iconHandler(item.name)}
                </Box>
            ))}
        </Box>
    )
}

export default SocialLinks
