import { Box, IconButton, Stack, Typography } from '@mui/material'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'

// coverageLabel: preformatted "ZIP Code: 5747" / "Area: Gulshan" line shown
// under the address when the zone's area/zip delivery rule is active.
const AddressSelectionField = ({ theme, address, t, onEdit, coverageLabel }) => {
    return (
        <Stack
            direction="row"
            alignItems="center"
            sx={{
                width: '100%',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'background.paper',
                boxShadow:
                    '0px 1px 2px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.05)',
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: (theme) => theme.palette.neutral[200],
                }}
            >
                <LocationOnOutlinedIcon
                    sx={{ fontSize: 18, color: 'text.primary' }}
                />
            </Box>
            <Stack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
                <Typography
                    sx={{
                        fontSize: '16px',
                        fontWeight: 500,
                        lineHeight: 1.1,
                        letterSpacing: '-0.48px',
                        color: 'text.primary',
                        textTransform: 'capitalize',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {t(address?.address_type) || t('Current Location')}
                </Typography>
                <Typography
                    sx={{
                        fontSize: '14px',
                        lineHeight: 1.2,
                        letterSpacing: '-0.42px',
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {address?.address}
                </Typography>
                {coverageLabel && (
                    <Typography
                        sx={{
                            fontSize: '13px',
                            fontWeight: 600,
                            lineHeight: 1.2,
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {coverageLabel}
                    </Typography>
                )}
            </Stack>
            <IconButton
                onClick={onEdit}
                sx={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '8px', color: 'text.info' }}
            >
                <i
                    className="fi fi-rr-pencil"
                    style={{ fontSize: '16px', lineHeight: 1, color: 'inherit' }}
                />
            </IconButton>
        </Stack>
    )
}

AddressSelectionField.propTypes = {}

export default AddressSelectionField
