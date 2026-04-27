import React from 'react'
import PopularFoodOnlyComponent from './PopularFoodOnlyComponent'
import ProductSearchPageDefault from './ProductSearchPageDefault'

const ProductSearchPage = (props) => {
    if (props?.page === 'popular') {
        return <PopularFoodOnlyComponent configData={props?.configData} />
    }
    if (props?.page === 'most-reviewed') {
        return (
            <PopularFoodOnlyComponent
                configData={props?.configData}
                title="Best Reviewed Foods"
                productType="most-reviewed"
            />
        )
    }

    return <ProductSearchPageDefault {...props} />
}

export default ProductSearchPage
