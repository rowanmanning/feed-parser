'use strict';

const { Feed } = require('./base');
const { InvalidFeedError } = require('../errors/invalid-feed');
const { isNotNull } = require('../utils/is-not-null');
const { parseContactString } = require('../utils/parse-contact-string');
const { RssFeedItem } = require('./item/rss');

/**
 * @import { FeedAuthor, FeedCategory, FeedGenerator, FeedImage, FeedMeta } from './base'
 */

const httpRegExp = /^https?:\/\//i;

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
const SUPPORTED_RSS_VERSIONS = [RSS_VERSION_0_9, RSS_VERSION_1_0, RSS_VERSION_2_0];

/**
 * Class representing an RSS feed.
 */
class RssFeed extends Feed {
	/**
	 * @type {import('../xml/element').Element}
	 */
	#root;

	/**
	 * @type {import('../xml/element').Element}
	 */
	#channel;

	/**
	 * @type {Array<import('./item/rss').RssFeedItem> | null}
	 */
	#itemCache = null;

	/**
	 * Class constructor.
	 *
	 * @param {import('../xml/document').Document} document
	 *     The XML document to extract data from.
	 * @throws {InvalidFeedError}
	 *     Throws an invalid feed error if an unrecoverable issue is found with the RSS feed.
	 */
	constructor(document) {
		super(document);

		const root =
			this.document.findElementWithName('rss') || this.document.findElementWithName('rdf');
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
	 * @returns {import('../xml/element').Element}
	 *     Returns the XML element which represents the feed.
	 */
	get element() {
		return this.#channel;
	}

	/**
	 * @returns {string | null}
	 *     Returns the version of RSS the feed uses. Exposed publicly in the `meta` property.
	 */
	get #version() {
		const version = this.#root.getAttribute('version');
		const namespace = this.#root.getAttribute('xmlns');

		if (version && SUPPORTED_RSS_VERSIONS.includes(version)) {
			return version;
		}
		if (version?.startsWith(RSS_VERSION_0_9)) {
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
	 * @returns {FeedMeta}
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
			this.element.findElementWithName('language')?.textContentNormalized ||
			this.#root.getAttribute('xml:lang') ||
			this.#root.getAttribute('lang') ||
			super.language
		);
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed description.
	 */
	get description() {
		return (
			this.element.findElementWithName('description')?.textContentNormalized ||
			this.element.findElementWithName('subtitle')?.textContentNormalized ||
			super.description
		);
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed copyright information.
	 */
	get copyright() {
		return (
			this.element.findElementWithName('copyright')?.textContentNormalized ||
			this.element.findElementWithName('rights')?.textContentNormalized ||
			super.copyright
		);
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed URL.
	 */
	get url() {
		const links = this.element.findElementsWithName('link');
		if (!links?.length) {
			return super.url;
		}
		return links.find((link) => link.textContentNormalized)?.textContentAsUrl || super.url;
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed's link to itself.
	 */
	get self() {
		// Note: we don't namespace this because many feeds have some
		// weird namespacing going on
		const links = this.element.findElementsWithName('link');
		if (!links?.length) {
			return super.self;
		}
		return (
			links.find((link) => link.getAttribute('rel') === 'self')?.getAttributeAsUrl('href') ||
			super.self
		);
	}

	/**
	 * @override
	 * @returns {Date | null}
	 *     Returns the date that the feed was published on.
	 */
	get published() {
		return this.element.findElementWithName('pubdate')?.textContentAsDate || super.published;
	}

	/**
	 * @override
	 * @returns {Date | null}
	 *     Returns the date that the feed was last updated on.
	 */
	get updated() {
		return (
			this.element.findElementWithName('lastbuilddate')?.textContentAsDate ||
			this.element.findElementWithName('date')?.textContentAsDate ||
			super.updated
		);
	}

	/**
	 * @override
	 * @returns {FeedGenerator | null}
	 *     Returns information about the software that generated the feed.
	 */
	get generator() {
		const label = this.element.findElementWithName('generator')?.textContentNormalized;
		if (label) {
			return {
				label,
				version: null,
				url: null
			};
		}
		return super.generator;
	}

	/**
	 * @override
	 * @returns {FeedImage | null}
	 *     Returns an image representing the feed.
	 */
	get image() {
		const images = this.element.findElementsWithName('image');
		const image = images.find((img) => img.namespace !== 'itunes');
		const itunesImage = images.find((img) => img.namespace === 'itunes');

		if (!image && !itunesImage) {
			return super.image;
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
		return super.image;
	}

	/**
	 * @override
	 * @returns {Array<FeedAuthor>}
	 *     Returns the authors of the feed.
	 */
	get authors() {
		// NOTE: we explicitly ignore the webmaster property here:
		// the webmaster is not an author
		return [
			...this.element.findElementsWithName('managingeditor'),
			...this.element.findElementsWithName('author'),
			...this.element.findElementsWithName('creator')
		]
			.map((author) => {
				return parseContactString(author.textContentNormalized);
			})
			.filter(isNotNull);
	}

	/**
	 * @override
	 * @returns {Array<FeedCategory>}
	 *     Returns the categories the feed belongs to.
	 */
	get categories() {
		const categoryElements = this.element.findElementsWithName('category');
		const categories = categoryElements
			.filter((category) => !RssFeed.#isItunesElement(category))
			.map((category) => {
				const term = category.textContentNormalized;
				const domain = category.getAttribute('domain') || '';
				const url = httpRegExp.test(domain) ? category.getAttributeAsUrl('domain') : null;

				if (!term) {
					return null;
				}

				return {
					label: term,
					term,
					url
				};
			});
		const itunesCategories = categoryElements
			.filter((category) => RssFeed.#isItunesElement(category))
			.flatMap((category) => {
				const url = null;
				const level1Category = category.getAttribute('text');
				if (!level1Category) {
					return null;
				}

				const childCategories = category
					.findElementsWithName('category')
					.filter((child) => RssFeed.#isItunesElement(child))
					.map((childCategory) => {
						const level2Category = childCategory.getAttribute('text');
						if (!level2Category) {
							return null;
						}
						return {
							label: `${level1Category}/${level2Category}`,
							term: `${level1Category}/${level2Category}`,
							url
						};
					})
					.filter(isNotNull);
				if (childCategories.length) {
					return childCategories;
				}

				return {
					label: level1Category,
					term: level1Category,
					url
				};
			});
		const subjects = this.element.findElementsWithName('subject').map((subject) => {
			const term = subject.textContentNormalized;
			return term ? { term, label: term, url: null } : null;
		});
		return [...categories, ...itunesCategories, ...subjects].filter(isNotNull);
	}

	/**
	 * @override
	 * @returns {Array<import('./item/rss').RssFeedItem>}
	 *     Returns all content items in the feed.
	 */
	get items() {
		if (this.#itemCache) {
			return this.#itemCache;
		}
		const items = [
			...this.element.findElementsWithName('item'),
			...this.#root.findElementsWithName('item')
		].flatMap((itemElement) => {
			return new RssFeedItem(this, itemElement);
		});
		this.#itemCache = items;
		return items;
	}

	/**
	 * Check whether an element is an iTunes element.
	 *
	 * @param {import('../xml/element').Element} element
	 * @returns {boolean}
	 */
	static #isItunesElement(element) {
		return (
			element.namespaceUri === 'http://www.itunes.com/dtds/podcast-1.0.dtd' ||
			element.namespace === 'itunes'
		);
	}
}

exports.RssFeed = RssFeed;
