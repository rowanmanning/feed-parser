'use strict';

/**
 * Class representing an invalid feed error.
 */
class InvalidFeedError extends Error {

	/**
	 * Class constructor.
	 *
	 * @access public
	 * @param {string} [message]
	 *     The error message.
	 */
	constructor(message = 'The XML document could not be parsed as a feed') {
		super(message);
		this.code = 'INVALID_FEED';
	}

}

module.exports = InvalidFeedError;
