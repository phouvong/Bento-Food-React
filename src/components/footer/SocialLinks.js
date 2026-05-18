import errorImage from '../../../public/static/no-image-found.png'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CustomImageContainer from '../CustomImageContainer'
import InstagramIcon from '@/assets/images/icons/socials/InstagramIcon'
import FacebookIcon from '@/assets/images/icons/socials/FacebookIcon'
import TwitterIcon from '@/assets/images/icons/socials/TwitterIcon'
import LinkedinIcon from '@/assets/images/icons/socials/LinkedinIcon'
import PinterestIcon from '@/assets/images/icons/socials/PinterestIcon'

const SocialLinks = ({ global }) => {
    const theme = useTheme()

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
        <Box sx={{ display: 'flex', gap: '10px', mt: '4px' }}>
            {global.social_media.map((item, index) => (
                <Box
                    key={index}
                    component="span"
                    aria-label={item.name}
                    onClick={() => clickHandler(item.link)}
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,.05)',
                        border: '1px solid rgba(255,255,255,.08)',
                        color: '#CBD5E1',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all .15s ease',
                        '&:hover': {
                            background: theme.palette.primary.main,
                            borderColor: theme.palette.primary.main,
                            color: '#fff',
                            transform: 'translateY(-2px)',
                        },
                    }}
                >
                    {iconHandler(item.name)}
                </Box>
            ))}
        </Box>
    )
}

export default SocialLinks
