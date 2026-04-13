// PM2 process manager configuration for production
module.exports = {
  apps: [
    {
      name: 'evuno-charge',
      cwd: './apps/charge',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'evuno-navigate',
      cwd: './apps/navigate',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'evuno-scout',
      cwd: './apps/scout',
      script: 'node_modules/.bin/next',
      args: 'start -p 3002',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'evuno-api',
      cwd: './packages/api',
      script: 'dist/main.js',
      env: { NODE_ENV: 'production', API_PORT: '4000' },
    },
  ],
};
