import React, { useEffect, useState } from "react";
import { Checkbox } from "@mui/material";

const MultiCheckBox = ({ changeChoices, option, index, choiceIndex, choice, radioData,itemIsLoading,productUpdate }) => {
    const [check,setCheck]=useState(false)
    const [isDisable,setIsDisabled]=useState(false)

    useEffect(() => {
        if(itemIsLoading){
            setCheck(false)
        }
    }, [itemIsLoading]);

    useEffect(() => {
        if(option?.isSelected){
            setCheck(true)
        }
    }, [option]);


    useEffect(() => {
        // Directly determine disabled state based on conditions
        const shouldBeDisabled = (productUpdate && option?.isSelected) ? !check : true;
        setIsDisabled(option.current_stock === 0 && shouldBeDisabled && option?.stock_type!=="unlimited");
    }, [productUpdate, option, check]);

    const changeHandler=( e,
                 option,
                 optionIndex,
                 choiceIndex,
                 isRequired,
                 choiceType,
                 checked)=>{
        setCheck(e.target.checked)
        changeChoices(
            e,
            option,
            optionIndex,
            choiceIndex,
            isRequired,
            choiceType,
            checked
        )
    }
    return (
        <Checkbox
            disabled={isDisable}
            sx={{
                '&:hover': {
                    backgroundColor: 'transparent',

                },}}

            defaultChecked={option?.isSelected}
            checked={check}
            onChange={(e) =>
                changeHandler(e,
                    option,
                    index,
                    choiceIndex,
                    choice?.required,
                    choice?.type,
                    radioData?.isChecked)

            }
            id={`radio-${choiceIndex}-${index}`}
        />
    );
};

export default MultiCheckBox;
