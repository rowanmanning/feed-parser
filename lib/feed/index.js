'use strict';

const {Document} = require('../xml');
const {AtomDataProvider, RssDataProvider} = require('./data-providers');
const InvalidFeedError = require('./errors/invalid-feed');

/**
 * Class representing a feed.
 */
class Feed {

	/**
	 * Class constructor.
	 *
	 * @access public
	 * @param {import('./data-providers/base')} dataProvider
	 *     The data provider containing the XML document and how to process it.
	 */
	constructor(dataProvider) {
		this.dataProvider = dataProvider;
	}

	/**
	 * Get a JSON representation of the feed.
	 *
	 * @access public
	 * @type {Object}
	 */
	toJSON() {
		return this.dataProvider.toJSON();
	}

	/**
	 * Create a Feed from an XML string.
	 *
	 * @access public
	 * @param {String} xmlString
	 *     A string of XML.
	 * @returns {Feed}
	 *     Returns a feed representation of the XML string.
	 * @throws {InvalidFeedError}
	 *     Throws an invalid feed error if an unrecoverable issue is found with the feed.
	 */
	static fromString(xmlString) {
		const xml = Document.fromString(xmlString);

		// Decide on a data provider based on whether a root element is present
		for (const [rootElement, Provider] of Object.entries(Feed.DATA_PROVIDER_BY_ROOT_ELEMENT)) {
			if (xml.hasElementWithName(rootElement)) {
				return new this(new Provider(xml));
			}
		}

		// No root feed element was found
		throw new InvalidFeedError();
	}

}

/**
 * @type {Object<String, Function}}
 */
Feed.DATA_PROVIDER_BY_ROOT_ELEMENT = {
	feed: AtomDataProvider,
	rss: RssDataProvider
};

module.exports = {
	AtomDataProvider,
	Feed,
	RssDataProvider
};
