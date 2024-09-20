'use strict';

const { AtomFeed } = require('./lib/feed/atom');
const { Document } = require('./lib/xml/document');
const { InvalidFeedError } = require('./lib/errors/invalid-feed');
const { RssFeed } = require('./lib/feed/rss');

/**
 * @type {{[key: string]: typeof import('./lib/feed/base').Feed}}}
 */
const DATA_PROVIDER_BY_ROOT_ELEMENT = {
	feed: AtomFeed,
	rdf: RssFeed,
	rss: RssFeed
};

/**
 * Create a Feed from an XML string.
 *
 * @param {string} xmlString
 *     A string of XML.
 * @returns {import('./lib/feed/base').Feed}
 *     Returns a feed representation of the XML string.
 * @throws {InvalidFeedError}
 *     Throws an invalid feed error if an unrecoverable issue is found with the feed.
 */
function parseFeed(xmlString) {
	const xml = Document.fromString(xmlString);

	// Decide on a data provider based on whether a root element is present
	for (const [rootElement, Provider] of Object.entries(DATA_PROVIDER_BY_ROOT_ELEMENT)) {
		if (xml.hasElementWithName(rootElement)) {
			return new Provider(xml);
		}
	}

	// No root feed element was found
	throw new InvalidFeedError();
}

exports.parseFeed = parseFeed;
