module.exports = {
  apps : [{
    script: 'bin/www',
    watch: '.'
  }, {
    script: './service-worker/',
    watch: ['./service-worker']
  }],

  deploy : {
    production : {
      user : 'ubuntu',
      host : '152.228.217.119',
      ref  : 'origin/main',
      repo : 'https://github.com/stardevcgroup/guineaMarketAPI.git',
      path : '/var/www/',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    }
  }
};
