/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@halalspot/shared-types', '@halalspot/supabase'],
    images: {
        domains: ['your-supabase-project.supabase.co'],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
};

module.exports = nextConfig;
