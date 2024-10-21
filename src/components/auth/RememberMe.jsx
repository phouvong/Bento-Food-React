import React from 'react'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { CustomTypography } from '@/components/custom-tables/Tables.style'
import { t } from 'i18next'

const RememberMe = ({ rememberMeHandleChange }) => {
    return (
        <>
            <FormControlLabel
                control={
                    <Checkbox
                        value="remember"
                        color="primary"
                        onChange={rememberMeHandleChange}
                    />
                }
                label={
                    <CustomTypography fontSize="12px" fontWeight="400">
                        {t('Remember me')}
                    </CustomTypography>
                }
            />
        </>
    )
}

export default RememberMe
