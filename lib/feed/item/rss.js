'use strict';

const FeedItem = require('./base');

/**
 * Class representing a single content item in an RSS feed.
 */
module.exports = class RssFeedItem extends FeedItem {

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item unique identifier.
	 */
	get id() {
		return this.element.findElementWithName('guid')?.textContentNormalized || null;
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item title.
	 */
	get title() {
		return this.element.findElementWithName('title')?.textContentNormalized || null;
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item description.
	 */
	get description() {
		return this.element.findElementWithName('description')?.textContentNormalized || null;
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item URL.
	 */
	get url() {
		const links = this.element.findElementsWithName('link');
		if (!links?.length) {
			return null;
		}
		const url = links.find(link => link.textContentNormalized)?.textContentAsUrl || null;
		if (!url) {
			return null;
		}

		// Ensure that the URL is resolved against the feed URL
		// if it's a relative link
		try {
			return new URL(url, this.feed.url || undefined).href;
		} catch (error) {}
		return url;
	}

	/**
	 * @override
	 * @returns {Date | null}
	 *     Returns the date that the feed item was published on.
	 */
	get published() {
		return (
			this.element.findElementWithName('pubdate')?.textContentAsDate ||
			this.element.findElementWithName('date')?.textContentAsDate ||
			null
		);
	}

	/**
	 * @override
	 * @returns {Date | null}
	 *     Returns the date that the feed item was last updated on.
	 */
	get updated() {
		return (
			this.element.findElementWithName('date')?.textContentAsDate ||
			this.published
		);
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item content.
	 */
	get content() {
		const contentElement = this.element.findElementWithName('encoded');
		if (contentElement?.namespace !== 'content') {
			return null;
		}
		return contentElement.textContentNormalized || null;
	}

	/**
	 * @override
	 * @returns {FeedItem.FeedItemImage | null}
	 *     Returns an image representing the feed item.
	 */
	get image() {
		const images = this.element.findElementsWithName('image');
		const image = images.find(img => img.namespace !== 'itunes');
		const itunesImage = images.find(img => img.namespace === 'itunes');

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

		// If that fails, check for the first media image
		const media = this.mediaImages[0];
		if (media) {
			return {
				url: media.url,
				title: null
			};
		}

		// If that fails, check fot the first media:thumbnail
		const thumbnail = this.element.findElementWithName('thumbnail');
		const thumbnailUrl = thumbnail?.getAttributeAsUrl('url');
		if (thumbnailUrl) {
			return {
				url: thumbnailUrl,
				title: null
			};
		}
		return null;
	}

	/**
	 * @override
	 * @returns {Array<FeedItem.FeedItemMedia>}
	 *     Returns the feed item media.
	 */
	get media() {
		const media = [
			...this.element.findElementsWithName('enclosure'),
			...this.element.findElementsWithName('content')
				.filter(({namespace}) => namespace === 'media')
		]
			.map(RssFeedItem.#parseMediaItem)
			.filter(isNotNull);

		return media.filter((mediaItem, index, array) => {
			return array.findIndex(item => item.url === mediaItem.url) === index;
		});
	}

	/**
	 * Parse an enclosure or media:content element.
	 *
	 * @param {import('../../xml/element')} mediaItem
	 *     The media item element to parse (either `enclosure` or `media:content`).
	 * @returns {FeedItem.FeedItemMedia | null}
	 *     Returns a parsed media item or null if valid media information cannot be found.
	 */
	static #parseMediaItem(mediaItem) {
		const url = mediaItem.getAttributeAsUrl('url');
		if (!url) {
			return null;
		}

		let length = mediaItem.getAttributeAsNumber('length');
		if (mediaItem.name === 'content' && length === null) {
			length = mediaItem.getAttributeAsNumber('filesize');
		}

		const mimeType = mediaItem.getAttribute('type')?.toLowerCase() || null;
		const medium = mediaItem.getAttribute('medium')?.toLowerCase() || null;
		let type = typeof mimeType === 'string' ? mimeType.split('/')[0] : null;
		if (mediaItem.name === 'content' && medium) {
			type = medium;
		}

		return {
			url,
			length,
			type,
			mimeType
		};
	}

};

/**
 * @param {any | null} value
 *     The value to check.
 * @returns {value is any}
 *     Returns whether the value is not null.
 */
function isNotNull(value) {
	return value !== null;
}
