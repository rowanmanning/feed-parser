'use strict';

const { decode: decodeEntities } = require('html-entities');
const { XMLBuilder } = require('fast-xml-parser');

const xmlBuilder = new XMLBuilder({
	attributeNamePrefix: '',
	ignoreAttributes: false,
	preserveOrder: true
});

/**
 * @type {string}
 */
const ATTRIBUTE_PROPERTY = ':@';

/**
 * @type {string}
 */
const TEXT_PROPERTY = '#text';

/**
 * @type {Array<string>}
 */
const SPECIAL_PROPERTIES = [ATTRIBUTE_PROPERTY, TEXT_PROPERTY];

/**
 * Class representing an XML element.
 */
class Element {
	/**
	 * @type {object}
	 */
	#rawElement;

	/**
	 * @type {Element | null}
	 */
	#parent;

	/**
	 * Class constructor.
	 *
	 * @param {object} rawFxpElement
	 *     The raw element representation output by {@link "https://github.com/NaturalIntelligence/fast-xml-parser"|fast-xml-parser}.
	 * @param {Element | null} [parent]
	 *     A parent element to inherit namespaces and base URLs from.
	 */
	constructor(rawFxpElement, parent = null) {
		this.#rawElement = rawFxpElement;
		this.#parent = parent;
	}

	/**
	 * @returns {Element | null}
	 *     Returns the parent element.
	 */
	get parent() {
		return this.#parent;
	}

	/**
	 * @returns {{[key: string]: string}}
	 *     Returns the element attributes.
	 */
	get attributes() {
		if (!this.#rawElement[ATTRIBUTE_PROPERTY]) {
			return {};
		}
		return Object.fromEntries(
			Object.entries(this.#rawElement[ATTRIBUTE_PROPERTY]).map(([key, value]) => {
				return [key.toLowerCase(), `${value}`];
			})
		);
	}

	/**
	 * @returns {string | null}
	 *     Returns the element's base URL.
	 */
	get baseUrl() {
		const parentBaseUrl = this.#parent?.baseUrl || null;
		const xmlBase = this.attributes?.['xml:base'] || null;
		if (xmlBase) {
			try {
				if (parentBaseUrl) {
					return new URL(xmlBase, parentBaseUrl).href;
				}
				return xmlBase;
			} catch (_) {
				// If the URL resolution fails then we don't
				// have a valid base URL
				return xmlBase;
			}
		}
		return parentBaseUrl;
	}

	/**
	 * @returns {Array<Element | string>}
	 *     Returns the element's children.
	 */
	get children() {
		const rawChildren = this.#rawElement[this.#rawName];
		if (Array.isArray(rawChildren)) {
			return rawChildren.map((rawChild) => {
				if (rawChild[TEXT_PROPERTY]) {
					return `${rawChild[TEXT_PROPERTY]}`;
				}
				return Element.create(rawChild, this);
			});
		}
		return [];
	}

	/**
	 * @returns {string}
	 *     Returns the element name.
	 */
	get name() {
		const nameParts = this.#rawName.toLowerCase().split(':');
		return nameParts.length > 1 ? nameParts.slice(1).join(':') : nameParts[0];
	}

	/**
	 * @returns {string | symbol}
	 *     Returns the element XML namespace.
	 */
	get namespace() {
		const nameParts = this.#rawName.toLowerCase().split(':');
		return nameParts.length > 1 && nameParts[0] ? nameParts[0] : Element.DEFAULT_NAMESPACE;
	}

	/**
	 * @returns {{[key: (string | symbol)]: string}}
	 *     Returns the element XML namespace declarations.
	 */
	get namespaceDeclarations() {
		return {
			...(this.#parent?.namespaceDeclarations || {}),
			...Object.fromEntries(
				Object.entries(this.attributes)
					.filter(([key]) => key === 'xmlns' || key.startsWith('xmlns:'))
					.map(([key, value]) => {
						if (key === 'xmlns') {
							return [Element.DEFAULT_NAMESPACE, value?.trim()];
						}
						return [key.replace(/^xmlns:/, ''), value?.trim()];
					})
			)
		};
	}

	/**
	 * @returns {string | null}
	 *     Returns the element XML namespace URI.
	 */
	get namespaceUri() {
		return this.namespaceDeclarations[this.namespace] || null;
	}

	/**
	 * @returns {string}
	 *     Returns the raw unmodified element name.
	 */
	get #rawName() {
		const keys = Object.keys(this.#rawElement).filter((key) => {
			return !SPECIAL_PROPERTIES.includes(key);
		});
		return keys[0] || 'unknown';
	}

	/**
	 * @returns {string}
	 *     Returns the flattened text content of the element.
	 */
	get textContent() {
		if (this.children.length) {
			return this.children
				.map((child) => {
					if (typeof child === 'string') {
						return child;
					}
					return child.textContent;
				})
				.join('');
		}
		return '';
	}

	/**
	 * @returns {Date | null}
	 *     Returns the flattened text content of an element as a Date object.
	 */
	get textContentAsDate() {
		const date = new Date(this.textContent.trim());
		return date instanceof Date && !Number.isNaN(date.valueOf()) ? date : null;
	}

	/**
	 * @returns {string}
	 *     Returns the flattened text content of an element as a URL, resolved against the element
	 *     base URL.
	 */
	get textContentAsUrl() {
		return this.resolveUrl(this.textContent.trim());
	}

	/**
	 * @returns {string}
	 *     Returns the text content of an element trimmed and with entities decoded.
	 */
	get textContentNormalized() {
		return decodeEntities(this.textContent.trim());
	}

	/**
	 * @returns {string}
	 *     Returns the element's inner HTML content.
	 */
	get innerHtml() {
		const innerHtml = xmlBuilder.build(this.#rawElement[this.#rawName]);
		if (typeof innerHtml === 'string') {
			return decodeEntities(innerHtml.trim());
		}
		return this.textContentNormalized;
	}

	/**
	 * Find all direct child elements with the given name.
	 *
	 * @param {string} name
	 *     The name of the children to find.
	 * @returns {Array<Element>}
	 *     Returns a filtered list of child elements.
	 */
	findElementsWithName(name) {
		/**
		 * @param {Element | string} element
		 *     The element we're filtering based on.
		 * @returns {element is Element}
		 *     Returns whether the element has the given name.
		 */
		function hasName(element) {
			return typeof element !== 'string' && element.name === name;
		}

		return this.children.filter(hasName);
	}

	/**
	 * Find the nth direct child element with the given name.
	 *
	 * @param {string} name
	 *     The name of the child to find.
	 * @param {number} [nth]
	 *     The child to get. If zero or a positive number, then it will be the nth child found.
	 *     If a negative number, then it will be the nth last child.
	 * @returns {Element | null}
	 *     Returns the found child element or `null` if no matching child was found.
	 */
	findElementWithName(name, nth = 0) {
		return this.findElementsWithName(name).slice(nth)[0] || null;
	}

	/**
	 * Return whether a direct child element exists with the given name.
	 *
	 * @param {string} name
	 *     The name to check for.
	 * @returns {boolean}
	 *     Returns `true` if a child with the given name is found, and `false` otherwise.
	 */
	hasElementWithName(name) {
		return Boolean(this.findElementsWithName(name).length);
	}

	/**
	 * Get an attribute value.
	 *
	 * @param {string} name
	 *     The attribute name to get.
	 * @returns {string | null}
	 *     Returns the attribute value or `null` if no attribute with the given name is set.
	 */
	getAttribute(name) {
		return this.attributes?.[name] || null;
	}

	/**
	 * Resolve a URL based on the element's base URL.
	 *
	 * @param {string} url
	 *     The absolute or relative URL to resolve.
	 * @returns {string}
	 *     Returns the URL resolved against the element base URL, or as-is if the URL is absolute.
	 */
	resolveUrl(url) {
		try {
			if (this.baseUrl && typeof url === 'string') {
				return new URL(url, this.baseUrl).href;
			}
		} catch (_) {}
		return url;
	}

	/**
	 * Get an attribute value as a URL, resolved against the element base URL.
	 *
	 * @param {string} name
	 *     The attribute name to get.
	 * @returns {string | null}
	 *     Returns the attribute value or `null` if no attribute with the given name is set.
	 */
	getAttributeAsUrl(name) {
		const value = this.getAttribute(name);
		if (value) {
			return this.resolveUrl(value.trim());
		}
		return null;
	}

	/**
	 * Get an attribute value as a number.
	 *
	 * @param {string} name
	 *     The attribute name to get.
	 * @returns {number | null}
	 *     Returns the attribute value or `null` if no attribute with the given name is set
	 *     or it cannot be parsed as a number.
	 */
	getAttributeAsNumber(name) {
		const value = this.getAttribute(name);
		if (value) {
			const parsedNumber = Number(value);
			if (typeof parsedNumber !== 'number' || Number.isNaN(parsedNumber)) {
				return null;
			}
			return parsedNumber;
		}
		return null;
	}

	/**
	 * Create an element.
	 *
	 * @private
	 * @param {object} rawFxpElement
	 *     The raw element representation output by {@link "https://github.com/NaturalIntelligence/fast-xml-parser"|fast-xml-parser}.
	 * @param {Element | null} [parent]
	 *     A parent element to inherit namespaces and base URLs from.
	 * @returns {Element}
	 *     Returns a created element.
	 */
	static create(rawFxpElement, parent) {
		return new Element(rawFxpElement, parent);
	}
}

/**
 * A symbol used to refer to the default namespace, ie no namespace, on an element.
 *
 * @type {symbol}
 */
Element.DEFAULT_NAMESPACE = Symbol(':default');

module.exports = Element;
