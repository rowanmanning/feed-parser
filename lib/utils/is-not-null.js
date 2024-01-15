'use strict';

/**
 * @param {any | null} value
 *     The value to check.
 * @returns {value is any}
 *     Returns whether the value is not null.
 */
module.exports = function isNotNull(value) {
	return value !== null;
};
