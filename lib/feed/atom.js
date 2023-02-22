'use strict';

const Feed = require('./base');
const InvalidFeedError = require('../errors/invalid-feed');

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
const SUPPORTED_ATOM_VERSIONS = [
	ATOM_VERSION_0_3,
	ATOM_VERSION_1_0
];

/**
 * Class representing an Atom feed.
 */
class AtomFeed extends Feed {

	/**
	 * @type {import('../xml/element')}
	 */
	#root;

	/**
	 * Class constructor.
	 *
	 * @param {import('../xml/document')} document
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
	 * @returns {string | null}
	 *     Returns the version of Atom the feed uses. Exposed publicly in the `meta` property.
	 */
	get #version() {
		const version = this.#root.getAttribute('version');
		const namespace = this.#root.getAttribute('xmlns');

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
	 * @returns {Feed.FeedMeta}
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
		return this.#root.findElementWithName('title')?.textContentNormalized || null;
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed description.
	 */
	get description() {
		return (
			this.#root.findElementWithName('subtitle')?.textContentNormalized ||
			this.#root.findElementWithName('tagline')?.textContentNormalized ||
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
			this.#root.findElementWithName('rights')?.textContentNormalized ||
			this.#root.findElementWithName('copyright')?.textContentNormalized ||
			null
		);
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed URL.
	 */
	get url() {
		const links = this.#root.findElementsWithName('link');
		if (!links?.length) {
			return null;
		}
		return (
			links
				.find(link => link.getAttribute('rel') === 'alternate')
				?.getAttributeAsUrl('href') ||
			links
				.find(link => link.getAttribute('rel') === null)
				?.getAttributeAsUrl('href') ||
			null
		);
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed's link to itself.
	 */
	get self() {
		const links = this.#root.findElementsWithName('link');
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
		return null;
	}

	/**
	 * @override
	 * @returns {Date | null}
	 *     Returns the date that the feed was last updated on.
	 */
	get updated() {
		return (
			this.#root.findElementWithName('updated')?.textContentAsDate ||
			this.#root.findElementWithName('modified')?.textContentAsDate ||
			null
		);
	}

	/**
	 * @override
	 * @returns {Feed.FeedGenerator | null}
	 *     Returns information about the software that generated the feed.
	 */
	get generator() {
		const generator = this.#root.findElementWithName('generator');
		if (!generator) {
			return null;
		}

		const label = generator.textContentNormalized;
		const version = generator?.getAttribute('version') || null;
		const url = (
			generator.getAttributeAsUrl('uri') ||
			generator.getAttributeAsUrl('url') ||
			null
		);

		if (label || version || url) {
			return {
				label,
				version,
				url
			};
		}
		return null;
	}

}

module.exports = AtomFeed;
