/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/dashboard',
                permanent: true, // Set to false if the redirect is temporary
            },
        ];
    },
    sassOptions: {
        quietDeps: true, // Suppresses warnings from dependencies
        api: 'modern-compiler',
    },
    typescript: {
        ignoreBuildErrors: true, // Ignore TS errors during build for JS compatibility
    },
    eslint: {
        ignoreDuringBuilds: true, // Ignore ESLint errors during build
    }
};

export default nextConfig;