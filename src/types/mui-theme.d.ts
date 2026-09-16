import '@mui/material/styles'

// The theme files (src/theme/*-theme-options.js) add palettes that MUI's Palette
// type doesn't know about. Keys are indexed loosely (Record) rather than as
// literal unions because the JS theme files are untyped and light/dark themes
// don't declare identical key sets.
declare module '@mui/material/styles' {
    interface Palette {
        neutral: Record<string | number, string>
        customColor: Record<string, string>
        // Promotion banner tones: happyHourBanner {bg, timerBg, timerColon,
        // timerColonWarm}, referBanner {bg, title, subtitle}, whiteContainer
        // {main, light, dark}.
        happyHourBanner: Record<string, string>
        referBanner: Record<string, string>
        whiteContainer: Record<string, string>
    }
    interface PaletteOptions {
        neutral?: Record<string | number, string>
        customColor?: Record<string, string>
        happyHourBanner?: Record<string, string>
        referBanner?: Record<string, string>
        whiteContainer?: Record<string, string>
    }
}
