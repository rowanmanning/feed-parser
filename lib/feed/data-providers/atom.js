'use strict';

const DataProvider = require('./base');
const InvalidFeedError = require('../errors/invalid-feed');

/**
 * Class representing an Atom feed data provider.
 */
class AtomDataProvider extends DataProvider {

	/**
	 * Class constructor.
	 *
	 * @access public
	 * @param {import('../../xml/document')} document
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
	 * @type {String}
	 */
	get version() {
		const version = this.root?.getAttribute('version');
		const namespace = this.root?.getAttribute('xmlns');

		if (version && AtomDataProvider.ALLOWED_VERSIONS.includes(version)) {
			return version;
		}
		if (namespace === 'http://purl.org/atom/ns#') {
			return AtomDataProvider.VERSION_0_3;
		}
		if (namespace === 'http://www.w3.org/2005/Atom') {
			return AtomDataProvider.VERSION_1_0;
		}

		return null;
	}

	/**
	 * @type {DataProvider.FeedMeta}
	 */
	get meta() {
		return {
			type: 'atom',
			version: this.version
		};
	}

	/**
	 * @type {(String|null)}
	 */
	get language() {
		return (
			this.root?.getAttribute('xml:lang') ||
			this.root?.getAttribute('lang') ||
			null
		);
	}

	/**
	 * @type {(String|null)}
	 */
	get title() {
		return this.root?.findElementWithName('title')?.normalizedTextContent || null;
	}

}

/**
 * @type {String}
 */
AtomDataProvider.VERSION_0_3 = '0.3';

/**
 * @type {String}
 */
AtomDataProvider.VERSION_1_0 = '1.0';

/**
 * @type {Array<String>}
 */
AtomDataProvider.ALLOWED_VERSIONS = [
	AtomDataProvider.VERSION_0_3,
	AtomDataProvider.VERSION_1_0
];

module.exports = AtomDataProvider;
