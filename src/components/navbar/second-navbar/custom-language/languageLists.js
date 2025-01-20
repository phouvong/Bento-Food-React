import usFlag from '../../../../../public/static/country-flag/en.png'
import loFlag from '../../../../../public/static/country-flag/lo.png'
import arFlag from '../../../../../public/static/country-flag/arabic-flag-svg.svg'
import banFlag from '../../../../../public/static/country-flag/bangladesh (1).png'
import spanFlag from '../../../../../public/static/country-flag/spain.png'
export const languageLists = [
    {
        languageName: 'Arabic',
        languageCode: 'ar',
        countryCode: 'SA',
        countryFlag: arFlag.src,
    },
    {
        languageName: 'English',
        languageCode: 'en',
        countryCode: 'US',
        countryFlag: usFlag.src,
    },
    {
            languageName: 'ພາສາລາວ',
            languageCode: 'lo',
            countryCode: 'LA',
            countryFlag: loFlag.src,
        },
    {
        languageName: 'Spanish',
        languageCode: 'es',
        countryCode: 'es',
        countryFlag: spanFlag.src,
    },
    //{
    //    languageName: 'Bengali',
    //    languageCode: 'bn',
    //    countryCode: 'BN',
    //   countryFlag: banFlag.src,
    //},
]
