//This is a file for PM2 usage
// code was taken here: https://stackoverflow.com/questions/78170699/trying-to-load-env-file-into-to-pm2-config-getting-error
const { env } = require('process');

module.exports = {
  apps: [
    {
      cwd: '.',
      script: './dist/main.js',
      watch: '.',
      name: 'discordBot',
      node_args: '-r dotenv/config',
      args: 'dotenv_config_path=./.env',
    },
  ],
};
