import React, { useEffect } from 'react'
import { t } from 'i18next'
import CustomImageContainer from '@/components/CustomImageContainer'
import Meta from '@/components/Meta'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { Container, Typography, Stack } from '@mui/material'
import MaintenanceImage from '/public/static/maintenance.png'
import { checkMaintenanceMode } from '@/utils/customFunctions'
import { useRouter } from 'next/router'
import CustomDivider from '@/components/CustomDivider'
import CustomCallTo from '@/components/CustomCallTo'
import { useTheme } from '@mui/styles'

const Maintenance = ({ configData }) => {
    const router = useRouter()
    const theme = useTheme()
    useEffect(() => {
        if (!checkMaintenanceMode(configData)) {
            router.push('/')
        }
    }, [])

    const handleEmailClick = () => {
        router.push(`mailto:${configData?.email}`)
    }
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
                <Stack
                    maxWidth="600px"
                    width="100%"
                    spacing={2}
                    padding="1rem"
                    justifyContent="center"
                    alignItems="center"
                >
                    <CustomImageContainer
                        width="325px"
                        height="100%"
                        objectfit="cover"
                        src={MaintenanceImage.src}
                        loading="auto"
                    />
                    <Stack spacing={2}>
                        <Typography
                            align="center"
                            variant="h3"
                            color={theme.palette.neutral[1000]}
                        >
                            {configData?.maintenance_mode_data
                                ?.maintenance_message_setup?.maintenance_message
                                ? configData?.maintenance_mode_data
                                      ?.maintenance_message_setup
                                      ?.maintenance_message
                                : t('We are Cooking Up Something Special!')}
                        </Typography>
                        <Typography
                            align="center"
                            color={theme.palette.neutral[900]}
                            fontSize="14px"
                        >
                            {configData?.maintenance_mode_data
                                ?.maintenance_message_setup?.message_body
                                ? configData?.maintenance_mode_data
                                      ?.maintenance_message_setup?.message_body
                                : 'Our system is currently undergoing maintenance to bring you an even tastier experience. Hang tight while we make the dishes.'}
                        </Typography>
                    </Stack>
                    <CustomDivider divider="3px" type="dashed" />
                    {configData?.maintenance_mode_data
                        ?.maintenance_message_setup?.business_email === 1 ||
                    configData?.maintenance_mode_data?.maintenance_message_setup
                        ?.business_number === 1 ? (
                        <Typography
                            textAlign="center"
                            fontSize="14px"
                            color={theme.palette.neutral[1000]}
                        >
                            {t('Any query? Feel free to contact us')}
                        </Typography>
                    ) : null}
                    <Stack
                        justifyContent="center"
                        width="100%"
                        alignItems="center"
                    >
                        {configData?.maintenance_mode_data
                            ?.maintenance_message_setup?.business_email ===
                            1 && (
                            <CustomCallTo phone={configData?.phone}>
                                <Typography
                                    fontSize="14px"
                                    sx={{
                                        color: (theme) =>
                                            theme.palette.primary.main,
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {configData?.phone}
                                </Typography>
                            </CustomCallTo>
                        )}
                        {configData?.maintenance_mode_data
                            ?.maintenance_message_setup?.business_number ===
                            1 && (
                            <Typography
                                onClick={handleEmailClick}
                                fontSize="14px"
                                sx={{
                                    color: (theme) =>
                                        theme.palette.primary.main,
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                }}
                            >
                                {configData?.email}
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </CustomStackFullWidth>
        </Container>
    )
}

export default Maintenance

export const getServerSideProps = async (context) => {
    const { req } = context
    const language = req.cookies.languageSetting

    let configData = null

    try {
        const configRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config`,
            {
                method: 'GET',
                headers: {
                    'X-software-id': 33571750,
                    'X-server': 'server',
                    'X-localization': language,
                    origin: process.env.NEXT_CLIENT_HOST_URL,
                },
            }
        )

        if (!configRes.ok) {
            console.error(
                'Error fetching config data:',
                configRes.status,
                configRes.statusText
            )
            throw new Error(`Failed to fetch config data: ${configRes.status}`)
        }

        configData = await configRes.json()
    } catch (error) {
        console.error('Error in config data fetch:', error)
    }

    return {
        props: {
            configData,
        },
    }
}
