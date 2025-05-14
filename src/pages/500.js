import { Stack } from '@mui/material'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import ErrorRoutesProtect from '../components/route-protectors/ErrorRoutesProtect'
import FiveHundred from '../../public/static/500.svg'
import CustomImageContainer from '@/components/CustomImageContainer'
import CustomContainer from '@/components/container'

export default function Custom500() {
    return (
        <ErrorRoutesProtect>
            <CustomContainer>
                <CustomStackFullWidth
                    justifyContent="center"
                    alignItems="center"
                >
                    <Stack
                        maxWidth="500px"
                        width="100%"
                        spacing={2}
                        padding={{ xs: '3rem 1rem 3rem', md: '6rem 1rem 3rem' }}
                    >
                        <CustomImageContainer
                            loading="auto"
                            src={FiveHundred?.src}
                        />
                    </Stack>
                </CustomStackFullWidth>
            </CustomContainer>
        </ErrorRoutesProtect>
    )
}
