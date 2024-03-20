require('dotenv').config();
const cli = require('next/dist/cli/next-dev');

cli.nextDev({
  '--port': process.env.PORT || 3122,
  _: [],
});