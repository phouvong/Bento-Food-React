import { WrapperForCustomDialogConfirm } from '../custom-dialog/confirm/CustomDialogConfirm.style'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import Typography from '@mui/material/Typography'
import { t } from 'i18next'
import DialogContent from '@mui/material/DialogContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import RadioGroup from '@mui/material/RadioGroup'
import FormControl from '@mui/material/FormControl'
import Radio from '@mui/material/Radio'
import DialogActions from '@mui/material/DialogActions'
import { Button, Stack, TextField } from '@mui/material'
import { RTL } from '../RTL/RTL'
import CloseIcon from '@mui/icons-material/Close'
import RefundSvg from '../order-history/RefundSvg'
import { useTheme } from '@mui/styles'

const CancelOrder = ({
    cancelReason,
    orderLoading,
    setCancelReason,
    cancelReasonsData,
    setModalOpen,
    handleOnSuccess,
    setNote,
}) => {
    const theme = useTheme()

    const handleChange = (event) => {
        setCancelReason(event.target.value)
    }

    const handleNoteChange = (event) => {
        setNote(event.target.value)
    }

    const onClose = () => {
        setModalOpen(false)
    }

    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }

    return (
        <WrapperForCustomDialogConfirm sx={{ position: 'relative' }}>
            <button className="closebtn" onClick={onClose}>
                <CloseIcon sx={{ fontSize: '16px' }} />
            </button>

            <CustomStackFullWidth spacing={1}>
                <Stack alignItems="center" justifyContent="center">
                    <RefundSvg />
                    <Typography
                        fontSize="16px"
                        fontWeight="700"
                        paddingTop="24px"
                    >
                        {t('Want to cancel the order ?')}
                    </Typography>
                    <Typography
                        fontSize="14px"
                        fontWeight="400"
                        color={theme.palette.neutral[500]}
                        paddingTop="8px"
                    >
                        {t('Please select a reason to cancel')}
                    </Typography>
                </Stack>

                <DialogContent sx={{ padding: '15px 14px' }}>
                    <CustomStackFullWidth justifyContent="center" spacing={2}>
                        <FormControl>
                            <RadioGroup
                                aria-label="cancel-reason"
                                name="cancel-reason"
                                value={cancelReason}
                                onChange={handleChange}
                                component="fieldset"
                            >
                                {cancelReasonsData?.reasons?.map((reason) => (
                                    <FormControlLabel
                                        key={reason?.id}
                                        value={reason.reason}
                                        control={<Radio />}
                                        label={reason.reason}
                                        sx={{
                                            color: (theme) =>
                                                theme.palette.neutral[500],
                                            border: '1px solid',
                                            borderColor: (theme) =>
                                                theme.palette.neutral[300],
                                            mb: '10px',
                                            borderRadius: '10px',
                                            width: '100%',
                                            ml: 0,
                                        }}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>

                        {/* ✅ Added TextArea for custom note */}
                        <TextField
                            label={t('Additional Note')}
                            placeholder={t('Write your note here...')}
                            multiline
                            minRows={3}
                            fullWidth
                            variant="outlined"
                            onChange={handleNoteChange}
                        />
                    </CustomStackFullWidth>
                </DialogContent>

                <DialogActions
                    sx={{
                        padding: '0px 10px 10px 10px',
                        marginTop: '0px !important',
                    }}
                >
                    <RTL direction={languageDirection}>
                        <Stack
                            direction="row"
                            alignItems="flex-end"
                            justifyContent="flex-end"
                            width="100%"
                        >
                            <Button
                                loading={orderLoading}
                                onClick={handleOnSuccess}
                                variant="contained"
                                sx={{ fontWeight: '400' }}
                            >
                                {t('Submit')}
                            </Button>
                        </Stack>
                    </RTL>
                </DialogActions>
            </CustomStackFullWidth>
        </WrapperForCustomDialogConfirm>
    )
}

export default CancelOrder
