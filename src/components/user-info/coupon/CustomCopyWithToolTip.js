import { alpha } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'
import { useState } from 'react'
import CouponCopy from './CouponCopy'

export const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
        color: alpha(theme.palette.primary.main, 0.1),
    },
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.neutral[1000],
        color: theme.palette.primary.main,
        paddingTop: '5px',
        paddingLeft: '20px',
        paddingBottom: '5px',
        paddingRight: '20px',
        fontSize: '16px',
    },
}))

const CustomCopyWithTooltip = (props) => {
    const { t, value } = props
    const [copy, setCopy] = useState(false)
    const handleCopy = (coupon_code) => {
        setCopy(true)
        navigator.clipboard.writeText(coupon_code)
    }

    return (
        <CustomTooltip placement="top" title={copy ? t('Copied') : t('Copy')}>
            <IconButton
                onMouseEnter={() => copy && setCopy(false)}
                onClick={() => handleCopy(value)}
                sx={{ marginTop: '-18px', marginRight: '-15px' }}
            >
                <CouponCopy color="primary.main" style={{ fontSize: 16 }} />
            </IconButton>
        </CustomTooltip>
    )
}

CustomCopyWithTooltip.propTypes = {
    t: PropTypes.func.isRequired,
    value: PropTypes.any.isRequired,
}

export default CustomCopyWithTooltip
