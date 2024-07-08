'use strict';

/**
 * @typedef {object} FeedAuthor
 * @property {string | null} name
 *     The author's name.
 * @property {string | null} email
 *     The author's email address.
 * @property {string | null} url
 *     The URL of a page representing the author.
 */

/**
 * @typedef {object} FeedCategory
 * @property {string | null} label
 *     The category label.
 * @property {string} term
 *     The category term.
 * @property {string | null} url
 *     The URL of a page representing the category.
 */

/**
 * @typedef {object} FeedGenerator
 * @property {string | null} label
 *     The text label representing the software that generated the feed.
 * @property {string | null} version
 *     The version of the generator used to generate the feed.
 * @property {string | null} url
 *     A URL containing further information about the generator.
 */

/**
 * @typedef {object} FeedImage
 * @property {string | null} title
 *     The alternative text of the image.
 * @property {string} url
 *     The image URL.
 */

/**
 * @typedef {object} FeedMeta
 * @property {string} type
 *     The name of the type of feed.
 * @property {string | null} version
 *     The version of the type of feed.
 */

/**
 * @typedef {object} FeedJson
 * @property {FeedMeta} meta
 * @property {string | null} language
 * @property {string | null} title
 * @property {string | null} description
 * @property {string | null} copyright
 * @property {string | null} url
 * @property {string | null} self
 * @property {string | null} published
 * @property {string | null} updated
 * @property {FeedGenerator | null} generator
 * @property {FeedImage | null} image
 * @property {Array<FeedAuthor>} authors
 * @property {Array<FeedCategory>} categories
 * @property {Array<import('./item/base').FeedItemJson>} items
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
	 * @returns {import('../xml/element')}
	 *     Returns the XML element which represents the feed.
	 */
	get element() {
		return this.#document;
	}

	/**
	 * @returns {FeedMeta}
	 *     Returns meta information about the feed.
	 */
	get meta() {
		return {
			type: 'unknown',
			version: '0'
		};
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed language.
	 */
	get language() {
		return null;
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed title.
	 */
	get title() {
		return this.element.findElementWithName('title')?.textContentNormalized || null;
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed description.
	 */
	get description() {
		return null;
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed copyright information.
	 */
	get copyright() {
		return null;
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed URL.
	 */
	get url() {
		return null;
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed's link to itself.
	 */
	get self() {
		return null;
	}

	/**
	 * @returns {Date | null}
	 *     Returns the date that the feed was published on.
	 */
	get published() {
		return null;
	}

	/**
	 * @returns {Date | null}
	 *     Returns the date that the feed was last updated on.
	 */
	get updated() {
		return null;
	}

	/**
	 * @returns {FeedGenerator | null}
	 *     Returns information about the software that generated the feed.
	 */
	get generator() {
		return null;
	}

	/**
	 * @returns {FeedImage | null}
	 *     Returns an image representing the feed.
	 */
	get image() {
		return null;
	}

	/**
	 * @returns {Array<FeedAuthor>}
	 *     Returns the authors of the feed.
	 */
	get authors() {
		return [];
	}

	/**
	 * @returns {Array<FeedCategory>}
	 *     Returns the categories the feed belongs to.
	 */
	get categories() {
		return [];
	}

	/**
	 * @returns {Array<import('./item/base')>}
	 *     Returns all content items in the feed.
	 */
	get items() {
		return [];
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
			url: this.url,
			self: this.self,
			published: this.published ? this.published.toISOString() : null,
			updated: this.updated ? this.updated.toISOString() : null,
			generator: this.generator,
			image: this.image,
			authors: this.authors,
			categories: this.categories,
			items: this.items.map((item) => item.toJSON())
		};
	}
};
