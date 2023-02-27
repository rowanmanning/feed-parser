/* eslint-disable jsdoc/require-returns-check */
/* eslint-disable jsdoc/require-property-description */
'use strict';

/**
 * @typedef {object} FeedItemJson
 * @property {string | null} id
 * @property {string | null} title
 * @property {string | null} description
 * @property {string | null} url
 * @property {string | null} published
 * @property {string | null} updated
 * @property {string | null} content
 * @property {import('../base').FeedImage | null} image
 */

/**
 * Class representing a single content item in a feed.
 */
module.exports = class FeedItem {

	/**
	 * @type {import('../base')}
	 */
	#feed;

	/**
	 * @type {import('../../xml/element')}
	 */
	#element;

	/**
	 * Class constructor.
	 *
	 * @param {import('../base')} feed
	 *     The feed the item belongs to.
	 * @param {import('../../xml/element')} element
	 *     The XML element to extract data from.
	 */
	constructor(feed, element) {
		this.#feed = feed;
		this.#element = element;
	}

	/**
	 * @protected
	 * @returns {import('../base')}
	 *     Returns the feed the item belongs to.
	 */
	get feed() {
		return this.#feed;
	}

	/**
	 * @protected
	 * @returns {import('../../xml/element')}
	 *     Returns the XML element which represents the feed item.
	 */
	get element() {
		return this.#element;
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed item unique identifier.
	 */
	get id() {
		throw new Error('FeedItem.id must be implemented in an extending class');
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed item title.
	 */
	get title() {
		throw new Error('FeedItem.title must be implemented in an extending class');
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed item description.
	 */
	get description() {
		throw new Error('FeedItem.description must be implemented in an extending class');
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed item URL.
	 */
	get url() {
		throw new Error('FeedItem.url must be implemented in an extending class');
	}

	/**
	 * @returns {Date | null}
	 *     Returns the date that the feed item was published on.
	 */
	get published() {
		throw new Error('FeedItem.published must be implemented in an extending class');
	}

	/**
	 * @returns {Date | null}
	 *     Returns the date that the feed item was last updated on.
	 */
	get updated() {
		throw new Error('FeedItem.updated must be implemented in an extending class');
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed item content.
	 */
	get content() {
		throw new Error('FeedItem.content must be implemented in an extending class');
	}

	/**
	 * @returns {import('../base').FeedImage | null}
	 *     Returns an image representing the feed item.
	 */
	get image() {
		throw new Error('FeedItem.image must be implemented in an extending class');
	}

	/**
	 * Get a JSON representation of the feed item.
	 *
	 * @returns {FeedItemJson}
	 *     Returns a JSON representation of the feed item.
	 */
	toJSON() {
		return {
			id: this.id,
			title: this.title,
			description: this.description,
			url: this.url,
			published: this.published ? this.published.toISOString() : null,
			updated: this.updated ? this.updated.toISOString() : null,
			content: this.content,
			image: this.image
		};
	}

};
