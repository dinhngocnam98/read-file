module.exports = {
  apps: [
    {
      name: 'read-file-app',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: true,
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: 'mongodb+srv://hakinam2701:884743Nam@read-file.kujuw9p.mongodb.net/read-file',
        PORT: 3000,
      },
    },
  ],
};
