import CustomLogo from '../../CustomLogo'

const LogoSide = ({ width, businessLogo, objectFit ,height}) => {
    return (
        <CustomLogo
            atlText="logo"
            logoImg={businessLogo}
            height={height}
            width={width}
            objectFit={objectFit}
        />
    )
}

LogoSide.propTypes = {}

export default LogoSide
