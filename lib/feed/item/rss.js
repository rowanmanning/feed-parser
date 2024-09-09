'use strict';

const { isNotNull } = require('../../utils/is-not-null');
const { FeedItem } = require('./base');
const { parseContactString } = require('../../utils/parse-contact-string');

/**
 * @import {FeedAuthor, FeedCategory, FeedImage} from '../base'
 * @import { FeedItemMedia } from './base'
 */

const httpRegExp = /^https?:\/\//i;

/**
 * Class representing a single content item in an RSS feed.
 */
class RssFeedItem extends FeedItem {
	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item unique identifier.
	 */
	get id() {
		return this.element.findElementWithName('guid')?.textContentNormalized || super.id;
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item description.
	 */
	get description() {
		return (
			this.element.findElementWithName('description')?.textContentNormalized ||
			super.description
		);
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item URL.
	 */
	get url() {
		const links = this.element.findElementsWithName('link');
		if (!links?.length) {
			return super.url;
		}
		const url = links.find((link) => link.textContentNormalized)?.textContentAsUrl || null;
		if (!url) {
			return super.url;
		}

		// Ensure that the URL is resolved against the feed URL
		// if it's a relative link
		try {
			return new URL(url, this.feed.url || undefined).href;
		} catch (_) {}
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
			super.published
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
			super.updated ||
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
			return super.content;
		}
		return contentElement.textContentNormalized || super.content;
	}

	/**
	 * @override
	 * @returns {FeedImage | null}
	 *     Returns an image representing the feed item.
	 */
	get image() {
		const images = this.element.findElementsWithName('image');
		const image = images.find((img) => img.namespace !== 'itunes');
		const itunesImage = images.find((img) => img.namespace === 'itunes');

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
				url: media.image || media.url,
				title: media.title
			};
		}

		// Get _any_ media thumbnail
		const thumbnails = this.media.filter((item) => item.image);
		if (thumbnails[0]?.image) {
			return {
				url: thumbnails[0].image,
				title: thumbnails[0].title
			};
		}

		// If that fails, check fot the first media:thumbnail
		// TODO ensure these are actually media elements. Expose base feed methods?
		const thumbnail =
			this.element.findElementWithName('thumbnail') ||
			this.element.findElementWithName('group')?.findElementWithName('thumbnail');
		const thumbnailUrl = thumbnail?.getAttributeAsUrl('url');
		if (thumbnailUrl) {
			return {
				url: thumbnailUrl,
				title: null
			};
		}
		return super.image;
	}

	/**
	 * @override
	 * @returns {Array<FeedItemMedia>}
	 *     Returns the feed item media.
	 */
	get media() {
		const enclosures = this.element
			.findElementsWithName('enclosure')
			.map((enclosure) => {
				const url = enclosure.getAttributeAsUrl('url');
				if (!url) {
					return null;
				}

				const length = enclosure.getAttributeAsNumber('length');

				const mimeType = enclosure.getAttribute('type')?.toLowerCase() || null;
				const type = typeof mimeType === 'string' ? mimeType.split('/')[0] : null;

				const image = type === 'image' ? url : null;

				return {
					url,
					image,
					title: null,
					length,
					type,
					mimeType
				};
			})
			.filter(isNotNull);

		return [...enclosures, ...super.media].filter((mediaItem, index, array) => {
			return array.findIndex((item) => item.url === mediaItem.url) === index;
		});
	}

	/**
	 * @override
	 * @returns {Array<FeedAuthor>}
	 *     Returns the authors of the feed item, defaulting to the authors
	 *     of the feed if none are found.
	 */
	get authors() {
		const itemAuthors = [
			...this.element.findElementsWithName('author'),
			...this.element.findElementsWithName('creator')
		]
			.map((author) => {
				return parseContactString(author.textContentNormalized);
			})
			.filter(isNotNull);
		return itemAuthors.length ? itemAuthors : this.feed.authors;
	}

	/**
	 * @override
	 * @returns {Array<FeedCategory>}
	 *     Returns the categories the feed item belongs to.
	 */
	get categories() {
		const categories = this.element.findElementsWithName('category').map((category) => {
			const term = category.textContentNormalized;
			const domain = category.getAttribute('domain') || '';
			const url = httpRegExp.test(domain) ? category.getAttributeAsUrl('domain') : null;

			if (!term) {
				return null;
			}

			return {
				label: term,
				term,
				url
			};
		});
		const subjects = this.element.findElementsWithName('subject').map((subject) => {
			const term = subject.textContentNormalized;
			return term ? { term, label: term, url: null } : null;
		});
		const itemCategories = [...categories, ...subjects].filter(isNotNull);
		return itemCategories.length ? itemCategories : this.feed.categories;
	}
}

exports.RssFeedItem = RssFeedItem;
