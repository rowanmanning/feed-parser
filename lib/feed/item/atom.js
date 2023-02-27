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
		return this.element.findElementWithName('id')?.textContentNormalized || null;
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
		return this.element.findElementWithName('summary')?.textContentNormalized || null;
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
			this.element.findElementWithName('published')?.textContentAsDate ||
			this.element.findElementWithName('issued')?.textContentAsDate ||
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
			this.element.findElementWithName('modified')?.textContentAsDate ||
			this.element.findElementWithName('updated')?.textContentAsDate ||
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
			return null;
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

		return content.textContentNormalized || null;
	}

	/**
	 * @override
	 * @returns {FeedItem.FeedItemImage | null}
	 *     Returns an image representing the feed item.
	 */
	get image() {
		return null;
	}

};
