import styled from '@emotion/styled'
import ApartmentIcon from '@mui/icons-material/Apartment'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import MailIcon from '@mui/icons-material/Mail'
import { Skeleton, Stack, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'
import { useState } from 'react'
import { CustomStackFullWidth } from '../../styled-components/CustomStyles.style'
import ContactAddressMap from '../help-page/ContactAddressMap'

const ContactInfo = ({ global }) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const [open, setOpen] = useState(false)
    const [hovered, setHovered] = useState(null)

    const handleHover = (value) => {
        setHovered(value)
    }

    const handleMouseLeave = () => {
        setHovered(null)
    }
    const handleOpenCloseMap = () => {
        setOpen(!open)
    }
    if (!global)
        return (
            <>
                <CustomStackFullWidth
                    spacing={1}
                    alignItems={{
                        xs: 'center',
                        sm: 'center',
                        md: 'flex-start',
                    }}
                >
                    <CustomSkelenton width={160} />
                    <CustomSkelenton width={120} />
                    <CustomSkelenton width={140} />
                </CustomStackFullWidth>
            </>
        )
    return (
        <CustomStackFullWidth
            spacing={1.5}
            alignItems={{ xs: 'center', sm: 'center', md: 'flex-start' }}
        >
            <Stack
                onMouseEnter={() => handleHover('address')}
                onMouseLeave={handleMouseLeave}
                onClick={handleOpenCloseMap}
                direction="row"
                spacing={1}
                alignItems="flex-start"
                color={theme.palette.text.footerText}
                sx={{ cursor: 'pointer' }}
            >
                <ApartmentIcon
                    sx={{ color: hovered === 'address' && 'primary.main' }}
                />
                <Typography
                    sx={{ color: hovered === 'address' && 'primary.main' }}
                >
                    {global?.address}
                </Typography>
            </Stack>
            <Link href={`mailto:${global?.email}`}>
                <Stack
                    onMouseEnter={() => handleHover('mail')}
                    onMouseLeave={handleMouseLeave}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    color={theme.palette.text.footerText}
                    sx={{ cursor: 'pointer' }}
                >
                    <MailIcon
                        sx={{ color: hovered === 'mail' && 'primary.main' }}
                    />
                    <Typography
                        sx={{ color: hovered === 'mail' && 'primary.main' }}
                    >
                        {global?.email}
                    </Typography>
                </Stack>
            </Link>
            <Link href={`tel:${global?.phone}`}>
                <Stack
                    onMouseEnter={() => handleHover('phone')}
                    onMouseLeave={handleMouseLeave}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    color={theme.palette.text.footerText}
                    sx={{ cursor: 'pointer' }}
                >
                    <LocalPhoneIcon
                        sx={{
                            color: hovered === 'phone' && 'primary.main',
                        }}
                    />
                    <Typography
                        sx={{
                            color: hovered === 'phone' && 'primary.main',
                        }}
                    >
                        {global?.phone}
                    </Typography>
                </Stack>
            </Link>
            <ContactAddressMap global={global} open={open} setOpen={setOpen} />
        </CustomStackFullWidth>
    )
}

export const CustomSkelenton = styled((props) => <Skeleton {...props} />)(
    ({ theme }) => ({
        background: 'rgba(255,255,255,0.1)',
    })
)

export default ContactInfo
