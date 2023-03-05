'use strict';

const FeedItem = require('./base');

/**
 * Class representing a single content item in an Atom feed.
 */
module.exports = class AtomFeedItem extends FeedItem {

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
			this.element.findElementWithName('summary')?.textContentNormalized ||
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
		const url = (
			links
				.find(link => link.getAttribute('rel') === 'alternate')
				?.getAttributeAsUrl('href') ||
			links
				.find(link => link.getAttribute('rel') === null)
				?.getAttributeAsUrl('href') ||
			null
		);
		if (!url) {
			return super.url;
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
	 * @returns {FeedItem.FeedItemImage | null}
	 *     Returns an image representing the feed item.
	 */
	get image() {
		const media = this.mediaImages[0];
		if (media) {
			return {
				url: media.url,
				title: null
			};
		}

		// If that fails, check fot the first media:thumbnail
		// TODO ensure these are actually media elements. Expose base feed methods?
		const thumbnail = (
			this.element.findElementWithName('thumbnail') ||
			this.element.findElementWithName('group')?.findElementWithName('thumbnail')
		);
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
	 * @returns {Array<FeedItem.FeedItemMedia>}
	 *     Returns the feed item media.
	 */
	get media() {
		const enclosures = this.element.findElementsWithName('link')
			.filter(link => link.getAttribute('rel') === 'enclosure')
			.map(enclosure => {
				const url = enclosure.getAttributeAsUrl('href');
				if (!url) {
					return null;
				}

				const length = enclosure.getAttributeAsNumber('length');

				const mimeType = enclosure.getAttribute('type')?.toLowerCase() || null;
				const type = typeof mimeType === 'string' ? mimeType.split('/')[0] : null;

				const image = type === 'image' ? url : null;

				// TODO add title to media
				return {
					url,
					image,
					length,
					type,
					mimeType
				};
			})
			.filter(isNotNull);

		return [
			...enclosures,
			...super.media
		].filter((mediaItem, index, array) => {
			return array.findIndex(item => item.url === mediaItem.url) === index;
		});
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
