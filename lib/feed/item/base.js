/* eslint-disable jsdoc/require-property-description */
'use strict';

const isNotNull = require('../../utils/is-not-null');

/**
 * @typedef {import('../base').FeedAuthor} FeedItemAuthor
 */

/**
 * @typedef {import('../base').FeedCategory} FeedItemCategory
 */

/**
 * @typedef {import('../base').FeedImage} FeedItemImage
 */

/**
 * @typedef {object} FeedItemMedia
 * @property {string} url
 *     The URL to the enclosed media.
 * @property {string | null} image
 *     An image which represents the media (the same as URL if media type is image
 *     or a thumbnail for different media types).
 * @property {string | null} title
 *     The title of the media.
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
 * @property {Array<FeedItemAuthor>} authors
 * @property {Array<FeedItemCategory>} categories
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
		const mediaRssContentItems = [
			...FeedItem.#findMediaRssContent(this.element),
			...this.element.findElementsWithName('group')
				.filter(FeedItem.#isMediaRssElement)
				.flatMap(FeedItem.#findMediaRssContent)
		];

		return mediaRssContentItems
			.map(mediaItem => {
				const url = mediaItem.getAttributeAsUrl('url');
				if (!url) {
					return null;
				}

				const length = (
					mediaItem.getAttributeAsNumber('length') ??
					mediaItem.getAttributeAsNumber('filesize')
				);

				const mimeType = mediaItem.getAttribute('type')?.toLowerCase() || null;
				const medium = mediaItem.getAttribute('medium')?.toLowerCase() || null;
				let type = medium;
				if (!medium && typeof mimeType === 'string') {
					type = mimeType.split('/')[0];
				}

				let thumbnail = type === 'image' ? url : null;
				const thumbnailElement = mediaItem.parent?.findElementWithName('thumbnail');
				if (thumbnailElement && FeedItem.#isMediaRssElement(thumbnailElement)) {
					thumbnail = thumbnailElement.getAttributeAsUrl('url') || null;
				}

				const title = [
					mediaItem.findElementWithName('title') || null,
					mediaItem.parent?.findElementWithName('title') || null,
					mediaItem.findElementWithName('description') || null,
					mediaItem.parent?.findElementWithName('description') || null
				]
					.filter(isNotNull)
					.filter(FeedItem.#isMediaRssElement)
					.find(titleElement => titleElement?.textContentNormalized)
					?.textContentNormalized || null;

				return {
					url,
					image: thumbnail,
					title,
					length,
					type,
					mimeType
				};
			})
			.filter(isNotNull);
	}

	/**
	 * @returns {Array<FeedItemAuthor>}
	 *     Returns the authors of the feed item.
	 */
	get authors() {
		return [];
	}

	/**
	 * @returns {Array<FeedItemCategory>}
	 *     Returns the categories the feed item belongs to.
	 */
	get categories() {
		return [];
	}

	/**
	 * Find Media RSS content items under an element.
	 *
	 * @param {import('../../xml/element')} element
	 *     The element to look within.
	 * @returns {Array<import('../../xml/element')>}
	 *     Returns any found elements.
	 */
	static #findMediaRssContent(element) {
		return element.findElementsWithName('content').filter(FeedItem.#isMediaRssElement);
	}

	/**
	 * Check whether an element is a Media RSS element.
	 *
	 * @param {import('../../xml/element')} element
	 *     The element to check.
	 * @returns {boolean}
	 *     Returns whether the element is a Media RSS element.
	 */
	static #isMediaRssElement(element) {
		return element.namespaceUri === 'http://search.yahoo.com/mrss/';
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
			media: this.media,
			authors: this.authors,
			categories: this.categories
		};
	}

};
