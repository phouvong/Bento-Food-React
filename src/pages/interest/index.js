import { setWelcomeModal } from '@/redux/slices/utils'
import { Container } from '@mui/material'
import { Box } from '@mui/system'
import { useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { onSingleErrorResponse } from '../../components/ErrorResponse'
import Meta from '../../components/Meta'
import HomeGuard from '../../components/home-guard/HomeGuard'
import InterestOptions from '../../components/interest/InterestOptions'
import { ProfileApi } from '../../hooks/react-query/config/profileApi'
import { setWalletAmount } from '../../redux/slices/cart'
import { setUser } from '../../redux/slices/customer'
import { getServerSideProps } from '../index'
const Interest = ({ configData }) => {
    const { global } = useSelector((state) => state.globalSettings)
    const businessLogo = global?.base_urls?.business_logo_url
    const business_name = global?.business_name
    const { isLoading, data, isError, error, refetch } = useQuery(
        ['profile-info'],
        ProfileApi.profileInfo,
        {
            onError: onSingleErrorResponse,
        }
    )
    const dispatch = useDispatch()
    if (data) {
        dispatch(setWalletAmount(data?.data?.wallet_balance))
        dispatch(setUser(data?.data))
        dispatch(setWelcomeModal(true))
    }

    return (
        <>
            <Meta
                title={configData?.business_name}
                description="A multi-restaurant e-commerce web app"
                keywords=""
                ogImage={`${businessLogo}/${global?.logo}`}
            />
            <HomeGuard>
                <Container
                    maxWidth="lg"
                    sx={{ mb: { xs: '72px', md: '32px' } }}
                >
                    <Box mt={{ xs: '90px', md: '150px' }}>
                        <InterestOptions />
                    </Box>
                </Container>
            </HomeGuard>
        </>
    )
}

export default Interest
export { getServerSideProps }
