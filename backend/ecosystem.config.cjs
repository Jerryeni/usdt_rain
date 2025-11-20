// PM2 Ecosystem Configuration for USDT Rain Backend
// This file tells PM2 how to run the ES Module backend

module.exports = {
  apps: [{
    name: 'usdtrain-backend',
    script: './src/server.js',
    instances: 1,
    exec_mode: 'fork',
    node_args: '--experimental-modules',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    exp_backoff_restart_delay: 100
  }]
};
