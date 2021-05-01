module.exports = {
  apps : [{
    script: 'bin/www',
    watch: '.',
    env_production : {
      NODE_ENV : "production"
  }
  }, {
    script: './service-worker/',
    watch: ['./service-worker']
  }],

  deploy : {
    production : {
      user : 'ubuntu',
      host : ['152.228.217.119'],
      ref  : 'origin/main',
      repo : 'git@github.com:stardevcgroup/guineaMarketAPI.git',
      path : '/var/www/',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      "ssh_options": "StrictHostKeyChecking=no"
    }
  }
};
