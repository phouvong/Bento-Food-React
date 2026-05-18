import {
    Grid,
    InputAdornment,
    Stack,
    TextField,
    Tooltip,
    Typography,
    IconButton,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DescriptionIcon from '@mui/icons-material/Description'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { t } from 'i18next'
import React, { useEffect, useState, useRef, useMemo } from 'react'
import { alpha, Box, display } from '@mui/system'
import { useTheme } from '@emotion/react'
import InputLabel from '@mui/material/InputLabel'
import dayjs from 'dayjs'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { PickersDay } from '@mui/x-date-pickers/PickersDay'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { CustomBoxFullWidth } from '@/components/chat/Chat.style'
import CustomDivider from '@/components/CustomDivider'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomModal from '@/components/custom-modal/CustomModal'
import toast from 'react-hot-toast'

const acceptedFileInputFormat = 'application/pdf,image/*,.doc,.docx'
const BusinessTin = ({
    RestaurantJoinFormik,
    selectedDates,
    setSelectedDates,
    imageOnchangeHandlerForTinImage,
    singleFileUploadHandlerForTinFile,
    file,
    setFile,
    preview,
    setPreview,
}) => {
    const theme = useTheme()
    const [open, setOpen] = useState(false)
    const fileInputRef = useRef(null)
    const handleFileChange = (e) => {
        const selected = e.target.files[0]
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/webp',
        ]

        if (selected) {
            if (!allowedTypes.includes(selected.type) && !selected.name.endsWith('.doc') && !selected.name.endsWith('.docx') && !selected.name.endsWith('.webp')) {
                toast.error(t('Only PDF, Word, and Image files are allowed'))
                return
            }


            if (selected.size < 1 * 1024 * 1024) {
                // Set state for UI feedback
                setFile(selected)

                // Call preview/image handler
                imageOnchangeHandlerForTinImage(selected)

                // Call upload handler
                singleFileUploadHandlerForTinFile(selected)

                // Show preview only if image
                if (selected.type.startsWith('image/')) {
                    const imageUrl = URL.createObjectURL(selected)
                    setPreview(imageUrl)
                } else {
                    setPreview(null)
                }
            } else {
                toast.error(t('File must be less than 1MB'))
            }
        }
    }

    const handleDateChange = (date) => {
        if (!date) return
        const dateString = date.format('YYYY-MM-DD')
        setSelectedDates([dateString]) // ✅ Set as a single-element array
        setOpen(false)
    }

    const pdfUrl = useMemo(() => {
        if (file && file.type === 'application/pdf') {
            return URL.createObjectURL(file)
        }
        return null
    }, [file])

    const handleOpen = () => {
        setOpen(!open)
    }

    const renderDay = (date, selectedDate, pickersDayProps) => {
        const isSelected = selectedDate === date.format('YYYY-MM-DD')

        return (
            <PickersDay
                {...pickersDayProps}
                selected={isSelected}
                sx={{
                    backgroundColor: isSelected ? '#1976d2' : 'transparent',
                    color: isSelected ? 'white' : 'inherit',
                    '&:hover': {
                        backgroundColor: isSelected
                            ? '#1565c0'
                            : 'rgba(25, 118, 210, 0.08)',
                    },
                }}
            />
        )
    }

    return (
        <>
            <CustomStackFullWidth>
                <Grid container spacing={3}>
                    <Grid item xs={12} lg={6}>
                        <CustomStackFullWidth
                            sx={{
                                backgroundColor: theme.palette.neutral[200],
                                borderRadius: '8px',
                                padding: '1rem',
                            }}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label={t(
                                            'Tax payer Identification Number(TIN)'
                                        )}
                                        placeholder={t('Type your tin number')}
                                        type="text"

                                        fullWidth
                                        name="tin"
                                        value={RestaurantJoinFormik.values.tin}
                                        onChange={
                                            RestaurantJoinFormik.handleChange
                                        }
                                        onBlur={RestaurantJoinFormik.handleBlur}

                                        error={
                                            RestaurantJoinFormik.touched.tin &&
                                            Boolean(
                                                RestaurantJoinFormik.errors.tin
                                            )
                                        }
                                        helperText={
                                            RestaurantJoinFormik.touched.tin &&
                                            RestaurantJoinFormik.errors.tin
                                        }
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                height: '45px',
                                                color: theme.palette
                                                    .neutral[1000],
                                                backgroundColor:
                                                    theme.palette.neutral[100],
                                            },
                                            '& .MuiInputBase-input': {
                                                color: theme.palette
                                                    .neutral[1000],
                                                fontSize: '12px',
                                                padding: '0 14px', // Adjust padding to center the text vertically
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: theme.palette
                                                    .neutral[1000],
                                                fontSize: '12px',
                                            },
                                            '& .MuiInputLabel-shrink': {
                                                fontSize: '16px', // 👈 font size when label is shrunk
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} mt="10px">
                                    <TextField
                                        size="medium"
                                        label={t('Expire Date')}
                                        placeholder={t('Expire Date')}
                                        fullWidth
                                        value={
                                            selectedDates
                                                ? selectedDates[0]
                                                : ''
                                        }
                                        onClick={handleOpen}
                                        readOnly
                                        error={
                                            RestaurantJoinFormik.touched
                                                .tin_expire_date &&
                                            Boolean(
                                                RestaurantJoinFormik.errors
                                                    .tin_expire_date
                                            )
                                        }
                                        helperText={
                                            RestaurantJoinFormik.touched
                                                .tin_expire_date &&
                                            RestaurantJoinFormik.errors
                                                .tin_expire_date
                                        }
                                        InputLabelProps={{
                                            shrink: true, // ✅ this fixes the label overlapping
                                        }}
                                        sx={{
                                            cursor: 'pointer',
                                            '& .MuiInputBase-root': {
                                                height: '45px',
                                                color: theme.palette
                                                    .neutral[1000],
                                                backgroundColor:
                                                    theme.palette.neutral[100],
                                            },
                                            '& .MuiInputBase-input': {
                                                fontSize: '12px',
                                                padding: '0 14px', // Adjust padding to center the text vertically
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: (theme) =>
                                                    theme.palette.neutral[1000],
                                                //  fontSize: '12px',
                                            },
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <CalendarTodayIcon
                                                        sx={{
                                                            color: (theme) =>
                                                                alpha(
                                                                    theme
                                                                        .palette
                                                                        .neutral[500],
                                                                    0.4
                                                                ),
                                                        }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    {open && (
                                        <CustomModal
                                            openModal={open}
                                            handleClose={() => setOpen(false)}
                                            setModalOpen={setOpen}
                                        >
                                            <Box
                                                sx={{
                                                    width: { xs: 'calc(100vw - 40px)', sm: '100%' },
                                                    maxWidth: { xs: 300, sm: 400 },
                                                    p: { xs: 0.5, sm: 2 },
                                                    overflowX: 'hidden',
                                                    overflowY: 'auto',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    m: '0 auto',
                                                }}
                                            >
                                                <LocalizationProvider
                                                    dateAdapter={AdapterDayjs}
                                                >
                                                    <DateCalendar
                                                        value={
                                                            selectedDates
                                                                ? dayjs(
                                                                    selectedDates
                                                                )
                                                                : null
                                                        }
                                                        onChange={handleDateChange}
                                                        minDate={dayjs()}
                                                        renderDay={(
                                                            date,
                                                            _value,
                                                            pickersDayProps
                                                        ) =>
                                                            renderDay(
                                                                date,
                                                                selectedDates,
                                                                pickersDayProps
                                                            )
                                                        }
                                                        sx={{
                                                            '& .MuiPickersCalendarHeader-root': {
                                                                fontSize: { xs: '12px', sm: '14px' },
                                                                color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'inherit',
                                                            },
                                                            '& .MuiPickersCalendarHeader-label': {
                                                                color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'inherit',
                                                            },
                                                            '& .MuiPickersArrowSwitcher-root': {
                                                                color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'inherit',
                                                            },
                                                            '& .MuiPickersDay-root': {
                                                                fontSize: { xs: '10px', sm: '12px' },
                                                                width: { xs: 28, sm: 36 },
                                                                height: { xs: 28, sm: 36 },
                                                                color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'inherit',
                                                            },
                                                            '& .MuiDayCalendar-weekContainer': {
                                                                gap: { xs: '2px', sm: '4px' },
                                                            },
                                                            '& .MuiDayCalendar-weekDayLabel': {
                                                                color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'inherit',
                                                            },
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                            </Box>
                                        </CustomModal>
                                    )}
                                </Grid>
                            </Grid>
                        </CustomStackFullWidth>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <Stack
                            sx={{
                                backgroundColor: theme.palette.neutral[200],
                                borderRadius: '8px',
                                padding: '1rem',
                            }}
                        >
                            {/* Label and Info */}
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                mb={2}
                            >
                                <InputLabel
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        color: (theme) =>
                                            theme.palette.neutral[1000],
                                    }}
                                >
                                    {t('TIN Certificate')}
                                </InputLabel>
                                <Typography
                                    fontSize="12px"
                                    sx={{
                                        color: (theme) =>
                                            theme.palette.neutral[400],
                                    }}
                                >
                                    {t('pdf, doc, image. File size : max 2 MB')}
                                </Typography>
                            </Stack>

                            <input
                                ref={fileInputRef}
                                id="file-input"
                                type="file"
                                hidden
                                accept=".pdf, .doc, .docx, .webp, image/*"
                                onChange={handleFileChange}
                            />
                            {file ? (
                                <Box
                                    sx={{
                                        maxWidth: '282px',
                                        width: '100%',
                                        position: 'relative',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        border: '1px solid #ccc',
                                    }}
                                >
                                    <IconButton
                                        onClick={() =>
                                            fileInputRef.current.click()
                                        }
                                        sx={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                            backgroundColor:
                                                theme.palette.info.dark,
                                            color: '#fff',
                                            padding: '5px',
                                            width: '26px',
                                            height: '26px',
                                            borderRadius: '.375rem',
                                            zIndex: 10,
                                            '&:hover': {
                                                backgroundColor:
                                                    theme.palette.info.main,
                                            },
                                        }}
                                    >
                                        <EditIcon sx={{ fontSize: '14px' }} />
                                    </IconButton>

                                    {preview ? (
                                        <Box
                                            onClick={() =>
                                                fileInputRef.current.click()
                                            }
                                            sx={{
                                                cursor: 'pointer',
                                                height: '92px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <img
                                                src={preview}
                                                alt="Uploaded preview"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </Box>
                                    ) : (
                                        <Box
                                            onClick={() =>
                                                window.open(
                                                    URL.createObjectURL(file),
                                                    '_blank'
                                                )
                                            }
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            {/* Top Part: Preview Placeholder */}
                                            <Stack
                                                alignItems="center"
                                                justifyContent="center"
                                                sx={{
                                                    height: '60px',
                                                    width: '100%',
                                                    backgroundColor:
                                                        theme.palette
                                                            .neutral[300],
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                }}
                                            >
                                                {file.type ===
                                                    'application/pdf' ? (
                                                    <>
                                                        <embed
                                                            src={pdfUrl}
                                                            type="application/pdf"
                                                            width="100%"
                                                            height="100%"
                                                            style={{
                                                                pointerEvents:
                                                                    'none',
                                                            }}
                                                        />
                                                        <Box
                                                            sx={{
                                                                position:
                                                                    'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                backgroundColor:
                                                                    'rgba(0, 0, 0, 0.1)',
                                                            }}
                                                        />
                                                    </>
                                                ) : (
                                                    <DescriptionIcon
                                                        sx={{
                                                            fontSize: '50px',
                                                            color: theme.palette
                                                                .neutral[500],
                                                        }}
                                                    />
                                                )}
                                            </Stack>

                                            {/* Bottom Part: File Info */}
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                spacing={1.5}
                                                sx={{
                                                    padding: '10px',
                                                    backgroundColor:
                                                        theme.palette
                                                            .neutral[100],
                                                    boxShadow:
                                                        '0 -3px 10px rgba(0, 0, 0, 0.1)',
                                                    borderRadius: '8px',
                                                }}
                                            >
                                                <DescriptionIcon
                                                    sx={{
                                                        fontSize: '24px',
                                                        color: theme.palette
                                                            .neutral[400],
                                                    }}
                                                />
                                                <Box
                                                    sx={{ overflow: 'hidden' }}
                                                >
                                                    <Typography
                                                        fontSize="13px"
                                                        fontWeight="600"
                                                        noWrap
                                                        title={file.name}
                                                    >
                                                        {file.name}
                                                    </Typography>
                                                    <Typography
                                                        fontSize="12px"
                                                        color="text.secondary"
                                                    >
                                                        {t(
                                                            'Click to view The file'
                                                        )}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Box
                                    component="label"
                                    htmlFor="file-input"
                                    sx={(theme) => {
                                        const isDark =
                                            theme.palette.mode === 'dark'
                                        return {
                                            height: '92px',
                                            maxWidth: '282px',
                                            aspectRatio: '3 / 1',
                                            border: `2px dashed ${
                                                isDark
                                                    ? 'rgba(255,255,255,0.2)'
                                                    : '#aaa'
                                            }`,
                                            padding: '20px',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            backgroundColor: isDark
                                                ? theme.palette.background.paper
                                                : theme.palette.neutral[100],
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: isDark
                                                    ? alpha(
                                                          theme.palette.primary
                                                              .main,
                                                          0.1
                                                      )
                                                    : '#f0f0f0',
                                                borderColor:
                                                    theme.palette.primary.main,
                                            },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'row',
                                            gap: '10px',
                                        }
                                    }}
                                >
                                    <CloudUploadIcon
                                        sx={{
                                            fontSize: '30px',
                                            color: theme.palette.neutral[400],
                                        }}
                                    />
                                    <Typography
                                        fontSize="12px"
                                        color="text.secondary"
                                    >
                                        {t('Select a file')}{' '}

                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </CustomStackFullWidth>
        </>
    )
}

export default BusinessTin
