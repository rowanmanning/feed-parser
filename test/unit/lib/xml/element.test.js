'use strict';

const {assert} = require('chai');
const td = require('testdouble');

describe('lib/xml/element', () => {
	let Element;

	beforeEach(() => {
		Element = require('../../../../lib/xml/element');
	});

	it('is a class constructor', () => {
		assert.isFunction(Element);
		assert.isFunction(Element.prototype.constructor);
	});

	describe('new Element(rawFxpElement, nsDeclarations)', () => {
		let element;
		let mockRawElement;

		beforeEach(() => {
			mockRawElement = {
				MOCK: [],
				':@': {},
				'#text': ''
			};

			td.replace(Element, 'findElementName');
			td.when(Element.findElementName(mockRawElement)).thenReturn({
				namespace: Element.DEFAULT_NAMESPACE,
				name: 'mock-name',
				originalName: 'MOCK-RAW-NAME'
			});

			td.replace(Element, 'findElementAttributes');
			td.when(Element.findElementAttributes(mockRawElement)).thenReturn('mock-attributes');

			td.replace(Element, 'findNamespaceDeclarations');
			td.when(Element.findNamespaceDeclarations('mock-attributes')).thenReturn({
				'mock-ns': 'mock-element-namespace-uri'
			});

			td.replace(Element, 'findElementChildren');
			td.when(Element.findElementChildren(mockRawElement, 'MOCK-RAW-NAME', td.matchers.isA(Object))).thenReturn('mock-children');

			element = new Element(mockRawElement);
		});

		it('finds the element name', () => {
			td.verify(Element.findElementName(mockRawElement), {times: 1});
		});

		it('finds the element attributes', () => {
			td.verify(Element.findElementAttributes(mockRawElement), {times: 1});
		});

		it('finds the element namespace declarations', () => {
			td.verify(Element.findNamespaceDeclarations('mock-attributes'), {times: 1});
		});

		it('finds the element children', () => {
			td.verify(Element.findElementChildren(mockRawElement, 'MOCK-RAW-NAME', {
				'mock-ns': 'mock-element-namespace-uri'
			}), {times: 1});
		});

		describe('.name', () => {

			it('is set to the element name', () => {
				assert.strictEqual(element.name, 'mock-name');
			});

		});

		describe('.namespace', () => {

			it('is set to the default namespace', () => {
				assert.strictEqual(element.namespace, Element.DEFAULT_NAMESPACE);
			});

		});

		describe('.namespaceUri', () => {

			it('is set to an empty string', () => {
				assert.strictEqual(element.namespaceUri, '');
			});

		});

		describe('.children', () => {

			it('is set to the element children', () => {
				assert.strictEqual(element.children, 'mock-children');
			});

		});

		describe('.findElementsWithName(name)', () => {
			let returnValue;

			beforeEach(() => {
				element.children = [
					{
						name: 'mock-name-1',
						index: 0
					},
					{
						name: 'mock-name-2',
						index: 1
					},
					'mock-text-1',
					{
						name: 'mock-name-1',
						index: 3
					},
					{
						name: 'mock-name-3',
						index: 4
					},
					'mock-text-2'
				];
				returnValue = element.findElementsWithName('mock-name-1');
			});

			it('returns the expected array of child elements', () => {
				assert.deepEqual(returnValue, [
					{
						name: 'mock-name-1',
						index: 0
					},
					{
						name: 'mock-name-1',
						index: 3
					}
				]);
			});

		});

		describe('.findElementWithName(name, nth)', () => {
			let returnValue;

			beforeEach(() => {
				element.children = [
					{
						name: 'mock-name-1',
						index: 0
					},
					{
						name: 'mock-name-2',
						index: 1
					},
					'mock-text-1',
					{
						name: 'mock-name-1',
						index: 3
					},
					{
						name: 'mock-name-3',
						index: 4
					},
					'mock-text-2',
					{
						name: 'mock-name-1',
						index: 6
					}
				];
				returnValue = element.findElementWithName('mock-name-1');
			});

			it('returns the first element with the given name', () => {
				assert.strictEqual(returnValue, element.children[0]);
			});

			describe('when `nth` is set to a positive number', () => {

				beforeEach(() => {
					returnValue = element.findElementWithName('mock-name-1', 1);
				});

				it('returns the nth element with the given name', () => {
					assert.strictEqual(returnValue, element.children[3]);
				});

			});

			describe('when `nth` is set to a negative number', () => {

				beforeEach(() => {
					returnValue = element.findElementWithName('mock-name-1', -1);
				});

				it('returns the nth last element with the given name', () => {
					assert.strictEqual(returnValue, element.children[6]);
				});

			});

			describe('when the element has no children with the given name', () => {

				beforeEach(() => {
					element.children = [
						{
							name: 'mock-name-0',
							index: 0
						},
						{
							name: 'mock-name-2',
							index: 1
						},
						'mock-text-1'
					];
					returnValue = element.findElementWithName('mock-name-1');
				});

				it('returns `null`', () => {
					assert.isNull(returnValue);
				});

			});

		});

		describe('.hasElementWithName(name)', () => {
			let returnValue;

			beforeEach(() => {
				element.children = [
					{
						name: 'mock-name-1',
						index: 0
					},
					{
						name: 'mock-name-2',
						index: 1
					},
					'mock-text-1'
				];
				returnValue = element.hasElementWithName('mock-name-1');
			});

			it('returns `true`', () => {
				assert.isTrue(returnValue);
			});

			describe('when the element has no children with the given name', () => {

				beforeEach(() => {
					element.children = [
						{
							name: 'mock-name-0',
							index: 0
						},
						{
							name: 'mock-name-2',
							index: 1
						},
						'mock-text-1'
					];
					returnValue = element.hasElementWithName('mock-name-1');
				});

				it('returns `false`', () => {
					assert.isFalse(returnValue);
				});

			});

		});

		describe('.getAttribute(name)', () => {
			let returnValue;

			beforeEach(() => {
				element.attributes = {
					'mock-name': 'mock-value'
				};
				returnValue = element.getAttribute('mock-name');
			});

			it('returns the requested attribute value', () => {
				assert.strictEqual(returnValue, 'mock-value');
			});

			describe('when the element has no attribute with the given name', () => {

				beforeEach(() => {
					returnValue = element.getAttribute('not-a-name');
				});

				it('returns `null`', () => {
					assert.isNull(returnValue);
				});

			});

		});

		describe('.textContent', () => {
			let returnValue;

			beforeEach(() => {
				element.children = [
					{
						textContent: 'mock text 1'
					},
					{
						textContent: 'mock text 2'
					},
					'mock text 3'
				];
				returnValue = element.textContent;
			});

			it('returns the joined text content of each child element', () => {
				assert.strictEqual(returnValue, 'mock text 1mock text 2mock text 3');
			});

			describe('when the text content is padded with whitespace', () => {

				beforeEach(() => {
					element.children = [
						{
							textContent: ' mock text 1\t\n'
						},
						{
							textContent: '\tmock text 2  \n'
						},
						'mock text 3 '
					];
					returnValue = element.textContent;
				});

				it('does not get trimmed or modified', () => {
					assert.strictEqual(returnValue, ' mock text 1\t\n\tmock text 2  \nmock text 3 ');
				});

			});

			describe('when the element has no children', () => {

				beforeEach(() => {
					element.children = [];
					returnValue = element.textContent;
				});

				it('returns an empty string', () => {
					assert.strictEqual(returnValue, '');
				});

			});

		});

		describe('.normalizedTextContent', () => {
			let returnValue;

			beforeEach(() => {
				element.children = [
					{
						textContent: ' mock text 1\t\n'
					},
					{
						textContent: '\tmock text 2  \n'
					},
					'mock text 3 '
				];
				returnValue = element.normalizedTextContent;
			});

			it('returns a trimmed joined text content with adjacent whitespace condensed', () => {
				assert.strictEqual(returnValue, 'mock text 1 mock text 2 mock text 3');
			});

		});

		describe('when a non-default namespace is found in the element name', () => {

			beforeEach(() => {
				delete mockRawElement.MOCK;
				mockRawElement['MOCK-NS:MOCK'] = [];

				td.when(Element.findElementName(mockRawElement)).thenReturn({
					namespace: 'mock-ns',
					name: 'mock-name',
					originalName: 'MOCK-RAW-NAME'
				});

				element = new Element(mockRawElement);
			});

			describe('.namespace', () => {

				it('is set to the element namespace', () => {
					assert.strictEqual(element.namespace, 'mock-ns');
				});

			});

			describe('.namespaceUri', () => {

				it('is set to the matching namespace URI', () => {
					assert.strictEqual(element.namespaceUri, 'mock-element-namespace-uri');
				});

			});

		});

		describe('when nsDeclarations contains namespace declarations and the element matches one of them', () => {

			beforeEach(() => {
				delete mockRawElement.MOCK;
				mockRawElement['MOCK-PARENT-NS:MOCK'] = [];

				td.when(Element.findElementName(mockRawElement)).thenReturn({
					namespace: 'mock-parent-ns',
					name: 'mock-name',
					originalName: 'MOCK-RAW-NAME'
				});

				element = new Element(mockRawElement, {
					'mock-parent-ns': 'mock-parent-namespace-uri'
				});
			});

			describe('.namespace', () => {

				it('is set to the element namespace', () => {
					assert.strictEqual(element.namespace, 'mock-parent-ns');
				});

			});

			describe('.namespaceUri', () => {

				it('is set to the matching parent namespace URI', () => {
					assert.strictEqual(element.namespaceUri, 'mock-parent-namespace-uri');
				});

			});

		});

		describe('when nsDeclarations and the element declare the same namespaces', () => {

			beforeEach(() => {
				delete mockRawElement.MOCK;
				mockRawElement['MOCK-NS:MOCK'] = [];

				td.when(Element.findElementName(mockRawElement)).thenReturn({
					namespace: 'mock-ns',
					name: 'mock-name',
					originalName: 'MOCK-RAW-NAME'
				});

				element = new Element(mockRawElement, {
					'mock-ns': 'mock-parent-namespace-uri'
				});
			});

			describe('.namespace', () => {

				it('is set to the element namespace', () => {
					assert.strictEqual(element.namespace, 'mock-ns');
				});

			});

			describe('.namespaceUri', () => {

				it('is set to the matching element namespace URI', () => {
					assert.strictEqual(element.namespaceUri, 'mock-element-namespace-uri');
				});

			});

		});

	});

	describe('Element.findElementName(rawFxpElement)', () => {
		let returnValue;

		beforeEach(() => {
			returnValue = Element.findElementName({
				MOCK: [],
				':@': {},
				'#text': ''
			});
		});

		it('returns the name (lower-cased), the original name, and the default namespace', () => {
			assert.deepEqual(returnValue, {
				name: 'mock',
				originalName: 'MOCK',
				namespace: Element.DEFAULT_NAMESPACE
			});
		});

		describe('when the element name is namespaced', () => {

			beforeEach(() => {
				returnValue = Element.findElementName({
					'MOCK-NS:MOCK-NAME': [],
					':@': {},
					'#text': ''
				});
			});

			it('returns the name (lower-cased), the original name, and the namespace (lower-cased)', () => {
				assert.deepEqual(returnValue, {
					name: 'mock-name',
					originalName: 'MOCK-NS:MOCK-NAME',
					namespace: 'mock-ns'
				});
			});

		});

		describe('when the element name starts with a colon', () => {

			beforeEach(() => {
				returnValue = Element.findElementName({
					':MOCK-NAME': [],
					':@': {},
					'#text': ''
				});
			});

			it('returns the name (lower-cased), the original name, and the default namespace', () => {
				assert.deepEqual(returnValue, {
					name: 'mock-name',
					originalName: ':MOCK-NAME',
					namespace: Element.DEFAULT_NAMESPACE
				});
			});

		});

		describe('when the element name ends with a colon', () => {

			beforeEach(() => {
				returnValue = Element.findElementName({
					'MOCK-NS:': [],
					':@': {},
					'#text': ''
				});
			});

			it('returns an empty name, the original name, and the namespace (lower-cased)', () => {
				assert.deepEqual(returnValue, {
					name: '',
					originalName: 'MOCK-NS:',
					namespace: 'mock-ns'
				});
			});

		});

		describe('when the element contains multiple colons', () => {

			beforeEach(() => {
				returnValue = Element.findElementName({
					'MOCK-NS:MOCK-NAME:THIS-IS-VALID': [],
					':@': {},
					'#text': ''
				});
			});

			it('returns an empty name, the original name, and the namespace (lower-cased)', () => {
				assert.deepEqual(returnValue, {
					name: 'mock-name:this-is-valid',
					originalName: 'MOCK-NS:MOCK-NAME:THIS-IS-VALID',
					namespace: 'mock-ns'
				});
			});

		});

		describe('when the element does not have a name', () => {

			beforeEach(() => {
				returnValue = Element.findElementName({
					':@': {},
					'#text': ''
				});
			});

			it('returns a name and original name of "unknown" and the default namespace', () => {
				assert.deepEqual(returnValue, {
					name: 'unknown',
					originalName: 'unknown',
					namespace: Element.DEFAULT_NAMESPACE
				});
			});

		});

	});

	describe('Element.findElementAttributes(rawFxpElement)', () => {
		let returnValue;

		beforeEach(() => {
			returnValue = Element.findElementAttributes({
				':@': {
					attr1: 'mock-attribute-value-1',
					attr2: 'mock-attribute-value-2',
					ATTR3: 'mock-attribute-value-3'
				}
			});
		});

		it('returns the attributes with property names lower-cased', () => {
			assert.deepEqual(returnValue, {
				attr1: 'mock-attribute-value-1',
				attr2: 'mock-attribute-value-2',
				attr3: 'mock-attribute-value-3'
			});
		});

		describe('When there is no attributes property on the raw element', () => {

			beforeEach(() => {
				returnValue = Element.findElementAttributes({});
			});

			it('returns an empty object', () => {
				assert.deepEqual(returnValue, {});
			});

		});

	});

	describe('Element.findElementChildren(rawFxpElement, elementName, nsDeclarations)', () => {
		let returnValue;
		let mockRawElement;

		beforeEach(() => {
			td.replace(Element, 'create');
			td.when(Element.create(), {ignoreExtraArgs: true}).thenReturn(
				'mock-element-1',
				'mock-element-2'
			);
			mockRawElement = {
				MOCK: [
					{
						'mock-child-1': []
					},
					{
						'mock-child-2': []
					},
					{
						'#text': 'mock-text-1'
					}
				],
				':@': {}
			};
			returnValue = Element.findElementChildren(mockRawElement, 'MOCK', {
				'mock-ns': 'mock-ns-uri'
			});
		});

		it('creates Element instances for all non text nodes found', () => {
			td.verify(Element.create({
				'mock-child-1': []
			}, {
				'mock-ns': 'mock-ns-uri'
			}), {times: 1});
			td.verify(Element.create({
				'mock-child-2': []
			}, {
				'mock-ns': 'mock-ns-uri'
			}), {times: 1});
		});

		it('returns an array of Element instances (for elements) and strings (for text nodes)', () => {
			assert.deepEqual(returnValue, [
				'mock-element-1',
				'mock-element-2',
				'mock-text-1'
			]);
		});

		describe('when the element has no children', () => {

			beforeEach(() => {
				returnValue = Element.findElementChildren({}, 'MOCK', {
					'mock-ns': 'mock-ns-uri'
				});
			});

			it('returns an empty array', () => {
				assert.deepEqual(returnValue, []);
			});

		});

	});

	describe('Element.findNamespaceDeclarations(attributes)', () => {
		let returnValue;

		beforeEach(() => {
			returnValue = Element.findNamespaceDeclarations({
				attr: 'mock-attribute-value',
				xmlns: 'mock-xml-namespace',
				'xmlns:mock-ns': 'mock-named-xml-namespace'
			});
		});

		it('returns the namespace data', () => {
			assert.deepEqual(returnValue, {
				[Element.DEFAULT_NAMESPACE]: 'mock-xml-namespace',
				'mock-ns': 'mock-named-xml-namespace'
			});
		});

		describe('when namespace URIs are padded with spaces', () => {

			beforeEach(() => {
				returnValue = Element.findNamespaceDeclarations({
					attr: 'mock-attribute-value',
					xmlns: '   mock-xml-namespace   ',
					'xmlns:mock-ns': '\n\t\tmock-named-xml-namespace\n\n'
				});
			});

			it('returns the namespace data', () => {
				assert.deepEqual(returnValue, {
					[Element.DEFAULT_NAMESPACE]: 'mock-xml-namespace',
					'mock-ns': 'mock-named-xml-namespace'
				});
			});

		});

	});

	describe('Element.create(rawFxpElement, nsDeclarations)', () => {
		let returnValue;

		beforeEach(() => {
			returnValue = Element.create({
				MOCK: [],
				':@': {},
				'#text': ''
			}, {
				'mock-ns': 'mock-ns-uri'
			});
		});

		it('creates and returns an element', () => {
			assert.instanceOf(returnValue, Element);
		});

	});

});
