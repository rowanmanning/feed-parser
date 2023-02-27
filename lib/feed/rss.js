'use strict';

const Feed = require('./base');
const InvalidFeedError = require('../errors/invalid-feed');
const RssFeedItem = require('./item/rss');

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
	 * @type {Array<import('./item/rss')> | null}
	 */
	#itemCache = null;

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
	 * @override
	 * @returns {string | null}
	 *     Returns the version of RSS the feed uses. Exposed publicly in the `meta` property.
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
	 * @override
	 * @returns {Feed.FeedMeta}
	 *     Returns meta information about the feed.
	 */
	get meta() {
		return {
			type: this.#root.name,
			version: this.#version
		};
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed language.
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
	 * @override
	 * @returns {string | null}
	 *     Returns the feed title.
	 */
	get title() {
		return this.#channel.findElementWithName('title')?.textContentNormalized || null;
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed description.
	 */
	get description() {
		return (
			this.#channel.findElementWithName('description')?.textContentNormalized ||
			this.#channel.findElementWithName('subtitle')?.textContentNormalized ||
			null
		);
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed copyright information.
	 */
	get copyright() {
		return (
			this.#channel.findElementWithName('copyright')?.textContentNormalized ||
			this.#channel.findElementWithName('rights')?.textContentNormalized ||
			null
		);
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed URL.
	 */
	get url() {
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
	 * @override
	 * @returns {string | null}
	 *     Returns the feed's link to itself.
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
	 * @override
	 * @returns {Date | null}
	 *     Returns the date that the feed was published on.
	 */
	get published() {
		return (
			this.#channel.findElementWithName('pubdate')?.textContentAsDate ||
			null
		);
	}

	/**
	 * @override
	 * @returns {Date | null}
	 *     Returns the date that the feed was last updated on.
	 */
	get updated() {
		return (
			this.#channel.findElementWithName('lastbuilddate')?.textContentAsDate ||
			this.#channel.findElementWithName('date')?.textContentAsDate ||
			null
		);
	}

	/**
	 * @override
	 * @returns {Feed.FeedGenerator | null}
	 *     Returns information about the software that generated the feed.
	 */
	get generator() {
		const label = this.#channel.findElementWithName('generator')?.textContentNormalized;
		if (label) {
			return {
				label,
				version: null,
				url: null
			};
		}
		return null;
	}

	/**
	 * @override
	 * @returns {Feed.FeedImage | null}
	 *     Returns an image representing the feed.
	 */
	get image() {
		const images = this.#channel.findElementsWithName('image');
		const image = images.find(img => img.namespace !== 'itunes');
		const itunesImage = images.find(img => img.namespace === 'itunes');

		if (!image && !itunesImage) {
			return null;
		}

		let title = null;
		let url = null;

		// Try a regular image first
		if (image) {
			title = image.findElementWithName('title')?.textContentNormalized || null;
			url = image.findElementWithName('url')?.textContentAsUrl || null;
		}

		// If that fails, check for an itunes image
		if (!url && itunesImage) {
			url = itunesImage.getAttributeAsUrl('href');
		}

		if (url) {
			return {
				title,
				url
			};
		}
		return null;
	}

	/**
	 * @override
	 * @returns {Array<import('./item/rss')>}
	 *     Returns all content items in the feed.
	 */
	get items() {
		if (this.#itemCache) {
			return this.#itemCache;
		}
		const items = [
			...this.#channel.findElementsWithName('item'),
			...this.#root.findElementsWithName('item')
		].flatMap(itemElement => {
			return new RssFeedItem(this, itemElement);
		});
		this.#itemCache = items;
		return items;
	}

}

module.exports = RssFeed;
