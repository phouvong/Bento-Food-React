import { Stack } from '@mui/material'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import ErrorRoutesProtect from '../components/route-protectors/ErrorRoutesProtect'
import CustomAlert from '../components/alert/CustomAlert'
import FourHundred from '../../public/static/404.svg'
import CustomImageContainer from '@/components/CustomImageContainer'
import CustomContainer from '@/components/container'

export default function Custom400() {
    return (
        <ErrorRoutesProtect>
            <CustomContainer>
                <CustomStackFullWidth
                    justifyContent="center"
                    alignItems="center"
                    spacing={4}
                >
                    <Stack
                        maxWidth="500px"
                        width="100%"
                        spacing={2}
                        padding={{ xs: '3rem 1rem 3rem', md: '6rem 1rem 3rem' }}
                    >
                        <CustomImageContainer
                            loading="auto"
                            src={FourHundred?.src}
                        />
                        <CustomAlert
                            text="Please buy this system and use activated domain."
                            type="info"
                        />
                    </Stack>
                </CustomStackFullWidth>
            </CustomContainer>
        </ErrorRoutesProtect>
    )
}
