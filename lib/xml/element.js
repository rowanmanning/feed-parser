'use strict';

/**
 * Class representing an XML element.
 */
class Element {

	/**
	 * Class constructor.
	 *
	 * @access public
	 * @param {Object} rawFxpElement
	 *     The raw element representation output by {@link "https://github.com/NaturalIntelligence/fast-xml-parser"|fast-xml-parser}.
	 * @param {Object<String, String>} [nsDeclarations = {}]
	 *     Key/value pairs of namespace declarations.
	 */
	constructor(rawFxpElement, nsDeclarations = {}) {

		const {namespace, name, originalName} = Element.findElementName(rawFxpElement);

		/**
		 * @type {String}
		 */
		this.name = name;

		/**
		 * @type {Object<String, String>}
		 */
		this.attributes = Element.findElementAttributes(rawFxpElement);

		// Get the namespace declarations and set element namespace data
		nsDeclarations = Object.assign(
			nsDeclarations,
			Element.findNamespaceDeclarations(this.attributes)
		);

		/**
		 * @type {(String|Symbol)}
		 */
		this.namespace = namespace;

		/**
		 * @type {String}
		 */
		// @ts-ignore
		this.namespaceUri = nsDeclarations[namespace] || '';

		/**
		 * @type {ElementChildren}
		 */
		this.children = Element.findElementChildren(
			rawFxpElement,
			originalName,
			nsDeclarations
		);
	}

	/**
	 * Find all direct child elements with the given name.
	 *
	 * @access public
	 * @param {String} name
	 *     The name of the children to find.
	 * @returns {Array<Element>}
	 *     Returns a filtered list of child elements.
	 */
	findElementsWithName(name) {

		/**
		 * @param {(Element|String)} element
		 * @returns {element is Element}
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
	 * @param {String} name
	 *     The name of the child to find.
	 * @param {Number} [nth=0]
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
	 * @param {String} name
	 *     The name to check for.
	 * @returns {Boolean}
	 *     Returns `true` if a child with the given name is found, and `false` otherwise.
	 */
	hasElementWithName(name) {
		return Boolean(this.findElementsWithName(name).length);
	}

	/**
	 * Get an attribute value.
	 *
	 * @access public
	 * @param {String} name
	 *     The attribute name to get.
	 * @returns {(String|null)}
	 *     Returns the attribute value or `null` if no attribute with the given name is set.
	 */
	getAttribute(name) {
		return this.attributes?.[name] || null;
	}

	/**
	 * Get the flattened text content of an element.
	 *
	 * @access public
	 * @type {String}
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
	 * Get the flattened and whitespace-normalised text content of an element.
	 *
	 * @access public
	 * @type {String}
	 */
	get normalizedTextContent() {
		return this.textContent.trim().replace(/\s+/g, ' ');
	}

	/**
	 * Find the element name and namespace from a fast-xml-parser element.
	 *
	 * @access private
	 * @param {Object} rawFxpElement
	 *     The raw element representation output by {@link "https://github.com/NaturalIntelligence/fast-xml-parser"|fast-xml-parser}.
	 * @returns {ElementNameComponents}
	 *     Returns the parts of the name.
	 */
	static findElementName(rawFxpElement) {
		const keys = Object.keys(rawFxpElement)
			.filter(key => !this.SPECIAL_PROPERTIES.includes(key));
		const originalName = keys[0] || 'unknown';
		if (originalName.includes(':')) {
			const nameParts = originalName.split(':');
			return {
				namespace: nameParts.shift().toLowerCase() || Element.DEFAULT_NAMESPACE,
				name: nameParts.join(':').toLowerCase(),
				originalName
			};
		}
		return {
			namespace: Element.DEFAULT_NAMESPACE,
			name: originalName.toLowerCase(),
			originalName
		};
	}

	/**
	 * Find the element attributes from a fast-xml-parser element.
	 *
	 * @access private
	 * @param {Object} rawFxpElement
	 *     The raw element representation output by {@link "https://github.com/NaturalIntelligence/fast-xml-parser"|fast-xml-parser}.
	 * @returns {Object<String, String>}
	 *     Returns the element attributes.
	 */
	static findElementAttributes(rawFxpElement) {
		if (!rawFxpElement[Element.ATTRIBUTE_PROPERTY]) {
			return {};
		}
		return Object.fromEntries(
			Object.entries(rawFxpElement[Element.ATTRIBUTE_PROPERTY]).map(([key, value]) => {
				return [key.toLowerCase(), value];
			})
		);
	}

	/**
	 * Find the element children from a fast-xml-parser element.
	 *
	 * @access private
	 * @param {Object} rawFxpElement
	 *     The raw element representation output by {@link "https://github.com/NaturalIntelligence/fast-xml-parser"|fast-xml-parser}.
	 * @param {String} elementName
	 *     The element name.
	 * @param {Object<String, String>} nsDeclarations
	 *     Namespace declarations to pass onto child elements.
	 * @returns {ElementChildren}
	 *     Returns the children as Elements and text nodes as strings.
	 */
	static findElementChildren(rawFxpElement, elementName, nsDeclarations) {
		const rawChildren = rawFxpElement[elementName];
		if (Array.isArray(rawChildren)) {
			return rawChildren.map(rawFxpChild => {
				if (rawFxpChild[this.TEXT_PROPERTY]) {
					return rawFxpChild[this.TEXT_PROPERTY];
				}
				return Element.create(rawFxpChild, Object.assign({}, nsDeclarations));
			});
		}
		return [];
	}

	/**
	 * Find the element namespace declarations from attributes.
	 *
	 * @access private
	 * @param {Object<String, String>} attributes
	 *     The element attributes.
	 * @returns {Object<String, String>}
	 *     Returns the element namespace declarations.
	 */
	static findNamespaceDeclarations(attributes) {
		return Object.fromEntries(
			Object.entries(attributes)
				.filter(([key]) => key === 'xmlns' || key.startsWith('xmlns:'))
				.map(([key, value]) => {
					if (key === 'xmlns') {
						return [Element.DEFAULT_NAMESPACE, value?.trim()];
					}
					return [key.replace(/^xmlns:/, ''), value?.trim()];
				})
		);
	}

	/**
	 * Create an element.
	 *
	 * @access private
	 * @param {Object} rawFxpElement
	 *     The raw element representation output by {@link "https://github.com/NaturalIntelligence/fast-xml-parser"|fast-xml-parser}.
	 * @param {Object<String, String>} [nsDeclarations = {}]
	 *     Key/value pairs of namespace declarations.
	 * @returns {Element}
	 *     Returns a created element.
	 */
	static create(rawFxpElement, nsDeclarations) {
		return new this(rawFxpElement, nsDeclarations);
	}

}

/**
 * @type {Symbol}
 */
Element.DEFAULT_NAMESPACE = Symbol(':default');

/**
 * @type {String}
 */
Element.ATTRIBUTE_PROPERTY = ':@';

/**
 * @type {String}
 */
Element.TEXT_PROPERTY = '#text';

/**
 * @type {Array<String>}
 */
Element.SPECIAL_PROPERTIES = [
	Element.ATTRIBUTE_PROPERTY,
	Element.TEXT_PROPERTY
];

module.exports = Element;

/**
 * @typedef {Object} ElementNameComponents
 * @property {(String|Symbol)} namespace
 * @property {String} name
 * @property {String} originalName
 */

/**
 * @typedef {Array<(Element|String)>} ElementChildren
 */
