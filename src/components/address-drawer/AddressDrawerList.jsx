import NextLink from 'next/link'
import {
    Box,
    ButtonBase,
    Link,
    Radio,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import ApartmentIcon from '@mui/icons-material/Apartment'
import FmdGoodIcon from '@mui/icons-material/FmdGood'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { useTranslation } from 'react-i18next'
import CustomImageContainer from '@/components/CustomImageContainer'
import { noAddressFound } from '@/utils/LocalImages'

const typeIcon = (addressType = '') => {
    const normalized = addressType?.toLowerCase()
    if (normalized === 'home') return HomeIcon
    if (normalized === 'office') return ApartmentIcon
    return FmdGoodIcon
}

const AddressRow = ({ address, selected, onSelect }) => {
    const Icon = typeIcon(address?.address_type)

    return (
        <ButtonBase
            onClick={() => onSelect(address)}
            sx={{
                width: '100%',
                justifyContent: 'flex-start',
                textAlign: 'start',
                gap: '8px',
                px: '12px',
                py: '16px',
                borderRadius: '12px',
                border: (theme) =>
                    `1px solid ${
                        selected
                            ? theme.palette.primary.main
                            : theme.palette.divider
                    }`,
                transition: 'border-color 0.15s ease',
            }}
        >
            <Box
                sx={{
                    display: 'inline-flex',
                    p: '2px',
                    flexShrink: 0,
                    color: (theme) => theme.palette.text.secondary,
                }}
            >
                <Icon sx={{ fontSize: 18 }} />
            </Box>

            <Stack sx={{ flex: 1, minWidth: 0, gap: '2px' }}>
                <Typography
                    sx={{
                        fontSize: '16px',
                        fontWeight: 500,
                        lineHeight: 1.1,
                        letterSpacing: '-0.48px',
                        textTransform: 'capitalize',
                        color: (theme) => theme.palette.text.primary,
                    }}
                >
                    {address?.address_type}
                </Typography>
                <Typography
                    sx={{
                        fontSize: '14px',
                        lineHeight: 1.3,
                        color: (theme) => theme.palette.text.secondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {address?.address}
                </Typography>
            </Stack>

            <Radio
                checked={selected}
                size="small"
                tabIndex={-1}
                sx={{ p: '4px', flexShrink: 0 }}
            />
        </ButtonBase>
    )
}

const AddressDrawerList = ({
    addresses,
    isLoading,
    selectedId,
    onSelect,
    onAddAddress,
    token,
    onClose,
}) => {
    const { t } = useTranslation()

    if (isLoading) {
        return (
            <Stack sx={{ gap: '24px', p: { xs: '16px', sm: '24px' } }}>
                {[...Array(3)].map((_, index) => (
                    <Skeleton
                        key={index}
                        variant="rounded"
                        height={68}
                        sx={{ borderRadius: '12px' }}
                    />
                ))}
            </Stack>
        )
    }

    if (!addresses?.length) {
        return (
            <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                    gap: '16px',
                    height: '100%',
                    px: { xs: '24px', sm: '48px' },
                    py: '24px',
                    textAlign: 'center',
                }}
            >
                <CustomImageContainer
                    src={noAddressFound.src}
                    alt={t('No Saved Address Available')}
                    width="60px"
                    height="59px"
                    objectFit="contain"
                />
                <Stack sx={{ gap: '8px' }}>
                    <Typography
                        sx={{
                            fontSize: '18px',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: '-0.54px',
                            color: (theme) => theme.palette.text.primary,
                        }}
                    >
                        {t('No Saved Address Available')}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '16px',
                            lineHeight: 1.3,
                            color: (theme) => theme.palette.text.secondary,
                        }}
                    >
                        {token ? (
                            <>
                                {t('Set your address from')}{' '}
                                <Link
                                    component={NextLink}
                                    href="/info?page=profile"
                                    underline="always"
                                    onClick={onClose}
                                    sx={{
                                        fontWeight: 600,
                                        color: (theme) =>
                                            theme.palette.info.main,
                                    }}
                                >
                                    {t('My Address')}
                                </Link>{' '}
                                {t('page to switch between your places faster.')}
                            </>
                        ) : (
                            t('Set your delivery location to get started.')
                        )}
                    </Typography>
                </Stack>
            </Stack>
        )
    }

    return (
        <Stack
            alignItems="center"
            sx={{ gap: '24px', p: { xs: '16px', sm: '24px' } }}
        >
            {addresses.map((address) => (
                <AddressRow
                    key={address?.id}
                    address={address}
                    selected={String(address?.id) === String(selectedId)}
                    onSelect={onSelect}
                />
            ))}

            {token && (
                <ButtonBase
                    onClick={onAddAddress}
                    sx={{
                        gap: '8px',
                        height: '40px',
                        px: '20px',
                        borderRadius: '8px',
                        backgroundColor: (theme) => theme.palette.neutral[200],
                        '&:hover': { opacity: 0.85 },
                    }}
                >
                    <AddCircleOutlineIcon
                        sx={{
                            fontSize: 20,
                            color: (theme) => theme.palette.text.primary,
                        }}
                    />
                    <Typography
                        sx={{
                            fontSize: '16px',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: '-0.48px',
                            textTransform: 'capitalize',
                            color: (theme) => theme.palette.text.primary,
                        }}
                    >
                        {t('Add Address')}
                    </Typography>
                </ButtonBase>
            )}
        </Stack>
    )
}

export default AddressDrawerList
