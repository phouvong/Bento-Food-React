import styled from '@emotion/styled'
import ApartmentIcon from '@mui/icons-material/Apartment'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import MailIcon from '@mui/icons-material/Mail'
import { Box, Skeleton, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'
import { useState } from 'react'
import ContactAddressMap from '../help-page/ContactAddressMap'

const ContactInfo = ({ global }) => {
    const theme = useTheme()
    const [open, setOpen] = useState(false)

    const handleOpenCloseMap = () => {
        setOpen(!open)
    }

    const iconTileSx = {
        width: 30,
        height: 30,
        borderRadius: '9px',
        background: 'rgba(255,117,24,.1)',
        color: theme.palette.primary.main,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    }

    const rowSx = {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        color: '#94A3B8',
        fontSize: '13px',
        lineHeight: 1.5,
    }

    const textSx = {
        pt: '4px',
        color: '#E2E8F0',
        fontSize: '13px',
        lineHeight: 1.5,
        transition: 'color .15s ease',
        '&:hover': { color: theme.palette.primary.main },
    }

    if (!global)
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    alignItems: 'flex-start',
                    width: 'fit-content',
                    mx: { xs: 'auto', sm: 'auto', md: 0 },
                }}
            >
                <CustomSkelenton width={160} />
                <CustomSkelenton width={120} />
                <CustomSkelenton width={140} />
            </Box>
        )

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems:{ xs: 'center',sm: 'center',md: 'flex-start' },
            }}
        >
            {global?.address && (
                <Box
                    sx={{ ...rowSx, cursor: 'pointer' }}
                    onClick={handleOpenCloseMap}
                >
                    <Box sx={iconTileSx}>
                        <ApartmentIcon sx={{ fontSize: '14px' }} />
                    </Box>
                    <Typography sx={textSx}>{global?.address}</Typography>
                </Box>
            )}

            {global?.email && (
                <Link
                    href={`mailto:${global?.email}`}
                    style={{ textDecoration: 'none' }}
                >
                    <Box sx={rowSx}>
                        <Box sx={iconTileSx}>
                            <MailIcon sx={{ fontSize: '14px' }} />
                        </Box>
                        <Typography sx={textSx}>{global?.email}</Typography>
                    </Box>
                </Link>
            )}

            {global?.phone && (
                <Link
                    href={`tel:${global?.phone}`}
                    style={{ textDecoration: 'none' }}
                >
                    <Box sx={rowSx}>
                        <Box sx={iconTileSx}>
                            <LocalPhoneIcon sx={{ fontSize: '14px' }} />
                        </Box>
                        <Typography sx={textSx}>{global?.phone}</Typography>
                    </Box>
                </Link>
            )}

            <ContactAddressMap global={global} open={open} setOpen={setOpen} />
        </Box>
    )
}

export const CustomSkelenton = styled((props) => <Skeleton {...props} />)(
    () => ({
        background: 'rgba(255,255,255,0.1)',
    })
)

export default ContactInfo
