import { Box } from '@mui/material'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useDispatch, useSelector } from 'react-redux'
import { StyledFooterBackground } from './Footer.style'
import FooterBottom from './FooterBottom'
import FooterMiddle from './FooterMiddle'
import FooterTopSection from './FooterTopSection'

import { useGetLandingPageData } from '@/hooks/react-query/landing-page/useGetLandingPageData'
import { setLandingPageData } from '@/redux/slices/storedData'
import { checkMaintenanceMode } from '@/utils/customFunctions'
import SubscribeServices from '../home/subscribe-services/SubscribeServices'
import CustomContainer from '../container'
const Footer = ({ languageDirection }) => {
    const dispatch = useDispatch()
    const { landingPageData } = useSelector((state) => state.storedData)
    const { global } = useSelector((state) => state.globalSettings)
    const onSuccessHandler = (res) => {
        dispatch(setLandingPageData(res))
    }

    const { data, refetch, isLoading } = useGetLandingPageData(onSuccessHandler)
    // The footer sits below the fold on every page — fetching its landing
    // content eagerly on mount competed with each page's own data for the
    // browser's per-host connection slots. Fetch when it approaches view.
    const { ref: footerInViewRef, inView: footerInView } = useInView({
        triggerOnce: true,
        rootMargin: '600px 0px',
    })
    useEffect(() => {
        if (
            footerInView &&
            (!landingPageData || Object.keys(landingPageData).length === 0)
        ) {
            refetch()
        }
    }, [footerInView])

    if (checkMaintenanceMode(global)) {
        return null
    }
    return (
        <>
            {/* In-view sentinel (CustomContainer doesn't forward refs). */}
            <Box ref={footerInViewRef} />
            <CustomContainer sx={{ marginTop: '24px', marginBottom: '24px' }}>
                <SubscribeServices />
            </CustomContainer>
            <StyledFooterBackground>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '32px',
                        py: '32px',
                    }}
                >
                    <FooterTopSection
                        landingPageData={landingPageData}
                        isLoading={isLoading}
                    />
                    <FooterMiddle
                        landingPageData={landingPageData}
                        isLoading={isLoading}
                    />
                </Box>
                <FooterBottom />
            </StyledFooterBackground>
        </>
    )
}

export default Footer
