'use strict';

const Feed = require('./base');
const InvalidFeedError = require('../errors/invalid-feed');

/**
 * @type {string}
 */
const RSS_VERSION_0_9 = '0.9';

/**
 * @type {string}
 */
const RSS_VERSION_1_0 = '1.0';

/**
 * @type {string}
 */
const RSS_VERSION_2_0 = '2.0';

/**
 * @type {Array<string>}
 */
const SUPPORTED_RSS_VERSIONS = [
	RSS_VERSION_0_9,
	RSS_VERSION_1_0,
	RSS_VERSION_2_0
];

/**
 * Class representing an RSS feed.
 */
class RssFeed extends Feed {

	/**
	 * @type {import('../xml/element')}
	 */
	#root;

	/**
	 * @type {import('../xml/element')}
	 */
	#channel;

	/**
	 * Class constructor.
	 *
	 * @param {import('../xml/document')} document
	 *     The XML document to extract data from.
	 * @throws {InvalidFeedError}
	 *     Throws an invalid feed error if an unrecoverable issue is found with the RSS feed.
	 */
	constructor(document) {
		super(document);

		const root = (
			this.document.findElementWithName('rss') ||
			this.document.findElementWithName('rdf')
		);
		if (!root) {
			throw new InvalidFeedError('The RSS feed does not have a root element');
		}
		this.#root = root;

		const channel = this.#root.findElementWithName('channel');
		if (!channel) {
			throw new InvalidFeedError('The RSS feed does not have a channel element');
		}
		this.#channel = channel;
	}

	/**
	 * Get the version of RSS the feed uses. Exposed publicly in the `meta` property.
	 *
	 * @override
	 * @type {string | null}
	 */
	get #version() {
		const version = this.#root.getAttribute('version');
		const namespace = this.#root.getAttribute('xmlns');

		if (version && SUPPORTED_RSS_VERSIONS.includes(version)) {
			return version;
		}
		if (version && version.startsWith(RSS_VERSION_0_9)) {
			return RSS_VERSION_0_9;
		}
		if (
			namespace === 'http://channel.netscape.com/rdf/simple/0.9/' ||
			namespace === 'http://my.netscape.com/rdf/simple/0.9/'
		) {
			return RSS_VERSION_0_9;
		}
		if (namespace === 'http://purl.org/rss/1.0/') {
			return RSS_VERSION_1_0;
		}

		return null;
	}

	/**
	 * Get meta information about the feed.
	 *
	 * @override
	 * @type {Feed.FeedMeta}
	 */
	get meta() {
		return {
			type: this.#root.name,
			version: this.#version
		};
	}

	/**
	 * Get the feed language.
	 *
	 * @override
	 * @type {string | null}
	 */
	get language() {
		return (
			this.#channel.findElementWithName('language')?.textContentNormalized ||
			this.#root.getAttribute('xml:lang') ||
			this.#root.getAttribute('lang') ||
			null
		);
	}

	/**
	 * Get the feed title.
	 *
	 * @override
	 * @type {string | null}
	 */
	get title() {
		return this.#channel.findElementWithName('title')?.textContentNormalized || null;
	}

	/**
	 * Get the feed description.
	 *
	 * @override
	 * @type {string | null}
	 */
	get description() {
		return (
			this.#channel.findElementWithName('description')?.textContentNormalized ||
			this.#channel.findElementWithName('subtitle')?.textContentNormalized ||
			null
		);
	}

	/**
	 * Get the feed copyright information.
	 *
	 * @override
	 * @type {string | null}
	 */
	get copyright() {
		return (
			this.#channel.findElementWithName('copyright')?.textContentNormalized ||
			this.#channel.findElementWithName('rights')?.textContentNormalized ||
			null
		);
	}

	/**
	 * Get the feed URL.
	 *
	 * @override
	 * @type {string | null}
	 */
	get link() {
		const links = this.#channel.findElementsWithName('link');
		if (!links?.length) {
			return null;
		}
		return (
			links.find(link => link.textContentNormalized)?.textContentAsUrl ||
			null
		);
	}

	/**
	 * Get the feed's link to itself.
	 *
	 * @override
	 * @type {string | null}
	 */
	get self() {
		// TODO should we only allow elements with a namespace that resolves to the Atom URLs?
		const links = this.#channel.findElementsWithName('link');
		if (!links?.length) {
			return null;
		}
		return (
			links.find(link => link.getAttribute('rel') === 'self')?.getAttributeAsUrl('href') ||
			null
		);
	}

	/**
	 * Get the date that the feed was published.
	 *
	 * @override
	 * @type {Date | null}
	 */
	get published() {
		return (
			this.#channel.findElementWithName('pubdate')?.textContentAsDate ||
			null
		);
	}

	/**
	 * Get the date that the feed was last updated.
	 *
	 * @override
	 * @type {Date | null}
	 */
	get updated() {
		return (
			this.#channel.findElementWithName('lastbuilddate')?.textContentAsDate ||
			this.#channel.findElementWithName('date')?.textContentAsDate ||
			null
		);
	}

	/**
	 * Get information about the software that generated the feed.
	 *
	 * @override
	 * @type {Feed.FeedGenerator | null}
	 */
	get generator() {
		const label = this.#channel.findElementWithName('generator')?.textContentNormalized;
		if (label) {
			return {
				label,
				version: null,
				link: null
			};
		}
		return null;
	}

}

module.exports = RssFeed;
