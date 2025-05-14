import React from 'react'
import CustomPhoneInput from '@/components/CustomPhoneInput'
import LoadingButton from '@mui/lab/LoadingButton'
import { t } from 'i18next'
import {
    CustomColouredTypography,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import RememberMe from '@/components/auth/RememberMe'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/styles'

const OtpLogin = ({
    otpLoginFormik,
    otpHandleChange,
    global,
    isLoading,
    handleClick,
    rememberMeHandleChange,
    fireBaseId,
}) => {
    const theme = useTheme()
    return (
        <CustomStackFullWidth sx={{ mt: '10px' }}>
            <form onSubmit={otpLoginFormik.handleSubmit} noValidate>
                <CustomStackFullWidth sx={{ gap: '14px' }}>
                    <CustomPhoneInput
                        value={otpLoginFormik.values.phone}
                        onHandleChange={otpHandleChange}
                        initCountry={global?.country}
                        touched={otpLoginFormik.touched.phone}
                        errors={otpLoginFormik.errors.phone}
                        rtlChange="true"
                        borderradius="10px"
                    />
                    <RememberMe
                        rememberMeHandleChange={rememberMeHandleChange}
                    />
                    <CustomStackFullWidth sx={{ paddingY: '5px' }}>
                        <CustomColouredTypography
                            color={theme.palette.neutral[500]}
                            onClick={handleClick}
                            sx={{
                                cursor: 'pointer',
                                // textDecoration: 'underline',
                                fontWeight: '400',
                                fontSize: '12px',
                                [theme.breakpoints.down('sm')]: {
                                    fontSize: '12px',
                                    marginLeft: '0px',
                                },
                            }}
                        >
                            {t('* By login I Agree with all the')}
                            <Typography
                                component="span"
                                color={theme.palette.primary.main}
                                sx={{
                                    textAlign: 'center',
                                    fontWeight: '400',
                                    fontSize: '12px',
                                }}
                            >
                                {t(' Terms & Conditions')}
                            </Typography>
                        </CustomColouredTypography>
                    </CustomStackFullWidth>
                    <LoadingButton
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: '10px',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '.6rem',
                            height: '45px',
                        }}
                        loading={isLoading}
                        id={fireBaseId}
                    >
                        {t('Login')}
                    </LoadingButton>
                </CustomStackFullWidth>
            </form>
        </CustomStackFullWidth>
    )
}

export default OtpLogin
