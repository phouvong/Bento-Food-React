import styled from '@emotion/styled'
import { Box, Skeleton, Typography } from '@mui/material'
import Link from 'next/link'
import { useState } from 'react'
import ContactAddressMap from '../help-page/ContactAddressMap'
import { footerColors } from './Footer.style'

const ContactInfo = ({ global }) => {
    const [open, setOpen] = useState(false)

    const handleOpenCloseMap = () => {
        setOpen(!open)
    }

    const iconTileSx = {
        width: 28,
        height: 28,
        borderRadius: '8px',
        background: { xs: footerColors.iconTileLight, md: footerColors.iconTileDark },
        color: footerColors.text,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    }

    const rowSx = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'center', md: 'flex-start' },
        gap: '16px',
        width: '100%',
    }

    const textSx = {
        color: footerColors.text,
        fontSize: '14px',
        lineHeight: 1.2,
        textAlign: { xs: 'center', md: 'left' },
    }

    if (!global)
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    alignItems: { xs: 'center', md: 'flex-start' },
                    width: '100%',
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
                gap: { xs: '8px', md: '16px' },
                width: '100%',
            }}
        >
            {global?.phone && (
                <Link
                    href={`tel:${global?.phone}`}
                    style={{ textDecoration: 'none' }}
                >
                    <Box sx={rowSx}>
                        <Box sx={iconTileSx}>
                            <Box component="i" className="fi fi-rr-phone-call" sx={{ fontSize: '14px' }} />
                        </Box>
                        <Typography sx={textSx}>{global?.phone}</Typography>
                    </Box>
                </Link>
            )}

            {global?.email && (
                <Link
                    href={`mailto:${global?.email}`}
                    style={{ textDecoration: 'none' }}
                >
                    <Box sx={rowSx}>
                        <Box sx={iconTileSx}>
                            <Box component="i" className="fi fi-rr-envelope" sx={{ fontSize: '14px' }} />
                        </Box>
                        <Typography sx={textSx}>{global?.email}</Typography>
                    </Box>
                </Link>
            )}

            {global?.address && (
                <Box
                    sx={{ ...rowSx, cursor: 'pointer' }}
                    onClick={handleOpenCloseMap}
                >
                    <Box sx={iconTileSx}>
                        <Box component="i" className="fi fi-rr-marker" sx={{ fontSize: '14px' }} />
                    </Box>
                    <Typography sx={textSx}>{global?.address}</Typography>
                </Box>
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
