import React from 'react'
import { t } from 'i18next'
import CustomImageContainer from "@/components/CustomImageContainer";
import Meta from "@/components/Meta";
import { CustomStackFullWidth } from "@/styled-components/CustomStyles.style";
import { Stack } from "@mui/system";
import { Container, Typography } from "@mui/material";
import MaintenanceImage from '/public/static/maintenance.png'

const Maintenance = () => {
    return (
        <Container
            maxWidth="lg"
            sx={{
                mt: '9rem',
                mb: { xs: '72px', md: '0' },
            }}
        >
            <Meta title={t('Maintenance mode')} />
            <CustomStackFullWidth
                justifyContent="center"
                alignItems="center"
                spacing={4}
            >
                <Stack maxWidth="600px" width="100%" spacing={2} padding="1rem">
                    <CustomImageContainer
                        width="100%"
                        height="100%"
                        objectfit="cover"
                        src={MaintenanceImage.src}
                    />
                    <Stack>
                        <Typography
                            align="center"
                            variant="h3"
                            color="primary.main"
                        >
                            {t('We are under Maintenance.')}
                        </Typography>
                        <Typography align="center" variant="h5">
                            {t('We will be back very soon.')}
                        </Typography>
                    </Stack>
                </Stack>
            </CustomStackFullWidth>
        </Container>
    )
}

export default Maintenance
