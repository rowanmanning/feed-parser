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
	 * Class constructor.
	 *
	 * @public
	 * @param {import('../xml/document')} document
	 *     The XML document to extract data from.
	 * @throws {InvalidFeedError}
	 *     Throws an invalid feed error if an unrecoverable issue is found with the Atom feed.
	 */
	constructor(document) {
		super(document);

		this.root = document.findElementWithName('feed');
		if (!this.root) {
			throw new InvalidFeedError('The Atom feed does not have a root element');
		}
	}

	/**
	 * Get the version of Atom the feed uses. Exposed publicly in the `meta` property.
	 *
	 * @type {(string | null)}
	 */
	get #version() {
		const version = this.root?.getAttribute('version');
		const namespace = this.root?.getAttribute('xmlns');

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
	 * Get meta information about the feed.
	 *
	 * @public
	 * @type {Feed.FeedMeta}
	 */
	get meta() {
		return {
			type: 'atom',
			version: this.#version
		};
	}

	/**
	 * Get the feed language.
	 *
	 * @public
	 * @type {(string | null)}
	 */
	get language() {
		return (
			this.root?.getAttribute('xml:lang') ||
			this.root?.getAttribute('lang') ||
			null
		);
	}

	/**
	 * Get the feed title.
	 *
	 * @public
	 * @type {(string | null)}
	 */
	get title() {
		return this.root?.findElementWithName('title')?.textContentNormalized || null;
	}

	/**
	 * Get the feed description.
	 *
	 * @public
	 * @type {(string | null)}
	 */
	get description() {
		return (
			this.root?.findElementWithName('subtitle')?.textContentNormalized ||
			this.root?.findElementWithName('tagline')?.textContentNormalized ||
			null
		);
	}

	/**
	 * Get the feed copyright information.
	 *
	 * @public
	 * @type {(string | null)}
	 */
	get copyright() {
		return (
			this.root?.findElementWithName('rights')?.textContentNormalized ||
			this.root?.findElementWithName('copyright')?.textContentNormalized ||
			null
		);
	}

	/**
	 * Get the feed URL.
	 *
	 * @public
	 * @type {(string | null)}
	 */
	get link() {
		const links = this.root?.findElementsWithName('link');
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
	 * Get the feed's link to itself.
	 *
	 * @public
	 * @type {(string | null)}
	 */
	get self() {
		const links = this.root?.findElementsWithName('link');
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
	 * @public
	 * @type {(Date|null)}
	 */
	get published() {
		return null;
	}

	/**
	 * Get the date that the feed was last updated.
	 *
	 * @public
	 * @type {(Date|null)}
	 */
	get updated() {
		return (
			this.root?.findElementWithName('updated')?.textContentAsDate ||
			this.root?.findElementWithName('modified')?.textContentAsDate ||
			null
		);
	}

}

module.exports = AtomFeed;
