import React from 'react'
import { useTheme } from '@mui/styles'

const DollarSignHighlighter = ({ text }) => {
    const theme = useTheme()

    // Regular expression to find text between $ signs
    const regex = /\$(.*?)\$/g
    const parts = []
    let lastIndex = 0

    // Use regex to match all dollar sign sections
    text.replace(regex, (match, content, offset) => {
        // Push the text before the $...$
        parts.push({ text: text.slice(lastIndex, offset), highlight: false })
        // Push the text inside the $...$
        parts.push({ text: content, highlight: true })
        // Update lastIndex to the end of the match
        lastIndex = offset + match.length
    })

    // Push the remaining text after the last match
    if (lastIndex < text.length) {
        parts.push({ text: text.slice(lastIndex), highlight: false })
    }

    return (
        <>
            {parts.map((part, index) => (
                <span
                    key={index}
                    style={{
                        color: part.highlight
                            ? theme.palette.primary.main // Color for highlighted parts
                            : 'inherit', // Default color for normal text
                        marginLeft: index !== 0 ? '3px' : '0px',
                    }}
                >
                    {part.text}
                </span>
            ))}
        </>
    )
}

export default DollarSignHighlighter
