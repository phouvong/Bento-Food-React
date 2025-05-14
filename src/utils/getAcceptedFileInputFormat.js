export const getAcceptedFileInputFormat = (configData) => {
    let formatsForMultiple = [] // Formats for multiple files
    let formatsForSingle = [] // Formats for single file

    // Loop through each item in the configData array
    configData?.forEach((field) => {
        // Check if the field type is "file" and it contains "media_data"
        if (field.field_type === 'file' && field.media_data) {
            const { image, pdf, docs, upload_multiple_files } = field.media_data

            // Handle multiple file upload scenario (upload_multiple_files === 1)
            if (upload_multiple_files === 1) {
                // Accept image files if "image" is 1
                if (image === 1) {
                    formatsForMultiple.push('image/*')
                }
                // Accept pdf files if "pdf" is 1
                if (pdf === 1) {
                    formatsForMultiple.push('application/pdf')
                }
                // Accept doc files if "docs" is 1
                if (docs === 1) {
                    formatsForMultiple.push('.doc', '.docx', 'text/plain')
                }
            }
            // Handle single file upload scenario (upload_multiple_files === 0)
            else if (upload_multiple_files === 0) {
                // For single file upload, we only allow one file type based on the config
                if (image === 1) {
                    formatsForSingle.push('image/*')
                }
                if (pdf === 1) {
                    formatsForSingle.push('application/pdf')
                }
                if (docs === 1) {
                    formatsForSingle.push('.doc', '.docx', 'text/plain')
                }
            }
        }
    })

    // Return the formats as an object, with separate formats for multiple and single file uploads
    return {
        formatsForMultiple: formatsForMultiple.join(','), // Join multiple formats with commas
        formatsForSingle: formatsForSingle.join(','), // Join single formats with commas
    }
}
