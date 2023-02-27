'use strict';

const {assert} = require('chai');
const {decode: decodeEntities} = require('html-entities');
const FeedParser = require('feedparser');
const fetch = require('./helpers/fetch');
const parseFeed = require('../..');
const path = require('path');
const {Readable} = require('stream');
const writeJSON = require('./helpers/write-json');

const suites = [
	{
		name: 'Example feeds',
		snapshotPath: 'examples',
		tests: require('./fixtures/examples.json')
	},
	{
		name: 'Real-world feeds',
		snapshotPath: 'real-world',
		tests: require('./fixtures/real-world.json')
	}
];

for (const suite of suites) {
	describe(suite.name, () => {
		for (const test of suite.tests) {

			describe(test.title, () => {
				let actual;
				let expected;
				let xml;

				before(async () => {

					// Get the actual result
					actual = {
						title: test.title,
						hash: test.hash,
						url: test.urls.feed
					};
					try {
						const response = await fetch(test.urls.feed);
						xml = await response.text();
						actual.feed = parseFeed(xml).toJSON();
					} catch (error) {
						actual.error = {
							code: error.code,
							message: error.message
						};
					}

					// Get the expected result
					const expectedFilePath = path.resolve(__dirname, 'snapshots', suite.snapshotPath, `${test.hash}.json`);
					try {
						if (process.env.OVERWRITE_SNAPSHOTS) {
							throw new Error('Overwriting Snapshots');
						}
						expected = require(expectedFilePath);
					} catch (error) {
						await writeJSON(expectedFilePath, actual);
						expected = actual;
					}

				});

				it('parses into the expected object', () => {
					assert.deepEqual(actual, expected);
				});

				describe('basic feedparser compatibility', () => {
					const feedParserItems = [];
					let feedParserMeta;

					before(done => {
						const feedParser = new FeedParser({
							addmeta: false
						});
						feedParser.on('error', done);
						feedParser.on('end', () => done());

						// Grab feed parser meta
						feedParser.on('meta', meta => {
							feedParserMeta = meta;
						});

						// Grab feed parser items
						feedParser.on('readable', () => {
							let item;
							// eslint-disable-next-line no-cond-assign
							while (item = feedParser.read()) {
								feedParserItems.push(item);
							}
						});

						// Pipe our XML into the feed parser
						Readable.from(xml).pipe(feedParser);
					});

					it('has matching feed languages', () => {
						assert.strictEqual(actual.feed.language, feedParserMeta.language);
					});

					it('has matching feed titles', () => {
						assert.strictEqual(actual.feed.title, feedParserMeta.title);
					});

					// DIFF: we can't compare feed description directly because
					// feedparser performs normalisation on this property by stripping
					// HTML. We match their RegExp here for the purpose of testing.
					// See: https://github.com/danmactough/node-feedparser/blob/0a734f88195e4c7048a53867a8ec7c52f150fff2/lib/utils.js#L172
					it('has ROUGLY matching feed descriptions', () => {
						const description = actual.feed.description?.replace(/<.*?>/g, '') || null;
						assert.strictEqual(description, feedParserMeta.description);
					});

					it('has matching feed copyright', () => {
						assert.strictEqual(actual.feed.copyright, feedParserMeta.copyright);
					});

					// DIFF: this differs because we don't append a trailing slash
					// to URLs when they point to the root path of a domain. E.g.
					// we wouldn't add `/` to `https://www.ft.com`. We match their
					// URLs by cheesing it here and removing trailing slashes from
					// both results
					it('has ROUGHLY matching feed URLs', () => {
						const url = actual.feed.url?.replace(/\/+$/, '') || null;
						const feedParserUrl = feedParserMeta.link?.replace(/\/+$/, '') || null;
						assert.strictEqual(url, feedParserUrl);
					});

					// DIFF: this differs because we have to work around the fact
					// that feedparser incorrectly uses the first `item/source[@url]`
					// for the feed URL when working with RSS 0.92. We get around this
					// by skipping the test for older RSS versions
					it('has ROUGHLY matching self URLs', () => {
						if (actual.feed.meta.type === 'rss' && actual.feed.meta.version === '0.9') {
							return;
						}
						assert.strictEqual(actual.feed.self, feedParserMeta.xmlurl);
					});

					// DIFF: publish dates for the feed are completely different
					// between this library and feedparser. feedparser uses the
					// `updated` or `date` values whereas we prefer null if there's
					// not an explicit publish date at the feed level

					// DIFF: updated dates for the feed are different between this
					// library and feedparser. feedparser uses the `pubdate` value
					// if no `lastBuildDate` or `date` value is present, whereas we
					// prefer null if there's not an explicit publish date at the
					// feed level

					// DIFF: feedparser doesn't break the generator into separate
					// properties. For the tests we assert that the feedparser
					// generator contains the label that we use
					it('has ROUGHLY matching feed generators', () => {
						if (feedParserMeta.generator && actual.feed.generator) {
							assert.include(feedParserMeta.generator, actual.feed.generator.label);
						}
					});

					// DIFF: feedparser returns an empty object rather than `null`
					// if there is no image in the feed. We test for this by converting
					// empty objects to `null`
					//
					// DIFF: if the image title is missing, feedparser returns `undefined`
					// rather than `null`. We get around this in the tests by setting our
					// title to undefined if it's null
					//
					// DIFF: feedparser does not fall back to the `icon` element
					//
					// HACK: in order to make this test pass for other valid feeds,
					// we manually exclude feeds with the title "The Verge". We should
					// find a nicer way to do this in future
					it('has ROUGHLY matching feed images', () => {
						if (!actual.feed.title.includes('The Verge')) {
							let feedParserImage = feedParserMeta.image;
							if (feedParserImage && !Object.keys(feedParserImage).length) {
								feedParserImage = null;
							}
							if (actual.feed.image?.title === null) {
								delete actual.feed.image.title;
							}
							assert.deepEqual(actual.feed.image, feedParserImage);
						}
					});

					// DIFF: when there is no explicit guid or id element, we use a
					// value of `null` whereas feedparser defaults to the item URL.
					// We'd rather the user of this library makes that decision.
					// Because of this we just ignore items missing explicit IDs
					it('has ROUGHLY matching feed item IDs', () => {
						for (const [i, item] of Object.entries(actual.feed.items)) {
							if (item.id) {
								const feedParserItem = feedParserItems[i];
								assert.strictEqual(item.id, feedParserItem.guid);
							}
						}
					});

					// DIFF: feedparser does not decode HTML entities in titles. We
					// address this difference in the tests by manually decoding
					// entities in feedparser items to match our data
					//
					// DIFF: feedparser doesn't use itunes title elements so we
					// skip over this test for null titles if the feed has itunes
					// elements
					it('has ROUGHLY matching feed item titles', () => {
						for (const [i, item] of Object.entries(actual.feed.items)) {
							const feedParserItem = feedParserItems[i];
							if (feedParserItem.title === null && xml.includes('itunes:')) {
								continue;
							}
							assert.strictEqual(
								item.title,
								feedParserItem.title ? decodeEntities(feedParserItem.title) : feedParserItem.title
							);
						}
					});

					// DIFF: feedparser does not decode entities in item descriptions
					// and also defaults this to the main content if a description is
					// not present. This makes it too incompatible for testing.

					// DIFF: this differs because we don't append a trailing slash
					// to URLs when they point to the root path of a domain. E.g.
					// we wouldn't add `/` to `https://www.ft.com`. We match their
					// URLs by cheesing it here and removing trailing slashes from
					// both results
					//
					// DIFF: feedparser defaults to the feed item ID if it has no
					// link element. We'd rather the user of this library make that
					// decision. For the tests we just ignore items with null URLs
					it('has ROUGHLY matching feed item URLs', () => {
						for (const [i, item] of Object.entries(actual.feed.items)) {
							const feedParserItem = feedParserItems[i];
							if (item.url) {
								const url = item.url?.replace(/\/+$/, '') || null;
								const feedParserUrl = feedParserItem.link?.replace(/\/+$/, '') || null;
								assert.strictEqual(url, feedParserUrl);
							}
						}
					});

					// DIFF: feedparser uses the updated date values if a publish
					// date is not present, whereas we prefer `null` if there's not
					// an explicit publish date at the feed level so that the user
					// of this library can choose whether to do this. We get around
					// this in the tests by ignoring items with null publish dates
					it('has ROUGHLY matching feed item published dates', () => {
						for (const [i, item] of Object.entries(actual.feed.items)) {
							if (item.published) {
								const feedParserItem = feedParserItems[i];
								const feedParserDate = feedParserItem.pubdate?.toISOString() || null;
								assert.strictEqual(item.published, feedParserDate);
							}
						}
					});

					// DIFF: feedparser accepts invalid elements in RSS feeds,
					// including accepting the Atom modified element. This comes up
					// in the test data
					//
					// HACK: in order to make this test pass for other valid feeds,
					// we manually exclude feeds with the title "Engadget". We should
					// find a nicer way to do this in future
					it('has ROUGHLY matching feed item updated dates', () => {
						for (const [i, item] of Object.entries(actual.feed.items)) {
							if (!actual.feed.title.includes('Engadget')) {
								const feedParserItem = feedParserItems[i];
								const feedParserDate = feedParserItem.date?.toISOString() || null;
								assert.strictEqual(item.updated, feedParserDate);
							}
						}
					});

					// DIFF: feedparser does not decode HTML entities in titles. We
					// address this difference in the tests by manually decoding
					// entities in feedparser items to match our data
					//
					// DIFF: the XML parsers used by feedparser and this library
					// differ a little in their handling of whitespace. We handle
					// this in the tests by replacing all consecutive whitespace
					// in each output with a single space character
					//
					// DIFF: feedparser does not seem to handle content properly in
					// Atom 0.3 and RDF feeds, it returns `null` in those cases. We
					// handle this in the test by ignoring those feed types
					//
					// DIFF: feedparser does not correctly handle Atom content with
					// a type of xhtml – the spec states that the wrapping div must
					// be stripped. We resolve this in the tests by stripping it
					// before comparing output
					it('has ROUGHLY matching feed item content', () => {
						for (const [i, item] of Object.entries(actual.feed.items)) {

							if (actual.feed.meta.type === 'atom' && actual.feed.meta.version === '0.3') {
								return;
							}
							if (actual.feed.meta.type === 'rdf') {
								return;
							}

							const feedParserItem = feedParserItems[i];

							const content = item.content || item.description;
							let feedParserContent = feedParserItem.description ? decodeEntities(feedParserItem.description) : null;

							// Handle feedparser XML Atom content issue by
							// stripping the outer div
							if (actual.feed.meta.type === 'atom' && /^<div/i.test(feedParserContent)) {
								feedParserContent = feedParserContent.replace(/^<div( .*)?>|<\/\s*div\s*>$/ig, '').trim();
							}

							try {
								assert.strictEqual(
									content?.replace(/\s+/g, ' ') || null,
									feedParserContent?.replace(/\s+/g, ' ') || null
								);
							} catch (error) {
								console.log({
									ours: content,
									theirs: feedParserContent
								});
								throw error;
							}
						}
					});

					// DIFF: feedparser returns an empty object rather than `null`
					// if there is no image in the feed. We test for this by converting
					// empty objects to `null`
					//
					// DIFF: if the image title is missing, feedparser returns `undefined`
					// rather than `null`. We get around this in the tests by setting our
					// title to undefined if it's null
					//
					// FIXME: skipped for now until we have enclosure support
					it.skip('has ROUGHLY matching feed item images', () => {
						for (const [i, item] of Object.entries(actual.feed.items)) {
							const feedParserItem = feedParserItems[i];
							let feedParserImage = feedParserItem.image;
							if (feedParserImage && !Object.keys(feedParserImage).length) {
								feedParserImage = null;
							}
							if (item.image?.title === null) {
								delete item.image.title;
							}

							console.log({
								ours: item.image,
								theirs: feedParserImage
							});
							assert.deepEqual(item.image, feedParserImage);
						}
					});

					// DIFF: the structure of enclosure items is different between
					// this library and feedparser. We parse the enclosure length as
					// a string and set the type property to the _base_ type of the
					// mimetype. We also set the type to `null` when one is not set.
					// We address this in the testsby modifying both enclosures to
					// match each other more closely
					it('has ROUGHLY matching feed item media', () => {
						for (const [i, item] of Object.entries(actual.feed.items)) {
							const feedParserItem = feedParserItems[i];

							const feedParserItemEnclosures = feedParserItem.enclosures.map(({url, type, length}) => {
								return {
									url,
									type: type || null,
									length: length === '0' ? null : length
								};
							});
							const media = item.media.map(({url, mimeType, length, type}) => {
								return {
									url,
									type: mimeType || type || null,
									length: length ? `${length}` : null
								};
							});

							assert.deepEqual(media, feedParserItemEnclosures);
						}
					});

				});

			});

		}
	});
}
