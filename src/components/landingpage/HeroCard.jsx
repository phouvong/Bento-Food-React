import React from 'react'
import HeroLocationForm from './HeroLocationForm'
import { HeroCardTypography } from './Landingpage.style'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const HeroCard = (props) => {
    const theme = useTheme()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    return (
        <>
            <HeroCardTypography>
                {props?.banner_section_full?.full_banner_section_title}
            </HeroCardTypography>
            <HeroCardTypography variant="h3" subtitle="true">
                {props?.banner_section_full?.full_banner_section_sub_title}
            </HeroCardTypography>
            {!isXSmall && (
                <HeroLocationForm
                    modalview={props.modalview}
                    handleModalClose={props.handleModalClose}
                />
            )}

            {isXSmall && (
                <HeroLocationForm
                    modalview={props.modalview}
                    handleModalClose={props.handleModalClose}
                />
            )}
        </>
    )
}

export default HeroCard
