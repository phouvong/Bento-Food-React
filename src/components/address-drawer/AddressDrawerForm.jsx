import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
    ButtonBase,
    IconButton,
    InputBase,
    Stack,
    Typography,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined'
import { useTranslation } from 'react-i18next'
import { ADDRESS_TYPES } from './addressDrawerConstants'

const fieldWrapperSx = {
    height: { xs: '38px', sm: '44px' },
    px: { xs: '10px', sm: '12px' },
    borderRadius: '8px',
    backgroundColor: (theme) => theme.palette.background.paper,
    border: (theme) => `1px solid ${theme.palette.divider}`,
}

const LabeledField = ({ label, required, error, children }) => (
    <Stack sx={{ gap: { xs: '4px', sm: '6px' }, flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap="2px">
            <Typography
                sx={{
                    fontSize: { xs: '13px', sm: '16px' },
                    lineHeight: 1.1,
                    letterSpacing: '-0.48px',
                    textTransform: 'capitalize',
                    color: (theme) => theme.palette.text.primary,
                }}
            >
                {label}
            </Typography>
            {required && (
                <Typography
                    sx={{
                        fontSize: { xs: '13px', sm: '16px' },
                        fontWeight: 700,
                        lineHeight: 1.1,
                        color: (theme) => theme.palette.error.main,
                    }}
                >
                    *
                </Typography>
            )}
        </Stack>
        {children}
        {error && (
            <Typography
                sx={{
                    fontSize: { xs: '10px', sm: '12px' },
                    color: (theme) => theme.palette.error.main,
                }}
            >
                {error}
            </Typography>
        )}
    </Stack>
)

const AddressDrawerForm = ({
    formId,
    initialValues,
    onSubmit,
    onEditLocation,
}) => {
    const { t } = useTranslation()

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            address: Yup.string().required(t('Address is required')),
            contact_person_name: Yup.string().required(t('Name is required')),
        }),
        onSubmit,
    })

    return (
        <Stack
            component="form"
            id={formId}
            onSubmit={formik.handleSubmit}
            sx={{
                gap: { xs: '14px', sm: '24px' },
                p: { xs: '12px', sm: '24px' },
            }}
        >
            <Stack sx={{ gap: { xs: '4px', sm: '6px' } }}>
                <Typography
                    sx={{
                        fontSize: { xs: '13px', sm: '18px' },
                        lineHeight: 1.2,
                        letterSpacing: '-0.54px',
                        color: (theme) => theme.palette.text.primary,
                    }}
                >
                    {t('Save Address as a')}
                </Typography>

                <Stack
                    direction="row"
                    gap={{ xs: '4px', sm: '8px' }}
                    sx={{
                        height: { xs: '36px', sm: '44px' },
                        p: '1px',
                        borderRadius: '8px',
                        backgroundColor: (theme) =>
                            theme.palette.background.paper,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                >
                    {ADDRESS_TYPES.map(({ value, label, iconClass }) => {
                        const active = formik.values.address_type === value
                        return (
                            <ButtonBase
                                key={value}
                                onClick={() =>
                                    formik.setFieldValue('address_type', value)
                                }
                                sx={{
                                    flex: 1,
                                    minWidth: '36px',
                                    gap: { xs: '4px', sm: '6px' },
                                    borderRadius: '6px',
                                    backgroundColor: (theme) =>
                                        active
                                            ? theme.palette.primary.main
                                            : 'transparent',
                                    color: (theme) =>
                                        active
                                            ? theme.palette.primary.contrastText
                                            : theme.palette.text.secondary,
                                }}
                            >
                                <i
                                    className={iconClass}
                                    style={{
                                        fontSize: 14,
                                        lineHeight: 1,
                                        display: 'flex',
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: { xs: '12px', sm: '16px' },
                                        fontWeight: active ? 700 : 500,
                                        lineHeight: 1.1,
                                        letterSpacing: '-0.48px',
                                        textTransform: 'capitalize',
                                        color: 'inherit',
                                    }}
                                >
                                    {t(label)}
                                </Typography>
                            </ButtonBase>
                        )
                    })}
                </Stack>
            </Stack>

            <Stack
                sx={{
                    gap: { xs: '14px', sm: '24px' },
                    p: { xs: '12px', sm: '20px' },
                    borderRadius: { xs: '10px', sm: '16px' },
                    backgroundColor: (theme) => theme.palette.neutral[200],
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    gap={{ xs: '6px', sm: '8px' }}
                    sx={fieldWrapperSx}
                >
                    <FmdGoodOutlinedIcon
                        sx={{
                            fontSize: { xs: 14, sm: 16 },
                            flexShrink: 0,
                            color: (theme) => theme.palette.text.secondary,
                        }}
                    />
                    <Typography
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: { xs: '13px', sm: '16px' },
                            lineHeight: 1.3,
                            color: (theme) => theme.palette.text.primary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {formik.values.address}
                    </Typography>
                    <IconButton
                        onClick={() => onEditLocation(formik.values)}
                        aria-label={t('Pick a location')}
                        sx={{ p: 0, flexShrink: 0 }}
                    >
                        <EditOutlinedIcon
                            sx={{
                                fontSize: { xs: 14, sm: 16 },
                                color: (theme) => theme.palette.info.main,
                            }}
                        />
                    </IconButton>
                </Stack>

                <LabeledField
                    label={t('Contact Person Name')}
                    required
                    error={
                        formik.touched.contact_person_name &&
                        formik.errors.contact_person_name
                    }
                >
                    <InputBase
                        name="contact_person_name"
                        value={formik.values.contact_person_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder={t('Contact Person Name')}
                        sx={{ ...fieldWrapperSx, fontSize: { xs: '13px', sm: '16px' } }}
                    />
                </LabeledField>

                <LabeledField label={t('Street Number')}>
                    <InputBase
                        name="road"
                        value={formik.values.road}
                        onChange={formik.handleChange}
                        placeholder={t('Street Number')}
                        sx={{ ...fieldWrapperSx, fontSize: { xs: '13px', sm: '16px' } }}
                    />
                </LabeledField>

                <Stack
                    direction="row"
                    gap={{ xs: '10px', sm: '20px' }}
                    flexWrap="wrap"
                >
                    <LabeledField label={t('House No')}>
                        <InputBase
                            name="house"
                            value={formik.values.house}
                            onChange={formik.handleChange}
                            placeholder={t('House No')}
                            sx={{ ...fieldWrapperSx, fontSize: { xs: '13px', sm: '16px' } }}
                        />
                    </LabeledField>
                    <LabeledField label={t('Floor')}>
                        <InputBase
                            name="floor"
                            value={formik.values.floor}
                            onChange={formik.handleChange}
                            placeholder={t('Floor')}
                            sx={{ ...fieldWrapperSx, fontSize: { xs: '13px', sm: '16px' } }}
                        />
                    </LabeledField>
                </Stack>
            </Stack>
        </Stack>
    )
}

export default AddressDrawerForm
