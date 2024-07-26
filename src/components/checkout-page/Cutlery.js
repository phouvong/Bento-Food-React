import { useState } from 'react'

import { useTheme } from '@emotion/react'
import { Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { useTranslation } from 'react-i18next'
import { CustomStackFullWidth } from '../../styled-components/CustomStyles.style'
import { CustomSwitch } from '../navbar/Navbar.style'
import CutleryIcon from './CutleryIcon'

const Cutlery = (props) => {
    const { isChecked, handleChange } = props
    const [checked, setChecked] = useState(isChecked)
    const { t } = useTranslation()
    const handleChangeInner = (event) => {
        setChecked(event.target.checked)
        handleChange?.(event.target.checked)
    }
    const theme = useTheme()
    return (
        <CustomStackFullWidth
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            p="5px"
            pr="8px"
            pl="16px"
            spacing={0.5}
            boxShadow={theme.shadows2[0]}
            borderRadius="8px"
            sx={{
                '.MuiSwitch-root': {
                    marginTop: '8px',
                    transform: 'scale(0.7)',
                },
            }}
        >
            <CustomStackFullWidth
                direction="row"
                alignItems="center"
                spacing={2}
            >
                <CutleryIcon />
                <Stack>
                    <Typography
                        variant="body2"
                        color="primary"
                        fontWeight="bold"
                        mt="-2px"
                    >
                        {t('Add Cutlery')}
                    </Typography>
                    <Typography color="text.secondary" fontSize="12px">
                        {t('Dont have a cutlery? Restaurant will provide you.')}
                    </Typography>
                </Stack>
            </CustomStackFullWidth>
            <CustomSwitch
                checked={checked}
                onChange={handleChangeInner}
                noimage="true"
            />
        </CustomStackFullWidth>
    )
}

Cutlery.propTypes = {}

export default Cutlery
