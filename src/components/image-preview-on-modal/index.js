import React, { useRef } from "react";
import CloseIcon from '@mui/icons-material/Close'
import CustomImageContainer from '../CustomImageContainer'
import { CustomStackFullWidth } from "@/styled-components/CustomStyles.style"
import { useTheme } from "@mui/styles";
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { LeftArrowStyle, RightArrowStyle } from "@/components/home/HomeStyle";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import IconButton from "@mui/material/IconButton";
export const HandlePrevImagePrv = ({ onClick, className }) => (
    <>
        <LeftArrowStyle
            // languageDirection={languageDirection}
            left="-15%"
            isdisabled={className?.includes('slick-disabled')}
        >
            <IconButton sx={{border:"1px solid",borderColor:theme=>theme.palette.neutral[100],padding:"10px"}} onClick={onClick}>
                <ArrowBackIosNewIcon style={{width:"14px",height:"14px",color:"#ffff"}} fontWeight="700" />
            </IconButton>
        </LeftArrowStyle>
    </>
)

export const HandleNextImagePrv = ({ onClick, className }) => (
    <RightArrowStyle
        right="-15%"
        // languageDirection={languageDirection}
        isdisabled={className?.includes('slick-disabled')}
    >

        <IconButton  sx={{border:"1px solid",borderColor:theme=>theme.palette.neutral[100],padding:"10px"}} onClick={onClick}>
            <ArrowForwardIosIcon style={{width:"14px",height:"14px",color:"#ffff"}} />
        </IconButton>
    </RightArrowStyle>
)

const ImagePreviewOnModal = (props) => {
    const sliderRef=useRef(null)
    const theme=useTheme()
    const { modalImage, handleModalClose,AllImages } = props
    const settings = {
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 0,
        nextArrow:  <HandleNextImagePrv  />,
        prevArrow:  <HandlePrevImagePrv />,

    }
    const imagesToShow = [modalImage, ...AllImages.filter(image => image !== modalImage)];
    return (
        <CustomStackFullWidth
            sx={{
                position: 'relative',
                width: { xs: '270px', sm: '400px' },
                // backgroundColor:theme.palette.neutral[100],
                borderRadius:"10px",
                padding:"10px",
                maxHeight:"400px",
            }}
            alignItems="flex-end"
            //spacing={1}
        >
            <button
                onClick={() => handleModalClose(false)}
                className="closebtn"
                style={{
                    position: 'absolute',
                    top:"-4%",
                    right:"-4%",
                    height:"22px",
                    width:"22px",
                    display:"inline-flex",
                    justifyContent:"center",
                    alignItems:"center",
                    cursor:"pointer",
                }}
            >
                <CloseIcon sx={{ fontSize: '16px' }} />
            </button>
            <Slider {...settings} ref={sliderRef} className="slick__slider">
                {imagesToShow?.map((image,index)=>{
                    return(
                        <CustomImageContainer  src={image} width="100%" height="400px" smHeight="250px" mdHeight='350px'   objectFit="cover" />
                    )
                })}
            </Slider>

        </CustomStackFullWidth>
    )
}

ImagePreviewOnModal.propTypes = {}

export default ImagePreviewOnModal
