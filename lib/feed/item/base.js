/* eslint-disable jsdoc/require-property-description */
'use strict';

/**
 * @typedef {import('../base').FeedImage} FeedItemImage
 */

/**
 * @typedef {object} FeedItemMedia
 * @property {string | null} url
 *     The URL to the enclosed media.
 * @property {number | null} length
 *     The length of the media in bytes.
 * @property {string | null} type
 *     The type of the media (the first part of the mime type).
 * @property {string | null} mimeType
 *     The full mimetype of the enclosed media.
 */

/**
 * @typedef {object} FeedItemJson
 * @property {string | null} id
 * @property {string | null} title
 * @property {string | null} description
 * @property {string | null} url
 * @property {string | null} published
 * @property {string | null} updated
 * @property {string | null} content
 * @property {FeedItemImage | null} image
 * @property {Array<FeedItemMedia>} media
 */

/**
 * Class representing a single content item in a feed.
 */
module.exports = class FeedItem {

	/**
	 * @type {import('../base')}
	 */
	#feed;

	/**
	 * @type {import('../../xml/element')}
	 */
	#element;

	/**
	 * Class constructor.
	 *
	 * @param {import('../base')} feed
	 *     The feed the item belongs to.
	 * @param {import('../../xml/element')} element
	 *     The XML element to extract data from.
	 */
	constructor(feed, element) {
		this.#feed = feed;
		this.#element = element;
	}

	/**
	 * @returns {import('../base')}
	 *     Returns the feed the item belongs to.
	 */
	get feed() {
		return this.#feed;
	}

	/**
	 * @returns {import('../../xml/element')}
	 *     Returns the XML element which represents the feed item.
	 */
	get element() {
		return this.#element;
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed item unique identifier.
	 */
	get id() {
		return null;
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed item title.
	 */
	get title() {
		return this.element.findElementWithName('title')?.textContentNormalized || null;
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed item description.
	 */
	get description() {
		return null;
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed item URL.
	 */
	get url() {
		return null;
	}

	/**
	 * @returns {Date | null}
	 *     Returns the date that the feed item was published on.
	 */
	get published() {
		return null;
	}

	/**
	 * @returns {Date | null}
	 *     Returns the date that the feed item was last updated on.
	 */
	get updated() {
		return null;
	}

	/**
	 * @returns {string | null}
	 *     Returns the feed item content.
	 */
	get content() {
		return null;
	}

	/**
	 * @returns {FeedItemImage | null}
	 *     Returns an image representing the feed item.
	 */
	get image() {
		return null;
	}

	/**
	 * @returns {Array<FeedItemMedia>}
	 *     Returns the feed item media.
	 */
	get media() {
		return [];
	}

	/**
	 * @returns {Array<FeedItemMedia>}
	 *     Returns the feed item media with a type of "audio".
	 */
	get mediaAudio() {
		return this.media.filter(mediaItem => mediaItem.type === 'audio');
	}

	/**
	 * @returns {Array<FeedItemMedia>}
	 *     Returns the feed item media with a type of "image".
	 */
	get mediaImages() {
		return this.media.filter(mediaItem => mediaItem.type === 'image');
	}

	/**
	 * @returns {Array<FeedItemMedia>}
	 *     Returns the feed item media with a type of "video".
	 */
	get mediaVideos() {
		return this.media.filter(mediaItem => mediaItem.type === 'video');
	}

	/**
	 * Get a JSON representation of the feed item.
	 *
	 * @returns {FeedItemJson}
	 *     Returns a JSON representation of the feed item.
	 */
	toJSON() {
		return {
			id: this.id,
			title: this.title,
			description: this.description,
			url: this.url,
			published: this.published ? this.published.toISOString() : null,
			updated: this.updated ? this.updated.toISOString() : null,
			content: this.content,
			image: this.image,
			media: this.media
		};
	}

};
