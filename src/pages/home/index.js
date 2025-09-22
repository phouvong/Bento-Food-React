import Homes from '../../components/home/Homes'
import Meta from '../../components/Meta'
import HomeGuard from '../../components/home-guard/HomeGuard'
import { getServerSideProps } from '../index'
import { useQuery } from 'react-query'
import { ConfigApi } from '@/hooks/react-query/config/useConfig'
import { onSingleErrorResponse } from '@/components/ErrorResponse'
import { useEffect } from 'react'
import { setGlobalSettings } from '@/redux/slices/global'
import { useDispatch, useSelector } from 'react-redux'

const HomePage = ({  pathName }) => {
    const dispatch = useDispatch()
    const { global } = useSelector((state) => state.globalSettings)
    const handleConfigData = (res) => {
        if (res?.data) {
            dispatch(setGlobalSettings(res?.data))
        }
    }
    const { data:configData, refetch } = useQuery(['config'], ConfigApi.config, {
        enabled: false,
        onError: onSingleErrorResponse,
        onSuccess: handleConfigData,
        staleTime: 1000 * 60 * 8,
        cacheTime: 8 * 60 * 1000,
    })
    useEffect(() => {
        if (!global) {
            refetch()
        }
    }, [configData])
    return (
        <>
            <Meta
                title={configData?.business_name}
                ogImage={`${configData?.logo_full_url}`}
                pathName={pathName}
            />
            <Homes configData={configData} />
        </>
    )
}
HomePage.getLayout = (page) => <HomeGuard>{page}</HomeGuard>

export default HomePage
