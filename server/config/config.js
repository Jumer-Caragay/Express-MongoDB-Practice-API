let env = process.env.NODE_ENV || 'development';

if(env === 'development' || env ==='test') {
  let config = require('./config.json');
  let envConfig = config[env]; // grab the property from json based on the environment

  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key] // ex process.env[name] = property inside json
  });
};

// if(env === 'development') {
//   process.env.PORT = 3000;
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
// } else if (env === 'test') {
//   process.env.PORT = 3000;
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
// }