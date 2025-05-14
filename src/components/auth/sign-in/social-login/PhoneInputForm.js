import React from 'react'
import phoneIcon from '../../../../../public/static/profile/phoneInput.png'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { alpha, Stack, Typography, useTheme } from '@mui/material'
import CustomPhoneInput from '../../../CustomPhoneInput'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import LoadingButton from '@mui/lab/LoadingButton'
import { usePostRegisterInfo } from '@/hooks/react-query/social-login/usePostRegisterInfo'
import { onErrorResponse } from '../../../ErrorResponse'
import CustomImageContainer from '../../../CustomImageContainer'
import InputAdornment from '@mui/material/InputAdornment'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { CustomSignUpTextField } from '@/components/auth/sign-up'
import GroupIcon from '@mui/icons-material/Group'

const PhoneInputForm = (props) => {
    const {
        userInfo,
        jwtToken,
        medium,
        handleRegistrationOnSuccess,
        global,
        setModalFor,
    } = props
    const { t } = useTranslation()
    const theme = useTheme()
    const { mutate, isLoading } = usePostRegisterInfo()
    const formik = useFormik({
        initialValues: {
            username: '',
            phone: '',
            ref_code: '',
        },
        validationSchema: Yup.object({
            phone: Yup.string()
                .required(t('Please give a phone number'))
                .min(10, 'number must be 10 digits'),
        }),
        onSubmit: async (values, helpers) => {
            try {
                handleOnSubmitFormik(values)
            } catch (err) {}
        },
    })
    const handleOnSubmitFormik = (values) => {
        const info = {
            email: userInfo?.email,
            token: jwtToken?.credential,
            unique_id: jwtToken?.clientId,
            medium: medium,
            phone: values.phone,
        }
        mutate(info, {
            onSuccess: (response) => {
                handleRegistrationOnSuccess(response?.token)
            },
            onError: onErrorResponse,
        })
    }
    const handleOnChange = (value) => {
        formik.setFieldValue('phone', `+${value}`)
    }
    return (
        <Stack>
            <form onSubmit={formik.handleSubmit} noValidate>
                <CustomStackFullWidth
                    spacing={5}
                    justifyContent="center"
                    alignItems="center"
                >
                    <CustomImageContainer
                        src={phoneIcon.src}
                        width="80px"
                        height="80px"
                    />
                    <Typography
                        fontSize="14px"
                        textAlign="center"
                        color={theme.palette.neutral[1000]}
                    >
                        {t(
                            'Provide a valid phone number to complete your sign up'
                        )}
                    </Typography>
                    <CustomStackFullWidth gap="36px">
                        <CustomSignUpTextField
                            required
                            fullWidth
                            id="name"
                            label={t('Name')}
                            placeholder={t('Name')}
                            name="l_name"
                            autoComplete="username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            error={
                                formik.touched.username &&
                                Boolean(formik.errors.username)
                            }
                            helperText={
                                formik.touched.username &&
                                formik.errors.username
                            }
                            touched={formik.touched.username}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircleIcon
                                            sx={{
                                                fontSize: '1.2rem',
                                                color: (theme) =>
                                                    alpha(
                                                        theme.palette
                                                            .neutral[400],
                                                        0.5
                                                    ),
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <CustomPhoneInput
                            value={formik.values.phone}
                            onHandleChange={handleOnChange}
                            initCountry={global?.country}
                            touched={formik.touched.phone}
                            errors={formik.errors.phone}
                            rtlChange="true"
                        />
                        <CustomSignUpTextField
                            fullWidth
                            id="ref_code"
                            label={t('Refer Code (Optional)')}
                            placeholder={t('Refer Code (Optional)')}
                            name="ref_code"
                            autoComplete="ref_code"
                            value={formik.values.ref_code}
                            onChange={formik.handleChange}
                            error={
                                formik.touched.ref_code &&
                                Boolean(formik.errors.ref_code)
                            }
                            helperText={
                                formik.touched.ref_code &&
                                formik.errors.ref_code
                            }
                            touched={formik.touched.ref_code}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <GroupIcon
                                            sx={{
                                                fontSize: '1.2rem',
                                                color: (theme) =>
                                                    alpha(
                                                        theme.palette
                                                            .neutral[400],
                                                        0.5
                                                    ),
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </CustomStackFullWidth>

                    <LoadingButton
                        type="submit"
                        fullWidth
                        variant="contained"
                        loading={isLoading}
                    >
                        {t('Continue')}
                    </LoadingButton>
                    <Stack mt="10px">
                        <Typography
                            textAlign="center"
                            sx={{
                                cursor: 'pointer',
                                color: theme.palette.neutral[500],
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                            onClick={() => {
                                setModalFor('sign-in')
                                // goNext()
                            }}
                        >
                            {t('Go Back')}
                        </Typography>
                    </Stack>
                </CustomStackFullWidth>
            </form>
        </Stack>
    )
}

PhoneInputForm.propTypes = {}

export default PhoneInputForm
