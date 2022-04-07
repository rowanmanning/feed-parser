'use strict';

const DataProvider = require('./base');
const InvalidFeedError = require('../errors/invalid-feed');

/**
 * Class representing an RSS feed data provider.
 */
class RssDataProvider extends DataProvider {

	/**
	 * Class constructor.
	 *
	 * @access public
	 * @param {import('../../xml/document')} document
	 *     The XML document to extract data from.
	 * @throws {InvalidFeedError}
	 *     Throws an invalid feed error if an unrecoverable issue is found with the RSS feed.
	 */
	constructor(document) {
		super(document);

		this.root = document.findElementWithName('rss') || document.findElementWithName('rdf');
		if (!this.root) {
			throw new InvalidFeedError('The RSS feed does not have a root element');
		}

		this.channel = this.root.findElementWithName('channel');
		if (!this.channel) {
			throw new InvalidFeedError('The RSS feed does not have a channel element');
		}
	}

	/**
	 * @access private
	 * @type {String}
	 */
	get version() {
		const version = this.root.getAttribute('version');
		const namespace = this.root.getAttribute('xmlns');

		if (version && RssDataProvider.ALLOWED_VERSIONS.includes(version)) {
			return version;
		}
		if (version && version.startsWith(RssDataProvider.VERSION_0_9)) {
			return RssDataProvider.VERSION_0_9;
		}
		if (
			namespace === 'http://channel.netscape.com/rdf/simple/0.9/' ||
			namespace === 'http://my.netscape.com/rdf/simple/0.9/'
		) {
			return RssDataProvider.VERSION_0_9;
		}
		if (namespace === 'http://purl.org/rss/1.0/') {
			return RssDataProvider.VERSION_1_0;
		}

		return null;
	}

	/**
	 * @type {DataProvider.FeedMeta}
	 */
	get meta() {
		return {
			type: this.root.name,
			version: this.version
		};
	}

	/**
	 * @type {(String|null)}
	 */
	get language() {
		return (
			this.channel?.findElementWithName('language')?.normalizedTextContent ||
			this.root?.getAttribute('xml:lang') ||
			this.root?.getAttribute('lang') ||
			null
		);
	}

	/**
	 * @type {(String|null)}
	 */
	get title() {
		return this.channel?.findElementWithName('title')?.normalizedTextContent || null;
	}

	/**
	 * @type {(String|null)}
	 */
	get description() {
		return (
			this.channel?.findElementWithName('description')?.normalizedTextContent ||
			this.channel?.findElementWithName('subtitle')?.normalizedTextContent ||
			null
		);
	}

}

/**
 * @type {String}
 */
RssDataProvider.VERSION_0_9 = '0.9';

/**
 * @type {RegExp}
 */
RssDataProvider.VERSION_MATCHER_0_9 = /^0.9\d$/;

/**
 * @type {String}
 */
RssDataProvider.VERSION_1_0 = '1.0';

/**
 * @type {String}
 */
RssDataProvider.VERSION_2_0 = '2.0';

/**
 * @type {Array<String>}
 */
RssDataProvider.ALLOWED_VERSIONS = [
	RssDataProvider.VERSION_0_9,
	RssDataProvider.VERSION_1_0,
	RssDataProvider.VERSION_2_0
];

module.exports = RssDataProvider;
