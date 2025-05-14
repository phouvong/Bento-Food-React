import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import { AuthApi } from '@/hooks/react-query/config/authApi'
import { setWelcomeModal } from '@/redux/slices/utils'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import GroupIcon from '@mui/icons-material/Group'
import LockIcon from '@mui/icons-material/Lock'
import MailIcon from '@mui/icons-material/Mail'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { LoadingButton } from '@mui/lab'
import { Grid, alpha, styled, Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import TextField from '@mui/material/TextField'
import { useTheme } from '@mui/material/styles'
import { useFormik } from 'formik'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { useVerifyPhone } from '@/hooks/react-query/otp/useVerifyPhone'
import { setToken } from '@/redux/slices/userToken'
import {
    CustomColouredTypography,
    CustomLink,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import CustomImageContainer from '../../CustomImageContainer'
import CustomPhoneInput from '../../CustomPhoneInput'
import { onErrorResponse, onSingleErrorResponse } from '../../ErrorResponse'
import { RTL } from '../../RTL/RTL'
import CustomModal from '../../custom-modal/CustomModal'
import { CustomTypography } from '../../custom-tables/Tables.style'
import SignUpValidation from '../SignUpValidation'
import OtpForm from '../forgot-password/OtpForm'
import { CustomSigninOutLine } from '../sign-in'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'
import { getLoginUserCheck } from '@/components/auth/loginHelper'
import { useFireBaseOtpVerify } from '@/hooks/react-query/useFireBaseVerfify'

export const CustomSignUpTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-input': {
        padding: '12.5px 0px !important',
        fontSize: '14px',
        fontWeight: '400',
        borderRadius: '4px',
        '&::placeholder': {
            color: alpha(theme.palette.neutral[400], 0.7), // Light placeholder color
        },
    },
    '& .MuiOutlinedInput-root': {
        borderRadius: '4px',
        '& fieldset': {
            borderColor: alpha(theme.palette.neutral[400], 0.5), // Light outline color
            borderWidth: '1px', // Thin outline
        },
        '&:hover fieldset': {
            borderColor: alpha(theme.palette.neutral[600], 0.7), // Slightly darker on hover
        },
        '&.Mui-focused fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.7), // Light and thin border color on focus
            borderWidth: '1px', // Keep the outline thin on focus
        },
    },
    '& .MuiInputLabel-root': {
        color: theme.palette.neutral[1000],
        '&.Mui-focused': {
            color: (theme) => theme.palette.neutral[1000], // Set label color to black when focused
        },
        '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -6px) scale(0.75) !importent', // Adjust the label position and scale when it shrinks
            // Ensure it doesn’t overlap with the startAdornment
        },
    },
}))

const SignUpPage = ({ handleClose, setModalFor, verificationId, sendOTP }) => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const router = useRouter()
    const theme = useTheme()
    const [showConfirmPassword, setConfirmShowPassword] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { global } = useSelector((state) => state.globalSettings)
    const [openOtpModal, setOpenOtpModal] = useState(false)
    const [otpData, setOtpData] = useState({ type: '' })
    const [mainToken, setMainToken] = useState(null)
    const [loginValue, setLoginValue] = useState(null)

    const signUpFormik = useFormik({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirm_password: '',
            ref_code: '',
            tandc: false,
        },
        validationSchema: SignUpValidation(),
        onSubmit: async (values, helpers) => {
            try {
                formSubmitHandler(values)
            } catch (err) {}
        },
    })

    const { mutate, isLoading, error } = useMutation('sign-up', AuthApi.signUp)
    useEffect(() => {
        if (otpData?.type !== '') {
            setOpenOtpModal(true)
        }
    }, [otpData])

    const handleTokenAfterSignUp = (response) => {
        if (response) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', response?.token)
            }
            CustomToaster('success', 'Signup successfully.')
            dispatch(setToken(response?.token))
            handleClose?.()
            router.push('/interest', {
                query: { from: 'welcome' },
            })
        }
    }

    const formSubmitHandler = (values) => {
        const signUpData = {
            name: values.name,
            email: values.email,
            phone: values.phone,
            password: values.password,
            confirm_password: values.confirm_password,
            ref_code: values.ref_code,
            guest_id: values?.guest_id ?? getGuestId(),
        }
        setLoginValue(signUpData)
        mutate(signUpData, {
            onSuccess: async (response) => {
                getLoginUserCheck(
                    response,
                    signUpData,
                    handleTokenAfterSignUp,
                    setOtpData,
                    setMainToken,
                    sendOTP,
                    global
                )
            },
            onError: onErrorResponse,
        })
    }
    const { mutate: otpVerifyMutate, isLoading: isLoadingOtpVerifiyAPi } =
        useVerifyPhone()

    const { mutate: fireBaseOtpMutation, isLoading: fireIsLoading } =
        useFireBaseOtpVerify()
    const otpFormSubmitHandler = (values) => {
        const onSuccessHandler = (res) => {
            setOpenOtpModal(false)
            handleTokenAfterSignUp(res)
            handleClose()
            dispatch(setWelcomeModal(true))
        }

        if (
            global?.firebase_otp_verification === 1 &&
            global?.centralize_login?.phone_verification_status === 1
        ) {
            const temValue = {
                session_info: verificationId,
                phone: values.phone,
                otp: values.reset_token,
                login_type: 'manual',
                guest_id: getGuestId(),
            }
            fireBaseOtpMutation(temValue, {
                onSuccess: onSuccessHandler,
                onError: onErrorResponse,
            })
        } else {
            let tempValues = {
                [otpData?.verification_type]: otpData.type,
                otp: values.reset_token,
                login_type: otpData?.login_type,
                verification_type: otpData?.verification_type,
                guest_id: getGuestId(),
            }

            otpVerifyMutate(tempValues, {
                onSuccess: onSuccessHandler,
                onError: onSingleErrorResponse,
            })
        }
    }
    const handleOnChange = (value) => {
        signUpFormik.setFieldValue('phone', `+${value}`)
    }
    const handleCheckbox = (e) => {
        signUpFormik.setFieldValue('tandc', e.target.checked)
    }
    const handleClick = () => {
        window.open('/terms-and-conditions')
    }
    const languageDirection = localStorage.getItem('direction')
    return (
        <Stack>
            <RTL direction={languageDirection}>
                <CustomStackFullWidth
                    alignItems="center"
                    spacing={{ xs: 0.5, md: 3 }}
                >
                    <CustomStackFullWidth
                        alignItems="center"
                        spacing={{ xs: 1, md: 0 }}
                    >
                        <CustomImageContainer
                            src={global?.logo_full_url}
                            width="50%"
                            height="70px"
                            alt="Logo"
                        />
                        <CustomTypography
                            sx={{ fontWeight: 'bold', fontSize: '22px' }}
                        >
                            {t('Sign Up')}
                        </CustomTypography>
                    </CustomStackFullWidth>
                    <form onSubmit={signUpFormik.handleSubmit} noValidate>
                        <Stack>
                            <Grid container spacing={3}>
                                <Grid
                                    item
                                    xs={12}
                                    md={
                                        global?.ref_earning_status === 1
                                            ? 6
                                            : 12
                                    }
                                >
                                    <CustomSignUpTextField
                                        required
                                        fullWidth
                                        id="name"
                                        label={t('User name')}
                                        placeholder={t('User name')}
                                        InputLabelProps={{
                                            shrink:
                                                !!signUpFormik.values.name ||
                                                signUpFormik.touched.name,
                                        }}
                                        name="name"
                                        autoComplete="name"
                                        value={signUpFormik.values.name}
                                        onChange={signUpFormik.handleChange}
                                        error={
                                            signUpFormik.touched.name &&
                                            Boolean(signUpFormik.errors.name)
                                        }
                                        helperText={
                                            signUpFormik.touched.name &&
                                            signUpFormik.errors.name
                                        }
                                        touched={signUpFormik.touched.name}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AccountCircleIcon
                                                        sx={{
                                                            fontSize: '1.2rem',
                                                            color: (theme) =>
                                                                alpha(
                                                                    theme
                                                                        .palette
                                                                        .neutral[400],
                                                                    0.5
                                                                ),
                                                        }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                {global?.customer_wallet_status === 1 &&
                                global?.ref_earning_status === 1 ? (
                                    <Grid item xs={12} md={6}>
                                        <CustomSignUpTextField
                                            fullWidth
                                            id="ref_code"
                                            label={t('Refer Code (Optional)')}
                                            placeholder={t(
                                                'Refer Code (Optional)'
                                            )}
                                            name="ref_code"
                                            autoComplete="ref_code"
                                            value={signUpFormik.values.ref_code}
                                            onChange={signUpFormik.handleChange}
                                            error={
                                                signUpFormik.touched.ref_code &&
                                                Boolean(
                                                    signUpFormik.errors.ref_code
                                                )
                                            }
                                            helperText={
                                                signUpFormik.touched.ref_code &&
                                                signUpFormik.errors.ref_code
                                            }
                                            touched={
                                                signUpFormik.touched.ref_code
                                            }
                                            //   autoFocus
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <GroupIcon
                                                            sx={{
                                                                fontSize:
                                                                    '1.2rem',
                                                                color: (
                                                                    theme
                                                                ) =>
                                                                    alpha(
                                                                        theme
                                                                            .palette
                                                                            .neutral[400],
                                                                        0.5
                                                                    ),
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                ) : (
                                    ''
                                )}
                                <Grid item xs={12} md={6}>
                                    <CustomSignUpTextField
                                        required
                                        fullWidth
                                        id="email"
                                        label={t('Email')}
                                        name="email"
                                        autoComplete="email"
                                        placeholder={t('Email')}
                                        value={signUpFormik.values.email}
                                        onChange={signUpFormik.handleChange}
                                        error={
                                            signUpFormik.touched.email &&
                                            Boolean(signUpFormik.errors.email)
                                        }
                                        helperText={
                                            signUpFormik.touched.email &&
                                            signUpFormik.errors.email
                                        }
                                        touched={signUpFormik.touched.email}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <MailIcon
                                                        sx={{
                                                            fontSize: '1.2rem',
                                                            color: (theme) =>
                                                                alpha(
                                                                    theme
                                                                        .palette
                                                                        .neutral[400],
                                                                    0.5
                                                                ),
                                                        }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <CustomPhoneInput
                                        value={signUpFormik.values.phone}
                                        onHandleChange={handleOnChange}
                                        initCountry={global?.country}
                                        touched={signUpFormik.touched.phone}
                                        errors={signUpFormik.errors.phone}
                                        rtlChange="true"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl variant="outlined" fullWidth>
                                        <InputLabel
                                            required
                                            sx={{
                                                color: (theme) =>
                                                    theme.palette.neutral[1000],
                                                '&.Mui-focused': {
                                                    color: (theme) =>
                                                        theme.palette
                                                            .neutral[1000],
                                                },
                                            }}
                                            htmlFor="password"
                                        >
                                            {t('Password')}
                                        </InputLabel>
                                        <CustomSigninOutLine
                                            width="100%"
                                            required
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            id="password"
                                            name="password"
                                            placeholder={t('6+ Character')}
                                            value={signUpFormik.values.password}
                                            onChange={signUpFormik.handleChange}
                                            error={
                                                signUpFormik.touched.password &&
                                                Boolean(
                                                    signUpFormik.errors.password
                                                )
                                            }
                                            helperText={
                                                signUpFormik.touched.password &&
                                                signUpFormik.errors.password
                                            }
                                            touched={
                                                signUpFormik.touched.password
                                            }
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() =>
                                                            setShowPassword(
                                                                (prevState) =>
                                                                    !prevState
                                                            )
                                                        }
                                                        //   onMouseDown={handleMouseDownPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? (
                                                            <Visibility
                                                                sx={{
                                                                    color: (
                                                                        theme
                                                                    ) =>
                                                                        alpha(
                                                                            theme
                                                                                .palette
                                                                                .neutral[400],
                                                                            0.5
                                                                        ),
                                                                }}
                                                            />
                                                        ) : (
                                                            <VisibilityOff
                                                                sx={{
                                                                    color: (
                                                                        theme
                                                                    ) =>
                                                                        alpha(
                                                                            theme
                                                                                .palette
                                                                                .neutral[400],
                                                                            0.5
                                                                        ),
                                                                }}
                                                            />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            startAdornment={
                                                <InputAdornment
                                                    position="start"
                                                    sx={{
                                                        marginInlineEnd:
                                                            '0px !important',
                                                    }}
                                                >
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        edge="start"
                                                    >
                                                        <LockIcon
                                                            sx={{
                                                                fontSize:
                                                                    '1.2rem',
                                                                color: (
                                                                    theme
                                                                ) =>
                                                                    alpha(
                                                                        theme
                                                                            .palette
                                                                            .neutral[400],
                                                                        0.5
                                                                    ),
                                                            }}
                                                        />
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            label="Password"
                                        />

                                        {signUpFormik.errors.password && (
                                            <FormHelperText
                                                sx={{
                                                    color: '#FF686A',
                                                    fontSize: '10px',
                                                }}
                                            >
                                                {signUpFormik.errors.password}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl variant="outlined" fullWidth>
                                        <InputLabel
                                            required
                                            sx={{
                                                color: (theme) =>
                                                    theme.palette.neutral[1000],
                                                '&.Mui-focused': {
                                                    color: (theme) =>
                                                        theme.palette
                                                            .neutral[1000],
                                                },
                                            }}
                                            htmlFor="outlined-adornment-password"
                                        >
                                            {t('Confirm Password')}
                                        </InputLabel>
                                        <CustomSigninOutLine
                                            width="100%"
                                            required
                                            type={
                                                showConfirmPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            id="confirm_password"
                                            name="confirm_password"
                                            placeholder={t('8+ Character')}
                                            value={
                                                signUpFormik.values
                                                    .confirm_password
                                            }
                                            onChange={signUpFormik.handleChange}
                                            error={
                                                signUpFormik.touched
                                                    .confirm_password &&
                                                Boolean(
                                                    signUpFormik.errors
                                                        .confirm_password
                                                )
                                            }
                                            helperText={
                                                signUpFormik.touched
                                                    .confirm_password &&
                                                signUpFormik.errors
                                                    .confirm_password
                                            }
                                            touched={
                                                signUpFormik.touched
                                                    .confirm_password
                                            }
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() =>
                                                            setConfirmShowPassword(
                                                                (prevState) =>
                                                                    !prevState
                                                            )
                                                        }
                                                        edge="end"
                                                    >
                                                        {showConfirmPassword ? (
                                                            <Visibility
                                                                sx={{
                                                                    color: (
                                                                        theme
                                                                    ) =>
                                                                        alpha(
                                                                            theme
                                                                                .palette
                                                                                .neutral[400],
                                                                            0.5
                                                                        ),
                                                                }}
                                                            />
                                                        ) : (
                                                            <VisibilityOff
                                                                sx={{
                                                                    color: (
                                                                        theme
                                                                    ) =>
                                                                        alpha(
                                                                            theme
                                                                                .palette
                                                                                .neutral[400],
                                                                            0.5
                                                                        ),
                                                                }}
                                                            />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            startAdornment={
                                                <InputAdornment
                                                    position="start"
                                                    sx={{
                                                        marginInlineEnd:
                                                            '0px !important',
                                                    }}
                                                >
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        edge="start"
                                                    >
                                                        <LockIcon
                                                            sx={{
                                                                fontSize:
                                                                    '1.2rem',
                                                                color: (
                                                                    theme
                                                                ) =>
                                                                    alpha(
                                                                        theme
                                                                            .palette
                                                                            .neutral[400],
                                                                        0.5
                                                                    ),
                                                            }}
                                                        />
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            label="confirm_password"
                                        />
                                        {signUpFormik.errors
                                            .confirm_password && (
                                            <FormHelperText
                                                sx={{
                                                    color: (theme) =>
                                                        theme.palette.error
                                                            .main,
                                                    fontSize: '10px',
                                                }}
                                            >
                                                {
                                                    signUpFormik.errors
                                                        .confirm_password
                                                }
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <CustomStackFullWidth>
                                <CustomStackFullWidth
                                    direction="row"
                                    alignItems="center"
                                    spacing={{ xs: '0', md: '.5' }}
                                    sx={{
                                        mt: '7px',
                                        marginInlineStart: '-8px',
                                    }}
                                >
                                    <FormControlLabel
                                        sx={{
                                            marginRight: '5px',

                                            '& .MuiFormControlLabel-label': {
                                                fontSize: '12px',
                                                color: (theme) =>
                                                    theme.palette.neutral[1000],
                                            },
                                            [theme.breakpoints.down('sm')]: {
                                                '& .MuiFormControlLabel-label':
                                                    {
                                                        fontSize: '10px',
                                                    },
                                            },
                                        }}
                                        control={
                                            <Checkbox
                                                value="ff"
                                                color="primary"
                                                onChange={(e) =>
                                                    handleCheckbox(e)
                                                }
                                                required="true"
                                            />
                                        }
                                        label={t('I accept all the')}
                                    />
                                    <CustomColouredTypography
                                        color={theme.palette.primary.main}
                                        onClick={handleClick}
                                        sx={{
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            fontSize: '12px',
                                            [theme.breakpoints.down('sm')]: {
                                                fontSize: '10px',
                                                marginLeft: '0px',
                                            },
                                        }}
                                    >
                                        {t('Terms and conditions')}
                                    </CustomColouredTypography>
                                </CustomStackFullWidth>
                                {signUpFormik.touched.tandc &&
                                    signUpFormik.errors.tandc && (
                                        <CustomTypography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 'inherit',
                                                color: (theme) =>
                                                    theme.palette.error.main,
                                            }}
                                        >
                                            {t(
                                                'You must accept the terms and conditions'
                                            )}
                                        </CustomTypography>
                                    )}
                            </CustomStackFullWidth>
                            <Stack
                                witdh="100%"
                                justifyContent="center"
                                alignItems="center"
                            >
                                {!signUpFormik?.values?.tandc ? (
                                    <LoadingButton
                                        type="submit"
                                        fullWidth
                                        sx={{
                                            mt: 1,
                                            mb: 3.5,
                                            maxWidth: '400px',
                                            height: '45px',
                                        }}
                                        loading={isLoading}
                                        variant="contained"
                                        disabled
                                    >
                                        {t('Sign Up')}
                                    </LoadingButton>
                                ) : (
                                    <LoadingButton
                                        type="submit"
                                        fullWidth
                                        sx={{
                                            mt: 1,
                                            mb: 3.5,
                                            maxWidth: '400px',
                                            height: '45px',
                                        }}
                                        loading={isLoading}
                                        variant="contained"
                                        id="recaptcha-container"
                                    >
                                        {t('Sign Up')}
                                    </LoadingButton>
                                )}
                            </Stack>
                        </Stack>
                    </form>
                </CustomStackFullWidth>
                <Box>
                    <CustomTypography align="center" fontSize="14px">
                        {t('Already have an account?')}
                        <CustomLink
                            onClick={() => {
                                setModalFor('sign-in')
                            }}
                            href="#"
                            variant="body2"
                            sx={{ ml: '5px' }}
                        >
                            {t('Sign In')}
                        </CustomLink>
                    </CustomTypography>
                </Box>
                <CustomModal
                    openModal={openOtpModal}
                    setModalOpen={setOpenOtpModal}
                >
                    <OtpForm
                        handleClose={() => setOpenOtpModal(false)}
                        data={otpData?.type}
                        formSubmitHandler={otpFormSubmitHandler}
                        isLoading={isLoadingOtpVerifiyAPi || fireIsLoading}
                        loginValue={loginValue}
                        reSendOtp={formSubmitHandler}
                    />
                </CustomModal>
            </RTL>
        </Stack>
    )
}

export default SignUpPage
