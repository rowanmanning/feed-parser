'use strict';

const { afterEach, beforeEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const td = require('testdouble');

td.config({ ignoreWarnings: true });

describe('lib/xml/element', () => {
	let Element;
	let fastXmlParser;
	let htmlEntities;

	beforeEach(() => {
		fastXmlParser = td.replace(
			'fast-xml-parser',
			require('../../mock/npm/fast-xml-parser.mock').createMock()
		);
		htmlEntities = td.replace(
			'html-entities',
			require('../../mock/npm/html-entities.mock').createMock()
		);
		Element = require('../../../../lib/xml/element').Element;
	});

	afterEach(() => td.reset());

	it('creates a new XML Builder', () => {
		td.verify(
			new fastXmlParser.XMLBuilder({
				attributeNamePrefix: '',
				ignoreAttributes: false,
				preserveOrder: true
			}),
			{ times: 1 }
		);
	});

	it('is a class constructor', () => {
		assert.strictEqual(typeof Element, 'function');
		assert.strictEqual(typeof Element.prototype.constructor, 'function');
	});

	describe('new Element(rawFxpElement, parent)', () => {
		let element;
		let mockRawElement;

		beforeEach(() => {
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
				':@': {
					attr1: 'mock-attribute-value-1',
					attr2: 'mock-attribute-value-2',
					ATTR3: 'mock-attribute-value-3'
				},
				'#text': ''
			};

			// Replace Element.create so that we don't cover code we don't intend to
			td.replace(Element, 'create');
			td.when(Element.create(), { ignoreExtraArgs: true }).thenReturn(
				'mock-element-1',
				'mock-element-2'
			);

			element = new Element(mockRawElement);
		});

		describe('.attributes', () => {
			it('is set to the element attributes with property names lower-cased', () => {
				assert.deepEqual(element.attributes, {
					attr1: 'mock-attribute-value-1',
					attr2: 'mock-attribute-value-2',
					attr3: 'mock-attribute-value-3'
				});
			});

			describe('when the element has no attributes property', () => {
				beforeEach(() => {
					element = new Element({
						MOCK: [],
						'#text': ''
					});
				});

				it('is set to an empty object', () => {
					assert.deepEqual(element.attributes, {});
				});
			});
		});

		describe('.baseUrl', () => {
			it('is set to `null`', () => {
				assert.strictEqual(element.baseUrl, null);
			});

			describe('when the element has an absolute `xml:base` attribute', () => {
				beforeEach(() => {
					element = new Element({
						MOCK: [],
						':@': {
							'xml:base': 'https://mock-base/'
						}
					});
				});

				it('is set to the xml:base URL', () => {
					assert.deepEqual(element.baseUrl, 'https://mock-base/');
				});

				describe('when the element parent has a defined base URL', () => {
					beforeEach(() => {
						const mockParent = {
							baseUrl: 'https://mock-parent-base/'
						};
						element = new Element(
							{
								MOCK: [],
								':@': {
									'xml:base': 'https://mock-base/'
								}
							},
							mockParent
						);
					});

					it('is set to the xml:base URL', () => {
						assert.deepEqual(element.baseUrl, 'https://mock-base/');
					});
				});
			});

			describe('when the element has a relative `xml:base` attribute', () => {
				beforeEach(() => {
					element = new Element({
						MOCK: [],
						':@': {
							'xml:base': './mock-path'
						}
					});
				});

				it('is set to the xml:base URL', () => {
					assert.deepEqual(element.baseUrl, './mock-path');
				});

				describe('when the element parent has a defined base URL', () => {
					beforeEach(() => {
						const mockParent = {
							baseUrl: 'https://mock-parent-base/mock-parent-path/'
						};
						element = new Element(
							{
								MOCK: [],
								':@': {
									'xml:base': './mock-path'
								}
							},
							mockParent
						);
					});

					it('is set to the xml:base URL resolved with the parent element base URL', () => {
						assert.deepEqual(
							element.baseUrl,
							'https://mock-parent-base/mock-parent-path/mock-path'
						);
					});

					describe('when URL resolution fails', () => {
						beforeEach(() => {
							const mockParent = {
								baseUrl: { isInvalid: true }
							};
							element = new Element(
								{
									MOCK: [],
									':@': {
										'xml:base': './mock-path'
									}
								},
								mockParent
							);
						});

						it('is set to the xml:base URL', () => {
							assert.deepEqual(element.baseUrl, './mock-path');
						});
					});
				});
			});

			describe('when the element has no `xml:base` attribute but the parent element does', () => {
				beforeEach(() => {
					const mockParent = {
						baseUrl: 'https://mock-parent-base/'
					};
					element = new Element(
						{
							MOCK: [],
							':@': {}
						},
						mockParent
					);
				});

				it('is set to the parent element base URL', () => {
					assert.deepEqual(element.baseUrl, 'https://mock-parent-base/');
				});
			});
		});

		describe('.children', () => {
			let children;

			beforeEach(() => {
				children = element.children;
			});

			it('is set to an array of Element instances (for elements) and strings (for text nodes)', () => {
				assert.deepEqual(children, ['mock-element-1', 'mock-element-2', 'mock-text-1']);
			});

			it('creates Element instances with `this` as a parent for all non text nodes found', () => {
				td.verify(Element.create({ 'mock-child-1': [] }, element));
				td.verify(Element.create({ 'mock-child-2': [] }, element));
			});

			describe('when the element has non-string children', () => {
				beforeEach(() => {
					element = new Element({
						MOCK: [{ '#text': 123 }]
					});
				});

				it('converts them to a string', () => {
					assert.deepEqual(element.children, ['123']);
				});
			});

			describe('when the element has no children', () => {
				beforeEach(() => {
					element = new Element({});
				});

				it('is set to an empty array', () => {
					assert.deepEqual(element.children, []);
				});
			});
		});

		describe('.name', () => {
			it('is set to the element name lower-cased', () => {
				assert.strictEqual(element.name, 'mock');
			});

			describe('when the element name is namespaced', () => {
				beforeEach(() => {
					element = new Element({
						'MOCK-NS:MOCK-NAME': [],
						':@': {},
						'#text': ''
					});
				});

				it('is set to the element name lower-cased without the namespace', () => {
					assert.strictEqual(element.name, 'mock-name');
				});
			});

			describe('when the element name starts with a colon', () => {
				beforeEach(() => {
					element = new Element({
						':MOCK-NAME': [],
						':@': {},
						'#text': ''
					});
				});

				it('is set to the element name lower-cased without the colon', () => {
					assert.strictEqual(element.name, 'mock-name');
				});
			});

			describe('when the element name ends with a colon', () => {
				beforeEach(() => {
					element = new Element({
						'MOCK-NS:': [],
						':@': {},
						'#text': ''
					});
				});

				it('is set to an empty string', () => {
					assert.strictEqual(element.name, '');
				});
			});

			describe('when the element contains multiple colons', () => {
				beforeEach(() => {
					element = new Element({
						'MOCK-NS:MOCK-NAME:THIS-IS-VALID': [],
						':@': {},
						'#text': ''
					});
				});

				it('is set to the element name lower-cased with the namespace removed', () => {
					assert.strictEqual(element.name, 'mock-name:this-is-valid');
				});
			});

			describe('when the element does not have a name', () => {
				beforeEach(() => {
					element = new Element({
						':@': {},
						'#text': ''
					});
				});

				it('is set to "unknown"', () => {
					assert.strictEqual(element.name, 'unknown');
				});
			});
		});

		describe('.namespace', () => {
			it('is set to the default namespace', () => {
				assert.strictEqual(element.namespace, Element.DEFAULT_NAMESPACE);
			});

			describe('when the element name is namespaced', () => {
				beforeEach(() => {
					element = new Element({
						'MOCK-NS:MOCK-NAME': [],
						':@': {},
						'#text': ''
					});
				});

				it('is set to the element namespace lower-cased', () => {
					assert.strictEqual(element.namespace, 'mock-ns');
				});
			});

			describe('when the element name starts with a colon', () => {
				beforeEach(() => {
					element = new Element({
						':MOCK-NAME': [],
						':@': {},
						'#text': ''
					});
				});

				it('is set to the default namespace', () => {
					assert.strictEqual(element.namespace, Element.DEFAULT_NAMESPACE);
				});
			});

			describe('when the element name ends with a colon', () => {
				beforeEach(() => {
					element = new Element({
						'MOCK-NS:': [],
						':@': {},
						'#text': ''
					});
				});

				it('is set to the element namespace lower-cased', () => {
					assert.strictEqual(element.namespace, 'mock-ns');
				});
			});

			describe('when the element contains multiple colons', () => {
				beforeEach(() => {
					element = new Element({
						'MOCK-NS:MOCK-NAME:THIS-IS-VALID': [],
						':@': {},
						'#text': ''
					});
				});

				it('is set to the element namespace lower-cased', () => {
					assert.strictEqual(element.namespace, 'mock-ns');
				});
			});

			describe('when the element does not have a name', () => {
				beforeEach(() => {
					element = new Element({
						':@': {},
						'#text': ''
					});
				});

				it('is set to the default namespace', () => {
					assert.strictEqual(element.namespace, Element.DEFAULT_NAMESPACE);
				});
			});
		});

		describe('.namespaceDeclarations', () => {
			it('is set to an empty object', () => {
				assert.deepEqual(element.namespaceDeclarations, {});
			});

			describe('when the element has namespace attributes declared', () => {
				beforeEach(() => {
					element = new Element({
						'MOCK-NAME': [],
						':@': {
							attr: 'mock-attribute-value',
							xmlns: 'mock-xml-namespace',
							'xmlns:mock-ns': 'mock-named-xml-namespace'
						},
						'#text': ''
					});
				});

				it('is set to the namespace declarations', () => {
					assert.deepEqual(element.namespaceDeclarations, {
						[Element.DEFAULT_NAMESPACE]: 'mock-xml-namespace',
						'mock-ns': 'mock-named-xml-namespace'
					});
				});

				describe('when namespace URIs are padded with spaces', () => {
					beforeEach(() => {
						element = new Element({
							'MOCK-NAME': [],
							':@': {
								attr: 'mock-attribute-value',
								xmlns: '   mock-xml-namespace   ',
								'xmlns:mock-ns': '\n\t\tmock-named-xml-namespace\n\n'
							},
							'#text': ''
						});
					});

					it('is set to the trimmed namespace declarations', () => {
						assert.deepEqual(element.namespaceDeclarations, {
							[Element.DEFAULT_NAMESPACE]: 'mock-xml-namespace',
							'mock-ns': 'mock-named-xml-namespace'
						});
					});
				});

				describe('when the element is constructed with a parent element', () => {
					let mockParent;

					beforeEach(() => {
						mockRawElement = {
							'MOCK-NAME': [],
							':@': {
								attr: 'mock-attribute-value',
								xmlns: 'mock-child-xml-namespace',
								'xmlns:mock-child-ns': 'mock-named-child-xml-namespace',
								'xmlns:mock-clashing-ns': 'mock-child-clashing-xml-namespace'
							},
							'#text': ''
						};
						mockParent = {
							namespaceDeclarations: {
								[Element.DEFAULT_NAMESPACE]: 'mock-parent-xml-namespace',
								'mock-parent-ns': 'mock-named-parent-xml-namespace',
								'mock-clashing-ns': 'mock-parent-clashing-xml-namespace'
							}
						};
						element = new Element(mockRawElement, mockParent);
					});

					it('is set to merged namespace declarations, favouring those defined on the child element', () => {
						assert.deepEqual(element.namespaceDeclarations, {
							[Element.DEFAULT_NAMESPACE]: 'mock-child-xml-namespace',
							'mock-child-ns': 'mock-named-child-xml-namespace',
							'mock-parent-ns': 'mock-named-parent-xml-namespace',
							'mock-clashing-ns': 'mock-child-clashing-xml-namespace'
						});
					});
				});
			});
		});

		describe('.namespaceUri', () => {
			it('is set to `null`', () => {
				assert.strictEqual(element.namespaceUri, null);
			});

			describe('when the element has a default namespace declaration', () => {
				beforeEach(() => {
					element = new Element({
						'MOCK-NAME': [],
						':@': {
							xmlns: 'mock-ns-uri'
						},
						'#text': ''
					});
				});

				it('is set to the default namespace URI', () => {
					assert.strictEqual(element.namespaceUri, 'mock-ns-uri');
				});
			});

			describe('when the element has namespace declarations and the element is namespaced with one', () => {
				beforeEach(() => {
					element = new Element({
						'MOCK-NS:MOCK-NAME': [],
						':@': {
							'xmlns:mock-ns': 'mock-ns-uri'
						},
						'#text': ''
					});
				});

				it('is set to the matching namespace URI', () => {
					assert.strictEqual(element.namespaceUri, 'mock-ns-uri');
				});
			});

			describe('when the element is constructed with a parent element that declares namespaces', () => {
				let mockParent;

				beforeEach(() => {
					mockParent = {
						namespaceDeclarations: {
							'mock-ns': 'mock-parent-ns-uri'
						}
					};
					element = new Element(
						{
							'MOCK-NS:MOCK-NAME': [],
							':@': {},
							'#text': ''
						},
						mockParent
					);
				});

				it('is set to the matching parent namespace URI', () => {
					assert.strictEqual(element.namespaceUri, 'mock-parent-ns-uri');
				});
			});
		});

		describe('.parent', () => {
			it('is set to `null`', () => {
				assert.strictEqual(element.parent, null);
			});

			describe('when the element is constructed with a parent element', () => {
				let mockParent;

				beforeEach(() => {
					mockParent = {
						isMockParent: true
					};
					element = new Element(mockRawElement, mockParent);
				});

				it('is set to the parent element', () => {
					assert.strictEqual(element.parent, mockParent);
				});
			});
		});

		describe('.textContent', () => {
			let childrenGetter;

			beforeEach(() => {
				childrenGetter = td.func();
				td.when(childrenGetter()).thenReturn([
					{
						textContent: 'mock text 1'
					},
					{
						textContent: 'mock text 2'
					},
					'mock text 3'
				]);
				Object.defineProperty(element, 'children', { get: childrenGetter });
			});

			it('is set to the joined text content of each child element', () => {
				assert.strictEqual(element.textContent, 'mock text 1mock text 2mock text 3');
			});

			describe('when the text content is padded with whitespace', () => {
				beforeEach(() => {
					td.when(childrenGetter()).thenReturn([
						{
							textContent: ' mock text 1\t\n'
						},
						{
							textContent: '\tmock text 2  \n'
						},
						'mock text 3 '
					]);
				});

				it('does not get trimmed or modified', () => {
					assert.strictEqual(
						element.textContent,
						' mock text 1\t\n\tmock text 2  \nmock text 3 '
					);
				});
			});

			describe('when the element has no children', () => {
				beforeEach(() => {
					td.when(childrenGetter()).thenReturn([]);
				});

				it('returns an empty string', () => {
					assert.strictEqual(element.textContent, '');
				});
			});
		});

		describe('.textContentAsDate', () => {
			let textContentGetter;

			beforeEach(() => {
				textContentGetter = td.func();
				td.when(textContentGetter()).thenReturn('  2022-02-02T02:02:02Z ');
				Object.defineProperty(element, 'textContent', { get: textContentGetter });
			});

			it('is set to a date object representing the text content of the element', () => {
				assert.ok(element.textContentAsDate instanceof Date);
				assert.strictEqual(
					element.textContentAsDate.toISOString(),
					'2022-02-02T02:02:02.000Z'
				);
			});

			describe('when the element text is a date in RSS format', () => {
				beforeEach(() => {
					td.when(textContentGetter()).thenReturn('Wed, 02 Feb 2022 02:02:02 +0000');
				});

				it('is set to a date object representing the text content of the element', () => {
					assert.ok(element.textContentAsDate instanceof Date);
					assert.strictEqual(
						element.textContentAsDate.toISOString(),
						'2022-02-02T02:02:02.000Z'
					);
				});
			});

			describe('when the element text is not a valid date', () => {
				beforeEach(() => {
					td.when(textContentGetter()).thenReturn('nope');
				});

				it('is set to `null`', () => {
					assert.strictEqual(element.textContentAsDate, null);
				});
			});
		});

		describe('.textContentAsUrl', () => {
			let textContentGetter;

			beforeEach(() => {
				textContentGetter = td.func();
				td.when(textContentGetter()).thenReturn('  mock-text-content  ');
				Object.defineProperty(element, 'textContent', { get: textContentGetter });
				td.replace(element, 'resolveUrl');
				td.when(element.resolveUrl('mock-text-content')).thenReturn('mock-resolved-url');
			});

			it('is set to a trimmed joined text content resolved against the base URL', () => {
				assert.strictEqual(element.textContentAsUrl, 'mock-resolved-url');
			});
		});

		describe('.textContentNormalized', () => {
			let childrenGetter;
			let textContentNormalized;

			beforeEach(() => {
				td.when(
					htmlEntities.decode('mock text 1\t\n\tmock text 2  \nmock text 3')
				).thenReturn('mock decoded text');
				childrenGetter = td.func();
				td.when(childrenGetter()).thenReturn([
					{
						textContent: ' mock text 1\t\n'
					},
					{
						textContent: '\tmock text 2  \n'
					},
					'mock text 3\n\n'
				]);
				Object.defineProperty(element, 'children', { get: childrenGetter });
				textContentNormalized = element.textContentNormalized;
			});

			it('decodes HTML entities on the trimmed joined text content', () => {
				td.verify(htmlEntities.decode('mock text 1\t\n\tmock text 2  \nmock text 3'), {
					times: 1
				});
			});

			it('is set to the decoded string', () => {
				assert.strictEqual(textContentNormalized, 'mock decoded text');
			});
		});

		describe('.innerHtml', () => {
			let innerHtml;

			beforeEach(() => {
				td.when(fastXmlParser.XMLBuilder.prototype.build(), {
					ignoreExtraArgs: true
				}).thenReturn('  mock-built-xml  ');
				td.when(htmlEntities.decode('mock-built-xml')).thenReturn('mock decoded text');
				innerHtml = element.innerHtml;
			});

			it('builds an XML string', () => {
				td.verify(fastXmlParser.XMLBuilder.prototype.build(mockRawElement.MOCK), {
					times: 1
				});
			});

			it('decodes HTML entities on the trimmed XML string', () => {
				td.verify(htmlEntities.decode('mock-built-xml'), { times: 1 });
			});

			it('is set to the decoded string', () => {
				assert.strictEqual(innerHtml, 'mock decoded text');
			});

			describe('when the XML builder returns a non-string', () => {
				beforeEach(() => {
					td.when(fastXmlParser.XMLBuilder.prototype.build(), {
						ignoreExtraArgs: true
					}).thenReturn(null);
					Object.defineProperty(element, 'textContentNormalized', {
						get: () => 'mock text content'
					});
					innerHtml = element.innerHtml;
				});

				it('is set to the the value of the `textContentNormalized` property', () => {
					assert.strictEqual(innerHtml, 'mock text content');
				});
			});
		});

		describe('.findElementsWithName(name)', () => {
			let childrenGetter;
			let returnValue;

			beforeEach(() => {
				childrenGetter = td.func();
				td.when(childrenGetter()).thenReturn([
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
				]);
				Object.defineProperty(element, 'children', { get: childrenGetter });
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
			let childrenGetter;
			let returnValue;

			beforeEach(() => {
				childrenGetter = td.func();
				td.when(childrenGetter()).thenReturn([
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
				]);
				Object.defineProperty(element, 'children', { get: childrenGetter });
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
					td.when(childrenGetter()).thenReturn([
						{
							name: 'mock-name-0',
							index: 0
						},
						{
							name: 'mock-name-2',
							index: 1
						},
						'mock-text-1'
					]);
					returnValue = element.findElementWithName('mock-name-1');
				});

				it('returns `null`', () => {
					assert.strictEqual(returnValue, null);
				});
			});
		});

		describe('.hasElementWithName(name)', () => {
			let childrenGetter;
			let returnValue;

			beforeEach(() => {
				childrenGetter = td.func();
				td.when(childrenGetter()).thenReturn([
					{
						name: 'mock-name-1',
						index: 0
					},
					{
						name: 'mock-name-2',
						index: 1
					},
					'mock-text-1'
				]);
				Object.defineProperty(element, 'children', { get: childrenGetter });
				returnValue = element.hasElementWithName('mock-name-1');
			});

			it('returns `true`', () => {
				assert.strictEqual(returnValue, true);
			});

			describe('when the element has no children with the given name', () => {
				beforeEach(() => {
					td.when(childrenGetter()).thenReturn([
						{
							name: 'mock-name-0',
							index: 0
						},
						{
							name: 'mock-name-2',
							index: 1
						},
						'mock-text-1'
					]);
					returnValue = element.hasElementWithName('mock-name-1');
				});

				it('returns `false`', () => {
					assert.strictEqual(returnValue, false);
				});
			});
		});

		describe('.getAttribute(name)', () => {
			let attributesGetter;
			let returnValue;

			beforeEach(() => {
				attributesGetter = td.func();
				td.when(attributesGetter()).thenReturn({
					'mock-name': 'mock-value'
				});
				Object.defineProperty(element, 'attributes', { get: attributesGetter });
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
					assert.strictEqual(returnValue, null);
				});
			});
		});

		describe('.getAttributeAsUrl(name)', () => {
			let attributesGetter;
			let returnValue;

			beforeEach(() => {
				attributesGetter = td.func();
				td.when(attributesGetter()).thenReturn({
					'mock-name': '  mock-value  '
				});
				Object.defineProperty(element, 'attributes', { get: attributesGetter });
				td.replace(element, 'resolveUrl');
				td.when(element.resolveUrl('mock-value')).thenReturn('mock-resolved-url');
				returnValue = element.getAttributeAsUrl('mock-name');
			});

			it('returns the requested attribute value trimmed and resolved against the base URL', () => {
				assert.strictEqual(returnValue, 'mock-resolved-url');
			});

			describe('when the element has no attribute with the given name', () => {
				beforeEach(() => {
					returnValue = element.getAttributeAsUrl('not-a-name');
				});

				it('returns `null`', () => {
					assert.strictEqual(returnValue, null);
				});
			});
		});

		describe('.getAttributeAsNumber(name)', () => {
			let attributesGetter;
			let returnValue;

			beforeEach(() => {
				attributesGetter = td.func();
				td.when(attributesGetter()).thenReturn({
					'mock-name': '123'
				});
				Object.defineProperty(element, 'attributes', { get: attributesGetter });
				returnValue = element.getAttributeAsNumber('mock-name');
			});

			it('returns the requested attribute value parsed as a number', () => {
				assert.strictEqual(returnValue, 123);
			});

			describe('when the attribute value is not a valid numeric value', () => {
				beforeEach(() => {
					td.when(attributesGetter()).thenReturn({
						'mock-name': 'nope'
					});
					returnValue = element.getAttributeAsNumber('mock-name');
				});

				it('returns `null`', () => {
					assert.strictEqual(returnValue, null);
				});
			});

			describe('when the element has no attribute with the given name', () => {
				beforeEach(() => {
					returnValue = element.getAttributeAsNumber('not-a-name');
				});

				it('returns `null`', () => {
					assert.strictEqual(returnValue, null);
				});
			});
		});

		describe('.resolveUrl(url)', () => {
			let baseUrlGetter;
			let returnValue;

			beforeEach(() => {
				baseUrlGetter = td.func();
				td.when(baseUrlGetter()).thenReturn('https://mock-base-url');
				Object.defineProperty(element, 'baseUrl', { get: baseUrlGetter });
				returnValue = element.resolveUrl('mock-url');
			});

			it('returns the URL resolved against the element base URL', () => {
				assert.strictEqual(returnValue, 'https://mock-base-url/mock-url');
			});

			describe('when the url is absolute', () => {
				beforeEach(() => {
					returnValue = element.resolveUrl('https://mock-url/');
				});

				it('returns the passed in URL', () => {
					assert.strictEqual(returnValue, 'https://mock-url/');
				});
			});

			describe('when the element has no base URL', () => {
				beforeEach(() => {
					td.when(baseUrlGetter()).thenReturn(null);
					returnValue = element.resolveUrl('mock-url');
				});

				it('returns the passed in URL', () => {
					assert.strictEqual(returnValue, 'mock-url');
				});
			});

			describe('when the url is not a string', () => {
				beforeEach(() => {
					td.when(baseUrlGetter()).thenReturn(null);
					returnValue = element.resolveUrl(123);
				});

				it('returns the passed in URL', () => {
					assert.strictEqual(returnValue, 123);
				});
			});

			describe('when the url resolution fails', () => {
				beforeEach(() => {
					td.when(baseUrlGetter()).thenReturn({ isInvalid: true });
					returnValue = element.resolveUrl('mock-url');
				});

				it('returns the passed in URL', () => {
					assert.strictEqual(returnValue, 'mock-url');
				});
			});
		});
	});

	describe('Element.create(rawFxpElement, nsDeclarations)', () => {
		let returnValue;

		beforeEach(() => {
			returnValue = Element.create(
				{
					MOCK: [],
					':@': {},
					'#text': ''
				},
				null
			);
		});

		it('creates and returns an element', () => {
			assert.ok(returnValue instanceof Element);
		});
	});
});
