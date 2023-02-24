'use strict';

const FeedItem = require('./base');

/**
 * Class representing a single content item in an RSS feed.
 */
module.exports = class RssFeedItem extends FeedItem {

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item unique identifier.
	 */
	get id() {
		return this.element.findElementWithName('guid')?.textContentNormalized || null;
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item title.
	 */
	get title() {
		return this.element.findElementWithName('title')?.textContentNormalized || null;
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item description.
	 */
	get description() {
		return this.element.findElementWithName('description')?.textContentNormalized || null;
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item URL.
	 */
	get url() {
		const links = this.element.findElementsWithName('link');
		if (!links?.length) {
			return null;
		}
		return (
			links.find(link => link.textContentNormalized)?.textContentAsUrl ||
			null
		);
	}

	/**
	 * @override
	 * @returns {Date | null}
	 *     Returns the date that the feed item was published on.
	 */
	get published() {
		return (
			this.element.findElementWithName('pubdate')?.textContentAsDate ||
			this.element.findElementWithName('date')?.textContentAsDate ||
			null
		);
	}

	/**
	 * @override
	 * @returns {Date | null}
	 *     Returns the date that the feed item was last updated on.
	 */
	get updated() {
		return (
			this.element.findElementWithName('date')?.textContentAsDate ||
			null
		);
	}

};
