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
	 * @public
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
	 * @private
	 * @type {(string | null)}
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
	 * @type {(string | null)}
	 */
	get language() {
		return (
			this.channel?.findElementWithName('language')?.textContentNormalized ||
			this.root?.getAttribute('xml:lang') ||
			this.root?.getAttribute('lang') ||
			null
		);
	}

	/**
	 * @type {(string | null)}
	 */
	get title() {
		return this.channel?.findElementWithName('title')?.textContentNormalized || null;
	}

	/**
	 * @type {(string | null)}
	 */
	get description() {
		return (
			this.channel?.findElementWithName('description')?.textContentNormalized ||
			this.channel?.findElementWithName('subtitle')?.textContentNormalized ||
			null
		);
	}

	/**
	 * @type {(string | null)}
	 */
	get copyright() {
		return (
			this.channel?.findElementWithName('copyright')?.textContentNormalized ||
			this.channel?.findElementWithName('rights')?.textContentNormalized ||
			null
		);
	}

	/**
	 * @type {(string | null)}
	 */
	get link() {
		const links = this.channel?.findElementsWithName('link');
		if (!links?.length) {
			return null;
		}
		return (
			links.find(link => link.textContentNormalized)?.textContentAsUrl ||
			null
		);
	}

	/**
	 * @type {(string | null)}
	 */
	get self() {
		// TODO should we only allow elements with a namespace that resolves to the Atom URLs?
		const links = this.channel?.findElementsWithName('link');
		if (!links?.length) {
			return null;
		}
		return (
			links.find(link => link.getAttribute('rel') === 'self')?.getAttributeAsUrl('href') ||
			null
		);
	}

	/**
	 * @type {(Date|null)}
	 */
	get published() {
		return (
			this.channel?.findElementWithName('pubdate')?.textContentAsDate ||
			null
		);
	}

	/**
	 * @type {(Date|null)}
	 */
	get updated() {
		return (
			this.channel?.findElementWithName('lastbuilddate')?.textContentAsDate ||
			this.channel?.findElementWithName('date')?.textContentAsDate ||
			null
		);
	}

}

/**
 * @type {string}
 */
RssDataProvider.VERSION_0_9 = '0.9';

/**
 * @type {RegExp}
 */
RssDataProvider.VERSION_MATCHER_0_9 = /^0.9\d$/;

/**
 * @type {string}
 */
RssDataProvider.VERSION_1_0 = '1.0';

/**
 * @type {string}
 */
RssDataProvider.VERSION_2_0 = '2.0';

/**
 * @type {Array<string>}
 */
RssDataProvider.ALLOWED_VERSIONS = [
	RssDataProvider.VERSION_0_9,
	RssDataProvider.VERSION_1_0,
	RssDataProvider.VERSION_2_0
];

module.exports = RssDataProvider;
