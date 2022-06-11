'use strict';

const {decode: decodeEntities} = require('html-entities');

/**
 * Class representing an XML element.
 */
class Element {

	/**
	 * Class constructor.
	 *
	 * @access public
	 * @param {object} rawFxpElement
	 *     The raw element representation output by {@link "https://github.com/NaturalIntelligence/fast-xml-parser"|fast-xml-parser}.
	 * @param {(Element|null)} [parent = null]
	 *     A parent element to inherit namespaces and base URLs from.
	 */
	constructor(rawFxpElement, parent = null) {

		/**
		 * @access private
		 * @type {object}
		 */
		this.rawElement = rawFxpElement;

		/**
		 * @access public
		 * @type {(Element|null)}
		 */
		this.parent = parent;

	}

	/**
	 * Get the element attributes.
	 *
	 * @access public
	 * @type {Object<string, string>}
	 */
	get attributes() {
		if (!this.rawElement[Element.ATTRIBUTE_PROPERTY]) {
			return {};
		}
		return Object.fromEntries(
			Object.entries(this.rawElement[Element.ATTRIBUTE_PROPERTY]).map(([key, value]) => {
				return [key.toLowerCase(), value];
			})
		);
	}

	/**
	 * Get the element attributes.
	 *
	 * @access public
	 * @type {(string | null)}
	 */
	get baseUrl() {
		const parentBaseUrl = this.parent?.baseUrl || null;
		const xmlBase = this.attributes?.['xml:base'] || null;
		if (xmlBase) {
			try {
				if (parentBaseUrl) {
					return new URL(xmlBase, parentBaseUrl).href;
				}
				return xmlBase;
			} catch (error) {
				// If the URL resolution fails then we don't
				// have a valid base URL
				return xmlBase;
			}
		}
		return parentBaseUrl;
	}

	/**
	 * Get the element children.
	 *
	 * @access public
	 * @type {Array<(Element | string)>}
	 */
	get children() {
		const rawChildren = this.rawElement[this.rawName];
		if (Array.isArray(rawChildren)) {
			return rawChildren.map(rawChild => {
				if (rawChild[Element.TEXT_PROPERTY]) {
					return rawChild[Element.TEXT_PROPERTY];
				}
				return Element.create(rawChild, this);
			});
		}
		return [];
	}

	/**
	 * Get the element name.
	 *
	 * @access public
	 * @type {string}
	 */
	get name() {
		const nameParts = this.rawName.toLowerCase().split(':');
		return (
			nameParts.length > 1 ?
				nameParts.slice(1).join(':') :
				nameParts[0]
		);
	}

	/**
	 * Get the element namespace.
	 *
	 * @access public
	 * @type {(string | symbol)}
	 */
	get namespace() {
		const nameParts = this.rawName.toLowerCase().split(':');
		return (
			nameParts.length > 1 && nameParts[0] ?
				nameParts[0] :
				Element.DEFAULT_NAMESPACE
		);
	}

	/**
	 * Get the element namespace declarations.
	 *
	 * @access public
	 * @type {Object<(string | symbol), string>}
	 */
	get namespaceDeclarations() {
		return {
			...this.parent?.namespaceDeclarations || {},
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
	 * Get the element namespace URI.
	 *
	 * @access public
	 * @type {(string | null)}
	 */
	get namespaceUri() {
		return this.namespaceDeclarations[this.namespace] || null;
	}

	/**
	 * Get the raw unmodified element name.
	 *
	 * @access private
	 * @type {string}
	 */
	get rawName() {
		const keys = Object.keys(this.rawElement).filter(key => {
			return !Element.SPECIAL_PROPERTIES.includes(key);
		});
		return keys[0] || 'unknown';
	}

	/**
	 * Get the flattened text content of an element.
	 *
	 * @access public
	 * @type {string}
	 */
	get textContent() {
		if (this.children.length) {
			return this.children.map(child => {
				if (typeof child === 'string') {
					return child;
				}
				return child.textContent;
			}).join('');
		}
		return '';
	}

	/**
	 * Get the flattened text content of an element as a Date object.
	 *
	 * @access public
	 * @type {(Date|null)}
	 */
	get textContentAsDate() {
		const date = new Date(this.textContent.trim());
		return (
			date instanceof Date && !isNaN(date.valueOf()) ?
				date :
				null
		);
	}

	/**
	 * Get the flattened text content of an element as a URL, resolved against the element base URL.
	 *
	 * @access public
	 * @type {string}
	 */
	get textContentAsUrl() {
		return this.resolveUrl(this.textContent.trim());
	}

	/**
	 * Get the flattened and whitespace-normalised text content of an element.
	 *
	 * @access public
	 * @type {string}
	 */
	get textContentNormalized() {
		return decodeEntities(this.textContent.trim().replace(/\s+/g, ' '));
	}

	/**
	 * Find all direct child elements with the given name.
	 *
	 * @access public
	 * @param {string} name
	 *     The name of the children to find.
	 * @returns {Array<Element>}
	 *     Returns a filtered list of child elements.
	 */
	findElementsWithName(name) {

		/**
		 * @param {(Element | string)} element
		 *     The element we're filtering based on.
		 * @returns {element is Element}
		 *     Returns whether the element has the given name.
		 */
		function hasName(element) {
			return (typeof element !== 'string' && element.name === name);
		}

		return this.children.filter(hasName);
	}

	/**
	 * Find the nth direct child element with the given name.
	 *
	 * @access public
	 * @param {string} name
	 *     The name of the child to find.
	 * @param {number} [nth=0]
	 *     The child to get. If zero or a positive number, then it will be the nth child found.
	 *     If a negative number, then it will be the nth last child.
	 * @returns {(Element|null)}
	 *     Returns the found child element or `null` if no matching child was found.
	 */
	findElementWithName(name, nth = 0) {
		return this.findElementsWithName(name).slice(nth)[0] || null;
	}

	/**
	 * Return whether a direct child element exists with the given name.
	 *
	 * @access public
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
	 * @access public
	 * @param {string} name
	 *     The attribute name to get.
	 * @returns {(string | null)}
	 *     Returns the attribute value or `null` if no attribute with the given name is set.
	 */
	getAttribute(name) {
		return this.attributes?.[name] || null;
	}

	/**
	 * Resolve a URL based on the element's base URL.
	 *
	 * @access public
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
		} catch (error) {}
		return url;
	}

	/**
	 * Get an attribute value as a URL, resolved against the element base URL.
	 *
	 * @access public
	 * @param {string} name
	 *     The attribute name to get.
	 * @returns {(string | null)}
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
	 * Create an element.
	 *
	 * @access private
	 * @param {object} rawFxpElement
	 *     The raw element representation output by {@link "https://github.com/NaturalIntelligence/fast-xml-parser"|fast-xml-parser}.
	 * @param {(Element|null)} [parent = null]
	 *     A parent element to inherit namespaces and base URLs from.
	 * @returns {Element}
	 *     Returns a created element.
	 */
	static create(rawFxpElement, parent) {
		return new this(rawFxpElement, parent);
	}

}

/**
 * @type {symbol}
 */
Element.DEFAULT_NAMESPACE = Symbol(':default');

/**
 * @type {string}
 */
Element.ATTRIBUTE_PROPERTY = ':@';

/**
 * @type {string}
 */
Element.TEXT_PROPERTY = '#text';

/**
 * @type {Array<string>}
 */
Element.SPECIAL_PROPERTIES = [
	Element.ATTRIBUTE_PROPERTY,
	Element.TEXT_PROPERTY
];

module.exports = Element;
