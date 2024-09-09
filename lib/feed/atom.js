'use strict';

const { AtomFeedItem } = require('./item/atom');
const { Feed } = require('./base');
const { InvalidFeedError } = require('../errors/invalid-feed');
const { isNotNull } = require('../utils/is-not-null');
const { parseContactString } = require('../utils/parse-contact-string');

/**
 * @import { FeedAuthor, FeedCategory, FeedGenerator, FeedImage, FeedMeta } from './base'
 */

/**
 * @type {string}
 */
const ATOM_VERSION_0_3 = '0.3';

/**
 * @type {string}
 */
const ATOM_VERSION_1_0 = '1.0';

/**
 * @type {Array<string>}
 */
const SUPPORTED_ATOM_VERSIONS = [ATOM_VERSION_0_3, ATOM_VERSION_1_0];

/**
 * Class representing an Atom feed.
 */
class AtomFeed extends Feed {
	/**
	 * @type {import('../xml/element').Element}
	 */
	#root;

	/**
	 * @type {Array<import('./item/atom').AtomFeedItem> | null}
	 */
	#itemCache = null;

	/**
	 * Class constructor.
	 *
	 * @param {import('../xml/document').Document} document
	 *     The XML document to extract data from.
	 * @throws {InvalidFeedError}
	 *     Throws an invalid feed error if an unrecoverable issue is found with the Atom feed.
	 */
	constructor(document) {
		super(document);

		const root = this.document.findElementWithName('feed');
		if (!root) {
			throw new InvalidFeedError('The Atom feed does not have a root element');
		}
		this.#root = root;
	}

	/**
	 * @override
	 * @returns {import('../xml/element').Element}
	 *     Returns the XML element which represents the feed.
	 */
	get element() {
		return this.#root;
	}

	/**
	 * @returns {string | null}
	 *     Returns the version of Atom the feed uses. Exposed publicly in the `meta` property.
	 */
	get #version() {
		const version = this.element.getAttribute('version');
		const namespace = this.element.getAttribute('xmlns');

		if (version && SUPPORTED_ATOM_VERSIONS.includes(version)) {
			return version;
		}
		if (namespace === 'http://purl.org/atom/ns#') {
			return ATOM_VERSION_0_3;
		}
		if (namespace === 'http://www.w3.org/2005/Atom') {
			return ATOM_VERSION_1_0;
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
			type: 'atom',
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
			this.element.getAttribute('xml:lang') ||
			this.element.getAttribute('lang') ||
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
			this.element.findElementWithName('subtitle')?.textContentNormalized ||
			this.element.findElementWithName('tagline')?.textContentNormalized ||
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
			this.element.findElementWithName('rights')?.textContentNormalized ||
			this.element.findElementWithName('copyright')?.textContentNormalized ||
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
		return (
			links
				.find((link) => link.getAttribute('rel') === 'alternate')
				?.getAttributeAsUrl('href') ||
			links.find((link) => link.getAttribute('rel') === null)?.getAttributeAsUrl('href') ||
			super.url
		);
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed's link to itself.
	 */
	get self() {
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
		return super.published;
	}

	/**
	 * @override
	 * @returns {Date | null}
	 *     Returns the date that the feed was last updated on.
	 */
	get updated() {
		return (
			this.element.findElementWithName('updated')?.textContentAsDate ||
			this.element.findElementWithName('modified')?.textContentAsDate ||
			super.updated
		);
	}

	/**
	 * @override
	 * @returns {FeedGenerator | null}
	 *     Returns information about the software that generated the feed.
	 */
	get generator() {
		const generator = this.element.findElementWithName('generator');
		if (!generator) {
			return super.generator;
		}

		const label = generator.textContentNormalized;
		const version = generator?.getAttribute('version') || null;
		const url =
			generator.getAttributeAsUrl('uri') || generator.getAttributeAsUrl('url') || null;

		if (label || version || url) {
			return {
				label,
				version,
				url
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
		const url =
			this.element.findElementWithName('logo')?.textContentAsUrl ||
			this.element.findElementWithName('icon')?.textContentAsUrl ||
			null;
		if (url) {
			return {
				title: null,
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
		return this.element
			.findElementsWithName('author')
			.map((author) => {
				const name = author.findElementWithName('name')?.textContentNormalized || null;
				const url =
					author.findElementWithName('uri')?.textContentAsUrl ||
					author.findElementWithName('url')?.textContentAsUrl ||
					null;
				const email = author.findElementWithName('email')?.textContentNormalized || null;

				if (name || url || email) {
					return {
						name,
						email,
						url
					};
				}

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
		const categories = this.element.findElementsWithName('category').map((category) => {
			const term = category.getAttribute('term') || null;
			const label = category.getAttribute('label') || term;
			const url = category.getAttributeAsUrl('scheme') || null;

			if (!term) {
				return null;
			}

			return {
				label,
				term,
				url
			};
		});
		const subjects = this.element.findElementsWithName('subject').map((subject) => {
			const term = subject.textContentNormalized;
			return term ? { term, label: term, url: null } : null;
		});
		return [...categories, ...subjects].filter(isNotNull);
	}

	/**
	 * @override
	 * @returns {Array<import('./item/atom').AtomFeedItem>}
	 *     Returns all content items in the feed.
	 */
	get items() {
		if (this.#itemCache) {
			return this.#itemCache;
		}
		const items = this.element.findElementsWithName('entry').map((entry) => {
			return new AtomFeedItem(this, entry);
		});
		this.#itemCache = items;
		return items;
	}
}

exports.AtomFeed = AtomFeed;
