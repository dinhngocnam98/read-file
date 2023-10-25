module.exports = {
  apps: [
    {
      name: 'read-file-app',
      script: 'dist/main.js',
      instances: 'auto',
      watch: true,
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: 'mongodb://localhost:27017/read-file?replicaSet=rs0',
        PORT: 3000,
      },
    },
  ],
};
