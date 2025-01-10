import CustomLogo from '../../CustomLogo'

const LogoSide = ({ width, businessLogo }) => {
    return (
        <CustomLogo
            atlText="logo"
            logoImg={businessLogo}
            height="1.5rem"
            width={width}
        />
    )
}

LogoSide.propTypes = {}

export default LogoSide
