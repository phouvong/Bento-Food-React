import { Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { CustomRating } from './CustomRating.style'

const CustomRatings = ({
    handleChangeRatings,
    ratingValue,
    readOnly,
    color,
    fontSize,
}) => {
    const [value, setValue] = useState(ratingValue ? ratingValue : 0)
    useEffect(() => {
        setValue(ratingValue)
    }, [ratingValue])
    const handleChange = (event, newValue) => {
        if (!readOnly) {
            setValue(newValue)
            handleChangeRatings(newValue)
        }
    }

    return (
        <Stack direction="row" alignItems="center" justifyContent="flex-start">
            <CustomRating
                color={color}
                precision={0.5}
                readOnly={readOnly}
                name="simple-controlled"
                value={value}
                onChange={(event, newValue) => handleChange(event, newValue)}
                fontSize={fontSize}
            />
            {/*{readOnly && (*/}
            {/*    <CustomColouredTypography color={color} smallFont="12px">*/}
            {/*        ({ratingValue})*/}
            {/*    </CustomColouredTypography>*/}
            {/*)}*/}
        </Stack>
    )
}

CustomRatings.propTypes = {}

export default CustomRatings
