"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import placeholder from "../../public/static/notimage.png";

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#e5e4e4" offset="20%" />
      <stop stop-color="#ddd" offset="50%" />
      <stop stop-color="#e5e4e4" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#e5e4e4" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str) =>
    typeof window === "undefined"
        ? Buffer.from(str).toString("base64")
        : window.btoa(str);

const CustomImage = ({
    src,
    altSrc = placeholder,
    alt = "Image",
    width,
    height,
    naturalWidth = undefined,
    naturalHeight = undefined,
    errorWidth = undefined,
    errorHeight = undefined,
    objectFit = "cover",
    borderRadius,
    aspectRatio,
    ...props
}) => {
    const shimmerWidth = naturalWidth ?? width;
    const shimmerHeight = naturalHeight ?? height;
    const [currentSrc, setCurrentSrc] = useState(src || altSrc);
    const [isError, setIsError] = useState(!src);

    useEffect(() => {
        setCurrentSrc(src || altSrc);
        setIsError(!src);
    }, [src, altSrc]);

    const handleError = () => {
        if (altSrc && currentSrc !== altSrc) {
            setCurrentSrc(altSrc);
            setIsError(true);
        }
    };

    const { style: propStyle, ...restProps } = props;

    const style = {
        objectFit: isError ? "contain" : objectFit,
        borderRadius,
        aspectRatio,
        ...propStyle,
        ...(isError && {
            width: "auto",
            height: "auto",
        }),
    };

    const renderedWidth = isError ? errorWidth ?? width : width;
    const renderedHeight = isError ? errorHeight ?? height : height;

    return (
        <Image
            src={currentSrc}
            width={renderedWidth}
            height={renderedHeight}
            alt={alt}
            onError={handleError}
            placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(shimmerWidth, shimmerHeight))}`}
            {...restProps}
            style={style}
        />
    );
};

export default CustomImage;
