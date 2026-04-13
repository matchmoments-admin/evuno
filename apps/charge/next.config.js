const withNextIntl = require('next-intl/plugin')('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@evuno/ui', '@evuno/shared'],
};

module.exports = withNextIntl(nextConfig);
