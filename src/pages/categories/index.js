import React from 'react'
import Category from '../../components/category/Category'
import Meta from '../../components/Meta'
import { useTranslation } from 'react-i18next'
import { ConfigApi } from '../../hooks/react-query/config/useConfig'
import { landingPageApi } from '../../components/landingpage/Api'
import { CustomHeader } from '../../api/Headers'
import HomeGuard from "../../components/home-guard/HomeGuard";

const index = () => {
    const { t } = useTranslation()
    return (
        <div className="div">
            <HomeGuard>
            <Meta
                title={`${t('Categories')} `}
            />
            <Category />
            </HomeGuard>
        </div>
    )
}

export default index


