'use strict';

/**
 * Class representing a feed data provider.
 */
class DataProvider {

	/**
	 * Class constructor.
	 *
	 * @access public
	 * @param {import('../../xml/document')} document
	 *     The XML document to extract data from.
	 */
	constructor(document) {
		this.document = document;
	}

	/**
	 * Get meta information about the feed.
	 *
	 * @access public
	 * @type {FeedMeta}
	 */
	get meta() {
		throw new Error('DataProvider.meta must be implemented in an extending class');
	}

	/**
	 * Get the feed language.
	 *
	 * @access public
	 * @type {(String|null)}
	 */
	get language() {
		throw new Error('DataProvider.language must be implemented in an extending class');
	}

	/**
	 * Get the feed title.
	 *
	 * @access public
	 * @type {(String|null)}
	 */
	get title() {
		throw new Error('DataProvider.title must be implemented in an extending class');
	}

	/**
	 * Get the feed description.
	 *
	 * @access public
	 * @type {(String|null)}
	 */
	get description() {
		throw new Error('DataProvider.description must be implemented in an extending class');
	}

	/**
	 * Get the feed URL.
	 *
	 * @access public
	 * @type {(String|null)}
	 */
	get link() {
		throw new Error('DataProvider.link must be implemented in an extending class');
	}

	/**
	 * Get the feed's link to itself.
	 *
	 * @access public
	 * @type {(String|null)}
	 */
	get self() {
		throw new Error('DataProvider.self must be implemented in an extending class');
	}

	/**
	 * Get a JSON representation of the data in the provider.
	 *
	 * @access public
	 * @type {Object}
	 */
	toJSON() {
		return {
			meta: this.meta,
			language: this.language,
			title: this.title,
			description: this.description,
			link: this.link,
			self: this.self
		};
	}

}

module.exports = DataProvider;

/**
 * @typedef {Object} FeedMeta
 * @property {String} name
 * @property {(String|null)} version
 */
