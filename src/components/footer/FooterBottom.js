import {
    CustomColouredTypography,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import CustomContainer from '../container'

const FooterBottom = () => {
    const { global } = useSelector((state) => state.globalSettings)
    const { t } = useTranslation()

    return (
        <CustomStackFullWidth py="1.5rem">
            <CustomContainer>
                <CustomStackFullWidth
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems="center"
                    justifyContent="center"
                    flexWrap="wrap"
                    spacing={2}
                >
                    <CustomColouredTypography
                        fontSize="14px"
                        sx={{
                            fontWeight: 400,
                        }}
                        color="whiteContainer.main"
                    >
                        {t('Copyright')} &#9400;{'  '}
                        {global?.footer_text || ''}
                    </CustomColouredTypography>
                </CustomStackFullWidth>
            </CustomContainer>
        </CustomStackFullWidth>
    )
}

FooterBottom.propTypes = {}

export default FooterBottom
