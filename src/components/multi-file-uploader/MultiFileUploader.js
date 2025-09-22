import React, { useEffect, useRef, useState } from 'react'
import FilePreviewer from '../file-previewer/FilePreviewer'
import FileInputField from '../form-fields/FileInputField'
import { Grid, Stack } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { setBusinessInfoImageReset } from '../../redux/slices/multiStepForm'
import { CustomTypographyForMultiImagePreviewer } from './MultiFileUploader.style'
import { useTranslation } from 'react-i18next'

const MultiFileUploader = (props) => {
    const { t } = useTranslation()
    const {
        width,
        height,
        required,
        fileImagesHandler,
        maxFileSize,
        supportedFileFormats,
        acceptedFileInput,
        labelText,
        titleText,
        hintText,
        totalFiles,
        gridControl,
        fullWidth,
        delivery,
    } = props
    const [files, setFiles] = useState(totalFiles ? totalFiles : [])
    const [error, setError] = useState(false)
    const [errorAlert, setErrorAlert] = useState('')

    const fileInputRef = useRef()
    const dispatch = useDispatch()
    useEffect(() => {
        fileImagesHandler(files)
        // dispatch(setBusinessInfoImageReset(false))
    }, [files])

    const FileSelectedHandler = (e) => {
        let file = e.target.files[e.target.files.length - 1]
        let fileExtension = file.name.split('.').pop()
        if (supportedFileFormats.indexOf(fileExtension) !== -1) {
            if (file.size <= maxFileSize) {
                setError(false)
                setFiles([...files, ...e.target.files])
            } else {
                setError(true)
                setErrorAlert(t('Chose an image max size 2mb'))
            }
        } else {
            setError(true)
            setErrorAlert(t('Unsupported file format chosen'))
        }
    }
    const DeleteImageFromFiles = (id) => {
        let remainingFiles = files.filter((item, index) => index !== id)
        setFiles(remainingFiles)
    }
    const replaceFilesByIndex = (indexNumber) => {}
    return (
        <Stack width="100%" spacing={4}>
            {files.length > 0 ? (
                <>
                    <FilePreviewer
                        delivery={delivery}
                        anchor={fileInputRef}
                        errorStatus={error}
                        titleText={titleText}
                        acceptedFileInput={acceptedFileInput}
                        file={files}
                        height={height}
                        onChange={FileSelectedHandler}
                        onDelete={DeleteImageFromFiles}
                        supportedFileFormats={supportedFileFormats}
                        replaceFiles={replaceFilesByIndex}
                        gridControl={gridControl}
                        fullWidth={fullWidth}
                    />
                </>
            ) : (
                <Grid container>
                    {/* md={fullWidth ? 12 : 4} */}
                    <Grid item xs={12} sm={4}>
                        <FileInputField
                            delivery={delivery}
                            titleText={titleText}
                            labelText={labelText}
                            hintText={hintText}
                            errorStatus={error}
                            acceptedFileInput={acceptedFileInput}
                            width={width}
                            height={height}
                            onChange={FileSelectedHandler}
                            text="Upload identity file"
                            maxFileSize={200000}
                            required={required}
                        />
                    </Grid>
                </Grid>
            )}
            {error && (
                <CustomTypographyForMultiImagePreviewer>
                    {errorAlert}
                </CustomTypographyForMultiImagePreviewer>
            )}
        </Stack>
    )
}

export default MultiFileUploader
