/* eslint-disable jsdoc/require-returns-check */
/* eslint-disable jsdoc/require-property-description */
'use strict';

/**
 * @typedef {object} FeedMeta
 * @property {string} type
 *     The name of the type of feed.
 * @property {string | null} version
 *     The version of the type of feed.
 */

/**
 * @typedef {object} FeedGenerator
 * @property {string | null} label
 *     The text label representing the software that generated the feed.
 * @property {string | null} version
 *     The version of the generator used to generate the feed.
 * @property {string | null} link
 *     A URI containing further information about the generator.
 */

/**
 * @typedef {object} FeedJson
 * @property {FeedMeta} meta
 * @property {string | null} language
 * @property {string | null} title
 * @property {string | null} description
 * @property {string | null} copyright
 * @property {string | null} link
 * @property {string | null} self
 * @property {string | null} published
 * @property {string | null} updated
 * @property {FeedGenerator | null} generator
 */

/**
 * Class representing a feed.
 */
module.exports = class Feed {

	/**
	 * @type {import('../xml/document')}
	 */
	#document;

	/**
	 * Class constructor.
	 *
	 * @param {import('../xml/document')} document
	 *     The XML document to extract data from.
	 */
	constructor(document) {
		this.#document = document;
	}

	/**
	 * @protected
	 * @returns {import('../xml/document')}
	 *     Returns the XML document which represents the feed.
	 */
	get document() {
		return this.#document;
	}

	/**
	 * @returns {FeedMeta}
	 *     Returns meta information about the feed.
	 */
	get meta() {
		throw new Error('Feed.meta must be implemented in an extending class');
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed language.
	 */
	get language() {
		throw new Error('Feed.language must be implemented in an extending class');
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed title.
	 */
	get title() {
		throw new Error('Feed.title must be implemented in an extending class');
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed description.
	 */
	get description() {
		throw new Error('Feed.description must be implemented in an extending class');
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed copyright information.
	 */
	get copyright() {
		throw new Error('Feed.copyright must be implemented in an extending class');
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed URL.
	 */
	get link() {
		throw new Error('Feed.link must be implemented in an extending class');
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed's link to itself.
	 */
	get self() {
		throw new Error('Feed.self must be implemented in an extending class');
	}

	/**
	 * @returns {Date | null}
	 *     Returns the date that the feed was published on.
	 */
	get published() {
		throw new Error('Feed.published must be implemented in an extending class');
	}

	/**
	 * @returns {Date | null}
	 *     Returns the date that the feed was last updated on.
	 */
	get updated() {
		throw new Error('Feed.updated must be implemented in an extending class');
	}

	/**
	 * @returns {FeedGenerator | null}
	 *     Returns information about the software that generated the feed.
	 */
	get generator() {
		throw new Error('Feed.generator must be implemented in an extending class');
	}

	/**
	 * Get a JSON representation of the feed.
	 *
	 * @returns {FeedJson}
	 *     Returns a JSON representation of the feed.
	 */
	toJSON() {
		return {
			meta: this.meta,
			language: this.language,
			title: this.title,
			description: this.description,
			copyright: this.copyright,
			link: this.link,
			self: this.self,
			published: this.published ? this.published.toISOString() : null,
			updated: this.updated ? this.updated.toISOString() : null,
			generator: this.generator
		};
	}

};
