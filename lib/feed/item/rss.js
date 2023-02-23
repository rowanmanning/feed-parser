'use strict';

const FeedItem = require('./base');

/**
 * Class representing a single content item in an RSS feed.
 */
module.exports = class RssFeedItem extends FeedItem {

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item title.
	 */
	get title() {
		return this.element.findElementWithName('title')?.textContentNormalized || null;
	}

};
