import usFlag from '../../../../../public/static/country-flag/us.svg'
import arFlag from '../../../../../public/static/country-flag/arabic-flag-svg.svg'
import banFlag from '../../../../../public/static/country-flag/bangladesh (1).png'
import spanFlag from '../../../../../public/static/country-flag/spain.png'
export const languageLists = [
    {
        languageName: 'Arabic (عربي)',
        languageCode: 'ar',
        countryCode: 'SA',
        countryFlag: arFlag.src,
    },
    {
        languageName: 'English (English)',
        languageCode: 'en',
        countryCode: 'US',
        countryFlag: usFlag.src,
    },
    {
        languageName: 'Spanish (español)',
        languageCode: 'es',
        countryCode: 'es',
        countryFlag: spanFlag.src,
    },
    {
        languageName: 'Bangla (বাংলা)',
        languageCode: 'bn',
        countryCode: 'BN',
        countryFlag: banFlag.src,
    },
]
