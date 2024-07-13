'use strict';

const { FeedItem } = require('./base');
const { isNotNull } = require('../../utils/is-not-null');
const { parseContactString } = require('../../utils/parse-contact-string');

/**
 * @import { FeedAuthor, FeedCategory, FeedImage } from '../base'
 * @import { FeedItemMedia } from './base'
 */

/**
 * Class representing a single content item in an Atom feed.
 */
class AtomFeedItem extends FeedItem {
	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item unique identifier.
	 */
	get id() {
		return this.element.findElementWithName('id')?.textContentNormalized || super.id;
	}

	/**
	 * @override
	 * @returns {string | null}
	 *     Returns the feed item description.
	 */
	get description() {
		return (
			this.element.findElementWithName('summary')?.textContentNormalized || super.description
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
		const url =
			links
				.find((link) => link.getAttribute('rel') === 'alternate')
				?.getAttributeAsUrl('href') ||
			links.find((link) => link.getAttribute('rel') === null)?.getAttributeAsUrl('href') ||
			null;
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
			this.element.findElementWithName('published')?.textContentAsDate ||
			this.element.findElementWithName('issued')?.textContentAsDate ||
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
			this.element.findElementWithName('modified')?.textContentAsDate ||
			this.element.findElementWithName('updated')?.textContentAsDate ||
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
		const content = this.element.findElementWithName('content');
		if (!content) {
			return super.content;
		}

		// Handle XHTML. From the Atom spec:
		// https://www.rfc-editor.org/rfc/rfc4287#section-4.1.3
		// 3. If the value of "type" is "xhtml", the content of atom:content
		// MUST be a single XHTML div element [XHTML] and SHOULD be suitable
		// for handling as XHTML. The XHTML div element itself MUST NOT be
		// considered part of the content. Atom Processors that display the
		// content MAY use the markup to aid in displaying it. The escaped
		// versions of characters such as "&" and ">" represent those
		// characters, not markup.
		const innerDiv = content.findElementWithName('div');
		if (content.getAttribute('type') === 'xhtml' && innerDiv) {
			return innerDiv.innerHtml;
		}

		return content.textContentNormalized || super.content;
	}

	/**
	 * @override
	 * @returns {FeedImage | null}
	 *     Returns an image representing the feed item.
	 */
	get image() {
		const media = this.mediaImages[0];
		if (media) {
			return {
				url: media.url,
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
			.findElementsWithName('link')
			.filter((link) => link.getAttribute('rel') === 'enclosure')
			.map((enclosure) => {
				const url = enclosure.getAttributeAsUrl('href');
				if (!url) {
					return null;
				}

				const length = enclosure.getAttributeAsNumber('length');

				const mimeType = enclosure.getAttribute('type')?.toLowerCase() || null;
				const type = typeof mimeType === 'string' ? mimeType.split('/')[0] : null;

				const image = type === 'image' ? url : null;

				const title = enclosure.getAttribute('title');

				return {
					url,
					image,
					title,
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
		const itemAuthors = this.element
			.findElementsWithName('author')
			.map((author) => {
				const name = author.findElementWithName('name')?.textContentNormalized || null;
				const url =
					author.findElementWithName('uri')?.textContentAsUrl ||
					author.findElementWithName('url')?.textContentAsUrl ||
					null;
				const email = author.findElementWithName('email')?.textContentNormalized || null;

				if (name || url || email) {
					return {
						name,
						email,
						url
					};
				}

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
		const itemCategories = this.element
			.findElementsWithName('category')
			.map((category) => {
				const term = category.getAttribute('term') || null;
				const label = category.getAttribute('label') || term;
				const url = category.getAttributeAsUrl('scheme') || null;

				if (!term) {
					return null;
				}

				return {
					label,
					term,
					url
				};
			})
			.filter(isNotNull);
		return itemCategories.length ? itemCategories : this.feed.categories;
	}
}

exports.AtomFeedItem = AtomFeedItem;
