require('dotenv').config();

const baseConfig = require('./wdio.base.conf');

module.exports = {
  ...baseConfig,
  /*
   * Add Sauce Labs integration to WebdriverIO
   * https://webdriver.io/docs/sauce-service.html
   * https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-sauce-service
   */
  services: [...(baseConfig.services || []), 'sauce'],
  /*
   * Sauce Labs credentials
   * Can be set in environement variables or in a `.env` file in
   * the directory from which `wdio` was called
   */
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  /*
   * Sauce Connect Proxy
   * Open tunnel between Sauce Labs and the machine running our static server
   * https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy
   */
  sauceConnect: true,
  /*
   * Sauce Labs Open Source offer has a maximum of 5 concurrent session
   */
  maxInstances: 5,

  /*
   * Retry spec files 2 times maximum on fail
   * This is usefull is case of a flacky test
   * https://webdriver.io/docs/options.html#specfileretries
   */
  specFileRetries: 2,

  /*
   * Platforms where we want to run our tests
   * https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
   */
  capabilities: [
    {
      browserName: 'chrome',
      browserVersion: '76.0',
      /*
       * Sauce Labs specific options
       * https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options
       */
      'sauce:options': {
        screenResolution: '1680x1050',
        extendedDebugging: true,
        capturePerformance: true,
      },
    },
    {
      browserName: 'firefox',
      browserVersion: '68.0',
      /*
       * Sauce Labs specific options
       * https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options
       */
      'sauce:options': {
        screenResolution: '1680x1050',
        // Force Selenium version on Firefox, solves an issue with `setValue`
        // https://github.com/webdriverio/webdriverio/issues/3443
        seleniumVersion: '3.11.0',
      },
    },
  ],
};
