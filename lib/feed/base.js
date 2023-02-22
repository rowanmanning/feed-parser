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
	 * Get the XML document which represents the feed.
	 *
	 * @protected
	 * @type {import('../xml/document')}
	 */
	get document() {
		return this.#document;
	}

	/**
	 * Get meta information about the feed.
	 *
	 * @type {FeedMeta}
	 */
	get meta() {
		throw new Error('Feed.meta must be implemented in an extending class');
	}

	/**
	 * Get the feed language.
	 *
	 * @type {string | null}
	 */
	get language() {
		throw new Error('Feed.language must be implemented in an extending class');
	}

	/**
	 * Get the feed title.
	 *
	 * @type {string | null}
	 */
	get title() {
		throw new Error('Feed.title must be implemented in an extending class');
	}

	/**
	 * Get the feed description.
	 *
	 * @type {string | null}
	 */
	get description() {
		throw new Error('Feed.description must be implemented in an extending class');
	}

	/**
	 * Get the feed copyright information.
	 *
	 * @type {string | null}
	 */
	get copyright() {
		throw new Error('Feed.copyright must be implemented in an extending class');
	}

	/**
	 * Get the feed URL.
	 *
	 * @type {string | null}
	 */
	get link() {
		throw new Error('Feed.link must be implemented in an extending class');
	}

	/**
	 * Get the feed's link to itself.
	 *
	 * @type {string | null}
	 */
	get self() {
		throw new Error('Feed.self must be implemented in an extending class');
	}

	/**
	 * Get the date that the feed was published.
	 *
	 * @type {Date | null}
	 */
	get published() {
		throw new Error('Feed.published must be implemented in an extending class');
	}

	/**
	 * Get the date that the feed was last updated.
	 *
	 * @type {Date | null}
	 */
	get updated() {
		throw new Error('Feed.updated must be implemented in an extending class');
	}

	/**
	 * Get information about the software that generated the feed.
	 *
	 * @type {FeedGenerator | null}
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
