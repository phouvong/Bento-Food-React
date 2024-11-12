import React from 'react'
import OtpLogin from '@/components/auth/OtpLogin'
import ManualLogin from '@/components/auth/ManualLogin'
import SocialLogin from '@/components/auth/SocialLogin'

const AllLoginActiveForm = () => {
    return (
        <>
            <OtpLogin />
            <ManualLogin
                loginFormik={loginFormik}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                global={global}
            />
            <SocialLogin
                global={global}
                socialLogins={global?.social_login}
                handleParentModalClose={handleClose}
                setJwtToken={setJwtToken}
                setUserInfo={setUserInfo}
                handleSuccess={handleSuccess}
                setModalFor={setModalFor}
                setMedium={setMedium}
            />
        </>
    )
}

export default AllLoginActiveForm
