module.exports = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '**', // allows all https domains
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**', // allows all https domains
                pathname: '/**',
            },
        ],
    },
};
