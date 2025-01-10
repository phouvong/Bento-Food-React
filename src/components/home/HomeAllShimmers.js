import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomShimmerCategories from '../CustomShimmer/CustomShimmerCategories'
import CustomShimmerForCampaigns from '../CustomShimmer/CustomShimmerForCampaigns'

const HomeAllShimmers = (props) => {
    return (
        <CustomStackFullWidth>
            <CustomShimmerCategories
                noSearchShimmer="true"
                itemCount="10"
                smItemCount="5"
            />
            <CustomShimmerForCampaigns />
        </CustomStackFullWidth>
    )
}

HomeAllShimmers.propTypes = {}

export default HomeAllShimmers
