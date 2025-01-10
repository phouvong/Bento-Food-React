import React from 'react'
import { IconButton } from '@mui/material'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import errorImage from '../../../public/static/no-image-found.png'
import CustomImageContainer from '../CustomImageContainer'
import { RTL } from '../RTL/RTL'
import InstagramIcon from '@/assets/images/icons/socials/InstagramIcon'
import FacebookIcon from '@/assets/images/icons/socials/FacebookIcon'
import TwitterIcon from '@/assets/images/icons/socials/TwitterIcon'
import LinkedinIcon from '@/assets/images/icons/socials/LinkedinIcon'
import PinterestIcon from '@/assets/images/icons/socials/PinterestIcon'

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
                        height="25px"
                        width="25px"
                        objectFit="contain"
                    />
                )
        }
    }
    let languageDirection = undefined

    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }

    return (
        <RTL direction={languageDirection}>
            <CustomStackFullWidth
                direction="row"
                spacing={3}
                alignItems="center"
                justifyContent={{ xs: 'center' }}
            >
                {global &&
                    global?.social_media?.length > 0 &&
                    global?.social_media?.map((item, index) => {
                        const { name, link } = item
                        return (
                            <IconButton
                                sx={{
                                    padding: '0px',
                                    transition: `all ease 0.5s`,
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                    },
                                }}
                                key={index}
                                color="primary"
                                onClick={() => clickHandler(link)}
                            >
                                {iconHandler(name)}
                            </IconButton>
                        )
                    })}
            </CustomStackFullWidth>
        </RTL>
    )
}

SocialLinks.propTypes = {}

export default SocialLinks
