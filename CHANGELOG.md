# Changelog

## [0.4.7](https://github.com/rowanmanning/feed-parser/compare/v0.4.6...v0.4.7) (2023-04-18)


### Bug Fixes

* add support for Node.js 20 ([b5c8a5c](https://github.com/rowanmanning/feed-parser/commit/b5c8a5c78ed2be899c75027d353a7bc3755e4712))

## [0.4.6](https://github.com/rowanmanning/feed-parser/compare/v0.4.5...v0.4.6) (2023-04-18)


### Bug Fixes

* bump fast-xml-parser from 4.1.3 to 4.2.0 ([b2c9860](https://github.com/rowanmanning/feed-parser/commit/b2c9860659de1ae9d76ce54a66311158ab5562aa))

## [0.4.5](https://github.com/rowanmanning/feed-parser/compare/v0.4.4...v0.4.5) (2023-03-23)


### Features

* add a title to media items and more images ([d28d5e0](https://github.com/rowanmanning/feed-parser/commit/d28d5e0a8a7e6296721684106e27bbd07c727ecc))
* fall back to filesize attribute for media ([3bd01a8](https://github.com/rowanmanning/feed-parser/commit/3bd01a8f81e5cca6371fc949ad3d4e4b681ac7dd))
* support Media RSS in both RSS and Atom feeds ([10742a5](https://github.com/rowanmanning/feed-parser/commit/10742a50d538d3f34ddb419fc64dd9cf1f742070))


### Bug Fixes

* allow both enclosures and media in RSS ([abda656](https://github.com/rowanmanning/feed-parser/commit/abda6566297c25eddb9aa3578ee6b7b882545cf5))
* pave the way to use inheritance ([bb66226](https://github.com/rowanmanning/feed-parser/commit/bb66226d7b1fd0e346663d07fe45bca821cc2248))
* properly parse zero in enclosure/media length ([18a126d](https://github.com/rowanmanning/feed-parser/commit/18a126daa4ad544e687dd1ffdd419d23dd2dbef7))

## [0.4.4](https://github.com/rowanmanning/feed-parser/compare/v0.4.3...v0.4.4) (2023-03-01)


### Features

* add more fallbacks for item.image ([72247cb](https://github.com/rowanmanning/feed-parser/commit/72247cb35d7d74a1c9624cac4279c10d0f71298b))

## [0.4.3](https://github.com/rowanmanning/feed-parser/compare/v0.4.2...v0.4.3) (2023-02-27)


### Features

* add feed item.image property ([91e7208](https://github.com/rowanmanning/feed-parser/commit/91e72083a3125954a167f40c74d23b01a32a69f6))
* add feed item.media property ([a5602bf](https://github.com/rowanmanning/feed-parser/commit/a5602bf73dac984627941cad721ba6d27089f247))


### Bug Fixes

* add tests for podcast feeds and fix images ([d9346b3](https://github.com/rowanmanning/feed-parser/commit/d9346b32f7a9c552c15770b12a2e16a0cf001b9b))
* bump fast-xml-parser from 4.1.2 to 4.1.3 ([56d9345](https://github.com/rowanmanning/feed-parser/commit/56d9345665a93df6343b5496236417769c397ef1))
* remove a rogue test filter ([b899526](https://github.com/rowanmanning/feed-parser/commit/b899526a45378f068d0d0fea4001b72664c82a50))

## [0.4.2](https://github.com/rowanmanning/feed-parser/compare/v0.4.1...v0.4.2) (2023-02-26)


### Features

* add feed item.content property ([1c9a541](https://github.com/rowanmanning/feed-parser/commit/1c9a54199efe403627a626780a6f4f98c4ad74b4))
* default item updated date to publish date ([1cc7310](https://github.com/rowanmanning/feed-parser/commit/1cc73101bfe611170fbee3b72934bf92d577272c))


### Bug Fixes

* properly handle Atom XHTML content ([e4855c5](https://github.com/rowanmanning/feed-parser/commit/e4855c5a2cbca15619137059264158cb83004c51))
* resolve item URLs against the feed URL ([2ad0d6c](https://github.com/rowanmanning/feed-parser/commit/2ad0d6c975262b4d80a0ed048c61b9716e402496))

## [0.4.1](https://github.com/rowanmanning/feed-parser/compare/v0.4.0...v0.4.1) (2023-02-24)


### Features

* add feed item.url property ([b5a7938](https://github.com/rowanmanning/feed-parser/commit/b5a79385e2f443368f8d765e006cc140fea14d31))
* add item.published / item.updated properties ([743fca4](https://github.com/rowanmanning/feed-parser/commit/743fca48d2ef2a984557f690f6f94d44665fcb7e))

## [0.4.0](https://github.com/rowanmanning/feed-parser/compare/v0.3.0...v0.4.0) (2023-02-23)


### ⚠ BREAKING CHANGES

* stop condensing whitespace in normalization

### Features

* add feed item.description property ([f9db2fa](https://github.com/rowanmanning/feed-parser/commit/f9db2fafc47e6de446c6839dd34a1ad3f5a8f0bb))
* add feed item.id property ([ab0edf5](https://github.com/rowanmanning/feed-parser/commit/ab0edf5ed24c777ee52457ff8103678d670de2fb))


### Bug Fixes

* handle RDF root-level items ([70753c3](https://github.com/rowanmanning/feed-parser/commit/70753c3d86ddf1b59ede932cc52301a71bfa2a90))
* stop condensing whitespace in normalization ([8f1e6ee](https://github.com/rowanmanning/feed-parser/commit/8f1e6eef5c3977eaa33e4a38d3a2cc3b64dd767f))

## [0.3.0](https://github.com/rowanmanning/feed-parser/compare/v0.2.0...v0.3.0) (2023-02-23)


### ⚠ BREAKING CHANGES

* change "link" to "url"
* properly make Atom/RSS internals private

### Features

* add feed item and item.title properties ([06bff43](https://github.com/rowanmanning/feed-parser/commit/06bff43c8529a111f44b834cacc1021d8c559178))
* add the feed generator property ([3c66449](https://github.com/rowanmanning/feed-parser/commit/3c66449641bfc781e4e2e7d6be8f238a07063953))
* add the feed image property ([9d136c0](https://github.com/rowanmanning/feed-parser/commit/9d136c00a7c86841e270af8af77d4316cb4e3e40))
* change "link" to "url" ([b7fb77a](https://github.com/rowanmanning/feed-parser/commit/b7fb77adc8833ab6ecb3bde3144ac43951c652b2))


### Bug Fixes

* properly make Atom/RSS internals private ([6c46bdd](https://github.com/rowanmanning/feed-parser/commit/6c46bddfb2eea9ca447b577c99f3ce8d4c5b8839))


### Documentation Changes

* use returns rather than type for getters ([2b341f2](https://github.com/rowanmanning/feed-parser/commit/2b341f2b55ea35b530b8d4438f82b66edaab84a6))

## [0.2.0](https://github.com/rowanmanning/feed-parser/compare/v0.1.15...v0.2.0) (2023-02-21)


### ⚠ BREAKING CHANGES

* make a public method private
* stop over-publicising methods and properties
* drop official support for npm v7
* drop support for Node.js 14

### Features

* add proper typings for the JSON output ([da39e12](https://github.com/rowanmanning/feed-parser/commit/da39e12d49324b2e08f94d8fb25437b799c9aee8))
* reshuffle more and expose a parse function ([580cce9](https://github.com/rowanmanning/feed-parser/commit/580cce969f21eac308b9124126eff714ef0f1646))


### Bug Fixes

* make a public method private ([2dc9837](https://github.com/rowanmanning/feed-parser/commit/2dc9837fb22acd2e4959356adba314ef58e9d5b6))
* make the JSDoc consistent ([731e732](https://github.com/rowanmanning/feed-parser/commit/731e732fa04717bd622afc3b3ffae832c7f00ee0))
* remove unnecessary import ([8215d94](https://github.com/rowanmanning/feed-parser/commit/8215d940b0d5aaa8fdcddded5a3d7e48c780cf5b))
* simplify the file structure and naming ([410f166](https://github.com/rowanmanning/feed-parser/commit/410f166ae4abd9cba1568756e991ac070c4c4bee))
* stop over-publicising methods and properties ([e9d6098](https://github.com/rowanmanning/feed-parser/commit/e9d6098302810176ca2b2c4d831dd55146df9e6d))
* switch from axios to undici for HTTP ([b771dc8](https://github.com/rowanmanning/feed-parser/commit/b771dc87019d79143579f1132967f50b3b1da69c))


### Miscellaneous

* drop official support for npm v7 ([7b39e88](https://github.com/rowanmanning/feed-parser/commit/7b39e8862fa3ff23c1f96801da765d7ecd7d2afa))
* drop support for Node.js 14 ([3c329a1](https://github.com/rowanmanning/feed-parser/commit/3c329a174bd26449148d28fb34de08f93da6fabc))


### Documentation Changes

* properly flesh out JSDoc for feed types ([60fbadc](https://github.com/rowanmanning/feed-parser/commit/60fbadcbb7e85679739f7f8a00cfed22c260fb90))

## [0.1.15](https://github.com/rowanmanning/feed-parser/compare/v0.1.14...v0.1.15) (2023-02-14)


### Bug Fixes

* support npm v9 ([977f784](https://github.com/rowanmanning/feed-parser/commit/977f784e648b1a50f0fbaebb33ceb4b670e857f1))

## [0.1.14](https://github.com/rowanmanning/feed-parser/compare/v0.1.13...v0.1.14) (2023-02-14)


### Bug Fixes

* bump axios from 1.3.1 to 1.3.2 ([b80c1ec](https://github.com/rowanmanning/feed-parser/commit/b80c1ecbf12e180613e7e87c3c96da702ccd37a0))
* bump axios from 1.3.2 to 1.3.3 ([bb6da1e](https://github.com/rowanmanning/feed-parser/commit/bb6da1eb2b82e138ed30a894d8f531e405529bea))
* bump fast-xml-parser from 4.1.1 to 4.1.2 ([7b08912](https://github.com/rowanmanning/feed-parser/commit/7b08912dbcf7c0de5b5deee14f54012329ca3085))

## [0.1.13](https://github.com/rowanmanning/feed-parser/compare/v0.1.12...v0.1.13) (2023-02-03)


### Bug Fixes

* bump axios from 1.2.6 to 1.3.1 ([f2f7346](https://github.com/rowanmanning/feed-parser/commit/f2f73460648ee217987034cb7a951e873928d13d))
* bump fast-xml-parser from 4.0.15 to 4.1.1 ([9c9b53c](https://github.com/rowanmanning/feed-parser/commit/9c9b53c7e6d8e69ee577d2dfa0d557501e4b7ba7))

## [0.1.12](https://github.com/rowanmanning/feed-parser/compare/v0.1.11...v0.1.12) (2023-01-30)


### Bug Fixes

* bump axios from 1.2.4 to 1.2.6 ([0340eb3](https://github.com/rowanmanning/feed-parser/commit/0340eb3f81e677852113dca7bbd3b868b827e3b2))

## [0.1.11](https://github.com/rowanmanning/feed-parser/compare/v0.1.10...v0.1.11) (2023-01-26)


### Bug Fixes

* bump axios from 1.2.2 to 1.2.4 ([af08c4d](https://github.com/rowanmanning/feed-parser/commit/af08c4d2029229ff10e6ef493b86502220b2881b))
* bump fast-xml-parser from 4.0.13 to 4.0.15 ([aa75c33](https://github.com/rowanmanning/feed-parser/commit/aa75c33a8f1428543e1012a0124688c0de91b18b))

## [0.1.10](https://github.com/rowanmanning/feed-parser/compare/v0.1.9...v0.1.10) (2023-01-11)


### Bug Fixes

* bump fast-xml-parser from 4.0.12 to 4.0.13 ([6c5e8af](https://github.com/rowanmanning/feed-parser/commit/6c5e8af1e63ca9428623a9503d46961bd40c6039))

## [0.1.9](https://github.com/rowanmanning/feed-parser/compare/v0.1.8...v0.1.9) (2023-01-08)


### Bug Fixes

* bump axios from 0.27.2 to 1.2.2 ([7478080](https://github.com/rowanmanning/feed-parser/commit/7478080817a5f3777d04abbf45d69bd256ea7bcc))
* bump json5 from 2.2.1 to 2.2.3 ([803c9a6](https://github.com/rowanmanning/feed-parser/commit/803c9a61b4f3a6c21b0920f6a911e45366a403ad))

## [0.1.8](https://github.com/rowanmanning/feed-parser/compare/v0.1.7...v0.1.8) (2022-12-21)


### Bug Fixes

* bump fast-xml-parser from 4.0.11 to 4.0.12 ([1825b9f](https://github.com/rowanmanning/feed-parser/commit/1825b9fc506bbdc5f30cd118e1fffe4b7b464ed7))

## [0.1.7](https://github.com/rowanmanning/feed-parser/compare/v0.1.6...v0.1.7) (2022-11-14)


### Bug Fixes

* improve TypeScript compatibility ([d541ac9](https://github.com/rowanmanning/feed-parser/commit/d541ac949048478e7b8a51197305921c7fffe55f))

## [0.1.6](https://github.com/rowanmanning/feed-parser/compare/v0.1.5...v0.1.6) (2022-10-18)


### Bug Fixes

* bump fast-xml-parser from 4.0.10 to 4.0.11 ([7784c06](https://github.com/rowanmanning/feed-parser/commit/7784c06207719f2ef81f32fb82a751b54a0670ae))

## [0.1.5](https://github.com/rowanmanning/feed-parser/compare/v0.1.4...v0.1.5) (2022-09-14)


### Bug Fixes

* bump fast-xml-parser from 4.0.9 to 4.0.10 ([26e2142](https://github.com/rowanmanning/feed-parser/commit/26e2142bcc44baea62bf5f3ab382f186134c8715))

## [0.1.4](https://github.com/rowanmanning/feed-parser/compare/v0.1.3...v0.1.4) (2022-07-12)


### Bug Fixes

* bump fast-xml-parser from 4.0.8 to 4.0.9 ([397d28f](https://github.com/rowanmanning/feed-parser/commit/397d28f3d88343d4c3c540cdadf4135bee3c4cce))

## [0.1.3](https://github.com/rowanmanning/feed-parser/compare/v0.1.2...v0.1.3) (2022-07-09)


### Bug Fixes

* hide the misc changelog section ([6d6e7ef](https://github.com/rowanmanning/feed-parser/commit/6d6e7ef7a47ec585b661ca85c83504bf808935a5))

## [0.1.2](https://github.com/rowanmanning/feed-parser/compare/v0.1.1...v0.1.2) (2022-06-11)


### Features

* ensure typescript types are always valid ([b63ed9a](https://github.com/rowanmanning/feed-parser/commit/b63ed9a37418398a700ce464f4bb8d7787a7137a))


### Miscellaneous

* bump @commitlint/cli from 17.0.1 to 17.0.2 ([273be26](https://github.com/rowanmanning/feed-parser/commit/273be2634169102f6d82baa20b67b2e62ca95c03))
* bump @commitlint/config-conventional from 17.0.0 to 17.0.2 ([e1d3cbf](https://github.com/rowanmanning/feed-parser/commit/e1d3cbf7c251c3aea7508297cc636cdf81f376dd))
* bump @rowanmanning/eslint-config from 3.5.0 to 4.0.2 ([2e89bcf](https://github.com/rowanmanning/feed-parser/commit/2e89bcf98cbe376e9db8404fb7a20c93cb1fdf08))
* bump eslint from 8.16.0 to 8.17.0 ([511c67d](https://github.com/rowanmanning/feed-parser/commit/511c67d218921a21260fc98659ea1ce05f67defd))
* fix eslint issues ([c5ad7fb](https://github.com/rowanmanning/feed-parser/commit/c5ad7fb13d55839386dbe72d4d6ff3490936acc0))

### [0.1.1](https://github.com/rowanmanning/feed-parser/compare/v0.1.0...v0.1.1) (2022-06-01)


### Features

* add in `copyright` parsing ([ebe92b4](https://github.com/rowanmanning/feed-parser/commit/ebe92b42bef3f0dd584034d403c70de876d5b577))


### Bug Fixes

* parse HTML entities in text content ([f112d04](https://github.com/rowanmanning/feed-parser/commit/f112d041c67604167340976d5c29a03e112f407b))

## 0.1.0 (2022-06-01)


### Features

* add in `published` and `updated` date props ([c485c1a](https://github.com/rowanmanning/feed-parser/commit/c485c1a5891f33d58e8ae9d1ae1d78044ac04965))
* add support for parsing out feed description ([9c37684](https://github.com/rowanmanning/feed-parser/commit/9c376849b3da5a299cf2b30cbea5d64cf613392c))
* add URL resolution and overhaul the tests ([86fa10d](https://github.com/rowanmanning/feed-parser/commit/86fa10d156a482a35e065d5101bb60fbcf1b46da))
* make a start on parsing Atom and RSS feeds ([2d4d3f6](https://github.com/rowanmanning/feed-parser/commit/2d4d3f691472b6f99f0a282ceb34533843a9ac71))
* resolve Atom and RSS `link` and `self` props ([3594eaf](https://github.com/rowanmanning/feed-parser/commit/3594eafaa12eb96e52b5e121facb2e4538eed5c0))


### Bug Fixes

* bump fast-xml-parser from 4.0.7 to 4.0.8 ([8d50cb6](https://github.com/rowanmanning/feed-parser/commit/8d50cb690b0a263e63c6cf8eca381001b4072269))


### Miscellaneous

* add integration tests for example feeds ([d65ce2d](https://github.com/rowanmanning/feed-parser/commit/d65ce2d68ce02a4a50de0ffc65c2e1bfae60bd0c))
* add integration tests for GitHub feeds ([0c7f9ed](https://github.com/rowanmanning/feed-parser/commit/0c7f9ed6bd8809e601980ae05f48788b902997f3))
* add snapshots for new test feeds ([314c904](https://github.com/rowanmanning/feed-parser/commit/314c904943dba521ccb6b7ae5a1c4e9908631686))
* add support for Node.js 18 ([409816c](https://github.com/rowanmanning/feed-parser/commit/409816cd041e42c6ff781b2bb8bdea1713aa5740))
* bump @commitlint/cli from 16.2.4 to 17.0.0 ([f1a8657](https://github.com/rowanmanning/feed-parser/commit/f1a8657f2e97f3f9cdf6ced1f4fcaaeff6dea542))
* bump @commitlint/cli from 17.0.0 to 17.0.1 ([3e854b5](https://github.com/rowanmanning/feed-parser/commit/3e854b531e27f3f6cf500a97f1a32de737df1e95))
* bump @commitlint/config-conventional from 16.2.4 to 17.0.0 ([311c18c](https://github.com/rowanmanning/feed-parser/commit/311c18c5bcc6a3ba570c4d16709af225ec7b4bf8))
* bump @rowanmanning/eslint-config from 3.3.1 to 3.4.0 ([a1d0cdc](https://github.com/rowanmanning/feed-parser/commit/a1d0cdc3813217e9838cbfdc935d0e628a0ee0db))
* bump @rowanmanning/eslint-config from 3.4.0 to 3.5.0 ([cbdce22](https://github.com/rowanmanning/feed-parser/commit/cbdce2219d995012512ade6e697b63c64991fdfd))
* bump axios from 0.26.1 to 0.27.2 ([4e8028e](https://github.com/rowanmanning/feed-parser/commit/4e8028ee939b68205f5aa217384ea2d1af1110fe))
* bump eslint from 8.12.0 to 8.14.0 ([84a6310](https://github.com/rowanmanning/feed-parser/commit/84a63100ccbed8210b37830f1fb10db550e9b5fb))
* bump eslint from 8.14.0 to 8.15.0 ([4d3a6a4](https://github.com/rowanmanning/feed-parser/commit/4d3a6a4b7565ff5d07d24b3646bf20c9ff707dc5))
* bump eslint from 8.15.0 to 8.16.0 ([de177ae](https://github.com/rowanmanning/feed-parser/commit/de177aef50c8a75d168c86ba9ebb655b09ff3eed))
* bump husky from 7.0.4 to 8.0.1 ([987cfb9](https://github.com/rowanmanning/feed-parser/commit/987cfb976aab804c0d8a33b9db3ec84ca5293253))
* bump mocha from 9.2.2 to 10.0.0 ([f759c2d](https://github.com/rowanmanning/feed-parser/commit/f759c2d81798ed2b47cbd7aab56a009ad816fac3))
* bump testdouble from 3.16.4 to 3.16.5 ([ea5cdf5](https://github.com/rowanmanning/feed-parser/commit/ea5cdf52fd542b52dc394d903bfa7aad3fea15b0))
* fix the integration tests ([c823455](https://github.com/rowanmanning/feed-parser/commit/c8234556b5e1e09f07328845af15ffa3b01be080))
* initial commit ([11ce77b](https://github.com/rowanmanning/feed-parser/commit/11ce77b7d0ccd029bf39bb3c4d515caba837effb))
* overhaul release pipeline ([d118092](https://github.com/rowanmanning/feed-parser/commit/d118092698bdfaf1b2274eb384a8d34674ea24b7))


### Documentation Changes

* add a README ([3aa3195](https://github.com/rowanmanning/feed-parser/commit/3aa3195040c9195d37957e33cb3a5a48328f3d8e))
* clarify usage note in the README ([4ca9320](https://github.com/rowanmanning/feed-parser/commit/4ca932081ef6b0082d395dcfd6e0c8abaf9b9038))
