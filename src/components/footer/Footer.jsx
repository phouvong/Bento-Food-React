import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { StyledFooterBackground } from './Footer.style'
import FooterBottom from './FooterBottom'
import FooterMiddle from './FooterMiddle'
import FooterTop from './FooterTop'
import FooterTopSection from './FooterTopSection'

import { useGetLandingPageData } from '@/hooks/react-query/landing-page/useGetLandingPageData'
import { setLandingPageData } from '@/redux/slices/storedData'
const Footer = ({ languageDirection }) => {
    const dispatch = useDispatch()
    const { landingPageData } = useSelector((state) => state.storedData)
    const router = useRouter()
    const onSuccessHandler = (res) => {
        dispatch(setLandingPageData(res))
    }

    const { data, refetch, isLoading } = useGetLandingPageData(onSuccessHandler)
    useEffect(() => {
        if (!landingPageData || Object.keys(landingPageData).length === 0) {
            refetch()
        }
    }, [])

    return (
        <>
            <FooterTop landingPageData={landingPageData} />
            <StyledFooterBackground router={router.pathname}>
                <CustomStackFullWidth
                    height="100%"
                    alignItems="center"
                    justifyContent="space-between"
                    paddingTop={{ xs: '20px', md: '50px' }}
                >
                    <FooterTopSection />
                    <FooterMiddle
                        landingPageData={landingPageData}
                        isLoading={isLoading}
                    />
                    <FooterBottom />
                </CustomStackFullWidth>
            </StyledFooterBackground>
        </>
    )
}

export default Footer
