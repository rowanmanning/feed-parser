'use strict';

module.exports = (global.fetch ? global.fetch : require('undici').fetch);
