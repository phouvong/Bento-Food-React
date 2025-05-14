import React, { memo, useEffect, useState } from 'react'
import GoogleLoginComp from './GoogleLoginComp'
import FbLoginComp from './FbLoginComp'
import { useSelector } from 'react-redux'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'

const SocialLogins = (props) => {
    const {
        socialLogins,
        handleParentModalClose,
        setJwtToken,
        setUserInfo,
        handleSuccess,
        setModalFor,
        setMedium,
        loginMutation,
        setLoginInfo,
        setForWidth,
        all,
    } = props
    const { global } = useSelector((state) => state.globalSettings)
    const [isSingle, setIsSingle] = useState(false)
    useEffect(() => {
        if (socialLogins) {
            let length = 0
            socialLogins.map((item) => {
                if (item.status === true) {
                    length = length + 1
                }
            })
            if (length > 1) {
                setIsSingle(false)
            } else {
                setIsSingle(true)
            }
        }
    }, [])
    return (
        <CustomStackFullWidth
            alignItems="center"
            justifyContent="center"
            gap="1.5rem"
        >
            {socialLogins.map((item, index) => {
                if (
                    item?.login_medium === 'facebook' &&
                    item?.status === true &&
                    global?.centralize_login?.facebook_login_status === 1
                ) {
                    return (
                        <FbLoginComp
                            key={index}
                            handleSuccess={handleSuccess}
                            handleParentModalClose={handleParentModalClose}
                            global={global}
                            setJwtToken={setJwtToken}
                            setUserInfo={setUserInfo}
                            setModalFor={setModalFor}
                            setMedium={setMedium}
                            isSingle={isSingle}
                            loginMutation={loginMutation}
                            setLoginInfo={setLoginInfo}
                            setForWidth={setForWidth}
                        />
                    )
                } else if (
                    item?.login_medium === 'google' &&
                    item.status === true &&
                    global?.centralize_login?.google_login_status === 1
                ) {
                    return (
                        <GoogleLoginComp
                            key={index}
                            handleSuccess={handleSuccess}
                            handleParentModalClose={handleParentModalClose}
                            global={global}
                            setJwtToken={setJwtToken}
                            setUserInfo={setUserInfo}
                            setModalFor={setModalFor}
                            setMedium={setMedium}
                            isSingle={isSingle}
                            loginMutation={loginMutation}
                            setLoginInfo={setLoginInfo}
                            setForWidth={setForWidth}
                            all={all}
                        />
                    )
                }
            })}
        </CustomStackFullWidth>
    )
}

SocialLogins.propTypes = {}

export default memo(SocialLogins)
