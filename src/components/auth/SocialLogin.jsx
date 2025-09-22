import React, { memo } from 'react'
import SocialLogins from '@/components/auth/sign-in/social-login/SocialLogins'
import { Stack } from '@mui/material'

const SocialLogin = (props) => {
    const {
        global,
        handleClose,
        setJwtToken,
        setUserInfo,
        setModalFor,
        handleSuccess,
        setMedium,
        loginMutation,
        setLoginInfo,
        setForWidth,
        all,
    } = props
    return (
        <>
            {global?.social_login.length > 0 && (
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                    sx={{ marginTop: '15px !important' }}
                    width="100%"
                >
                    <SocialLogins
                        socialLogins={global?.social_login}
                        handleParentModalClose={handleClose}
                        setJwtToken={setJwtToken}
                        setUserInfo={setUserInfo}
                        handleSuccess={handleSuccess}
                        setModalFor={setModalFor}
                        setMedium={setMedium}
                        loginMutation={loginMutation}
                        setLoginInfo={setLoginInfo}
                        setForWidth={setForWidth}
                        all={all}
                    />
                </Stack>
            )}
        </>
    )
}

export default memo(SocialLogin)
