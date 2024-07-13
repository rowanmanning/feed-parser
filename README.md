
# @rowanmanning/feed-parser

A well-tested and resilient Node.js parser for [RSS](https://en.wikipedia.org/wiki/RSS) and [Atom](https://en.wikipedia.org/wiki/Atom_(web_standard)) feeds.


## Table of Contents

  * [Requirements](#requirements)
  * [Introduction](#introduction)
  * [Usage](#usage)
    * [Parsed feed](#parsed-feed)
      * [`Feed`](#feed)
      * [`FeedAuthor`](#feedauthor)
      * [`FeedCategory`](#feedcategory)
      * [`FeedGenerator`](#feedgenerator)
      * [`FeedImage`](#feedimage)
      * [`FeedItem`](#feeditem)
      * [`FeedItemMedia`](#feeditemmedia)
      * [`FeedMeta`](#feedmeta)
  * [Supported feed formats](#supported-feed-formats)
    * [Standards](#standards)
    * [Leniency](#leniency)
  * [Contributing](#contributing)
  * [License](#license)
  * [Credit](#credit)


## Introduction

This is a Node.js-based feed parser for RSS and Atom feeds. The project has the following aims:

  * Run automated tests against real-world feeds. It's currently tested against ~40 feeds via [Sample Feeds](https://sample-feeds.rowanmanning.com/). This ensures that we support real feeds rather than just the specifications.

  * Related to the point above, [be as lenient as possible](#leniency) with feed parsing.

  * Keep up to date with the latest Node.js versions, including dropping support for end-of-life versions.

  * Maintain compatibility with the great parts of [node-feedparser](https://github.com/danmactough/node-feedparser), e.g. resolving relative URLs.


## Requirements

This library requires the following to run:

  * [Node.js](https://nodejs.org/) 18+


## Usage

Install with [npm](https://www.npmjs.com/):

```sh
npm install @rowanmanning/feed-parser
```

Load the library into your code with a `require` call:

```js
const { parseFeed } = require('@rowanmanning/feed-parser');
```

You can use the `parseFeed` function to parse an RSS or Atom feed as a string. The return value is an object representation of the feed:

```js
const feed = parseFeed('<channel> etc. </channel>');
console.log(feed.title);
```

[This will try to parse even invalid feeds](#leniency), but if no data can be pulled out an error will be thrown with a `code` property set to `INVALID_FEED`.

This library does not parse feeds via a URL, you can do so relatively easily with [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch):

```js
const response = await fetch('https://github.com/rowanmanning/feed-parser/releases.atom');
const feed = parseFeed(await response.text());
```

### Parsed feed

The `feed` object returned by `parseFeed` has the following properties.

#### `Feed`

Represents an RSS or Atom feed.

<table>
    <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Notes</th>
    </tr>
    <tr>
        <td><code>authors</code></td>
        <td><code><a href="#feedauthor">FeedAuthor</a>[]</code></td>
        <td>The feed authors. Always an array but sometimes empty if no authors are found.</td>
    </tr>
    <tr>
        <td><code>categories</code></td>
        <td><code><a href="#feedcategory">FeedCategory</a>[]</code></td>
        <td>The feed categories. Always an array but sometimes empty if no categories are found.</td>
    </tr>
    <tr>
        <td><code>copyright</code></td>
        <td><code>string | null</code></td>
        <td>The feed's copyright notice.</td>
    </tr>
    <tr>
        <td><code>description</code></td>
        <td><code>string | null</code></td>
        <td>A short description of the feed.</td>
    </tr>
    <tr>
        <td><code>generator</code></td>
        <td><code><a href="#feedgenerator">FeedGenerator</a> | null</code></td>
        <td>The software that generated the feed.</td>
    </tr>
    <tr>
        <td><code>image</code></td>
        <td><code><a href="#feedimage">FeedImage</a> | null</code></td>
        <td>An image representing the feed.</td>
    </tr>
    <tr>
        <td><code>items</code></td>
        <td><code><a href="#feeditem">FeedItem</a>[]</code></td>
        <td>The content items in the feed. Always an array but sometimes empty if no items are found.</td>
    </tr>
    <tr>
        <td><code>language</code></td>
        <td><code>string | null</code></td>
        <td>The language the feed is written in.</td>
    </tr>
    <tr>
        <td><code>meta</code></td>
        <td><code><a href="#feedmeta">FeedMeta</a></code></td>
        <td>Meta information about the format of the feed.</td>
    </tr>
    <tr>
        <td><code>published</code></td>
        <td><code>Date | null</code></td>
        <td>The date the feed was last published.</td>
    </tr>
    <tr>
        <td><code>self</code></td>
        <td><code>string | null</code></td>
        <td>A URL pointing to the feed itself.</td>
    </tr>
    <tr>
        <td><code>title</code></td>
        <td><code>string | null</code></td>
        <td>The name of the feed.</td>
    </tr>
    <tr>
        <td><code>updated</code></td>
        <td><code>Date | null</code></td>
        <td>The date the feed was last updated at.</td>
    </tr>
    <tr>
        <td><code>url</code></td>
        <td><code>string | null</code></td>
        <td>A URL pointing to the HTML web page that this feed is for.</td>
    </tr>
</table>

#### `FeedAuthor`

Represents the author of a [`Feed`](#feed) or [`FeedItem`](#feeditem).

<table>
    <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Notes</th>
    </tr>
    <tr>
        <td><code>email</code></td>
        <td><code>string | null</code></td>
        <td>The author's email address.</td>
    </tr>
    <tr>
        <td><code>name</code></td>
        <td><code>string | null</code></td>
        <td>The author's name.</td>
    </tr>
    <tr>
        <td><code>url</code></td>
        <td><code>string | null</code></td>
        <td>A URL pointing to a representation of the author on the internet.</td>
    </tr>
</table>

#### `FeedCategory`

Represents the content category of a [`Feed`](#feed) or [`FeedItem`](#feeditem).

<table>
    <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Notes</th>
    </tr>
    <tr>
        <td><code>label</code></td>
        <td><code>string | null</code></td>
        <td>The category display label.</td>
    </tr>
    <tr>
        <td><code>term</code></td>
        <td><code>string</code></td>
        <td>The category identifier. Often the same as the <code>label</code>.</td>
    </tr>
    <tr>
        <td><code>url</code></td>
        <td><code>string | null</code></td>
        <td>A URL pointing to a representation of the category on the internet.</td>
    </tr>
</table>

#### `FeedGenerator`

Represents software that generated a [`Feed`](#feed).

<table>
    <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Notes</th>
    </tr>
    <tr>
        <td><code>label</code></td>
        <td><code>string | null</code></td>
        <td>The name of the software that generated the feed.</td>
    </tr>
    <tr>
        <td><code>url</code></td>
        <td><code>string | null</code></td>
        <td>A URL pointing to further information about the generator.</td>
    </tr>
    <tr>
        <td><code>version</code></td>
        <td><code>string | null</code></td>
        <td>The version of the software used to generate the feed.</td>
    </tr>
</table>

#### `FeedImage`

Represents an image for a [`Feed`](#feed).

<table>
    <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Notes</th>
    </tr>
    <tr>
        <td><code>title</code></td>
        <td><code>string | null</code></td>
        <td>The alternative text of the image.</td>
    </tr>
    <tr>
        <td><code>url</code></td>
        <td><code>string</code></td>
        <td>The image URL.</td>
    </tr>
</table>

#### `FeedItem`

Represents an RSS item or Atom entry in a [`Feed`](#feed).

<table>
    <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Notes</th>
    </tr>
    <tr>
        <td><code>authors</code></td>
        <td><code><a href="#feedauthor">FeedAuthor</a>[]</code></td>
        <td>The feed item authors. Always an array but sometimes empty if no authors are found.</td>
    </tr>
    <tr>
        <td><code>categories</code></td>
        <td><code><a href="#feedcategory">FeedCategory</a>[]</code></td>
        <td>The feed item categories. Always an array but sometimes empty if no categories are found.</td>
    </tr>
    <tr>
        <td><code>content</code></td>
        <td><code>string | null</code></td>
        <td>The feed item content.</td>
    </tr>
    <tr>
        <td><code>description</code></td>
        <td><code>string | null</code></td>
        <td>A short description of the feed item.</td>
    </tr>
    <tr>
        <td><code>id</code></td>
        <td><code>string | null</code></td>
        <td>A unique identifier for the feed item.</td>
    </tr>
    <tr>
        <td><code>image</code></td>
        <td><code><a href="#feedimage">FeedImage</a> | null</code></td>
        <td>An image representing the feed item.</td>
    </tr>
    <tr>
        <td><code>media</code></td>
        <td><code><a href="#feeditemmedia">FeedItemMedia</a>[]</code></td>
        <td>Media associated with the feed item. Always an array but sometimes empty if no items are found.</td>
    </tr>
    <tr>
        <td><code>published</code></td>
        <td><code>Date | null</code></td>
        <td>The date the feed item was last published.</td>
    </tr>
    <tr>
        <td><code>title</code></td>
        <td><code>string | null</code></td>
        <td>The title of the feed item.</td>
    </tr>
    <tr>
        <td><code>updated</code></td>
        <td><code>Date | null</code></td>
        <td>The date the feed item was last updated at.</td>
    </tr>
    <tr>
        <td><code>url</code></td>
        <td><code>string | null</code></td>
        <td>A URL pointing to the HTML web page that this feed item represents.</td>
    </tr>
</table>

#### `FeedItemMedia`

Represents a piece of media attached to a [`FeedItem`](#feeditem).

<table>
    <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Notes</th>
    </tr>
    <tr>
        <td><code>image</code></td>
        <td><code>string | null</code></td>
        <td>A URL pointing to an image representation of the media. E.g. a video cover image.</td>
    </tr>
    <tr>
        <td><code>length</code></td>
        <td><code>number | null</code></td>
        <td>A length of the media in bytes.</td>
    </tr>
    <tr>
        <td><code>mimetype</code></td>
        <td><code>string | null</code></td>
        <td>The full mime type of the media (e.g. `image/jpeg`).</td>
    </tr>
    <tr>
        <td><code>title</code></td>
        <td><code>string | null</code></td>
        <td>The title of the media.</td>
    </tr>
    <tr>
        <td><code>type</code></td>
        <td><code>string | null</code></td>
        <td>The type of the media (the first part of the mime type, e.g. `audio` or `image`).</td>
    </tr>
    <tr>
        <td><code>url</code></td>
        <td><code>string</code></td>
        <td>A URL pointing to the media.</td>
    </tr>
</table>

#### `FeedMeta`

Represents meta information about a [`Feed`](#feed).

<table>
    <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Notes</th>
    </tr>
    <tr>
        <td><code>type</code></td>
        <td><code>"atom" | "rss"</code></td>
        <td>The name of the type of feed.</td>
    </tr>
    <tr>
        <td><code>version</code></td>
        <td><code>"0.3" | "0.9" | "1.0" | "2.0"</code></td>
        <td>The version of the type of feed.</td>
    </tr>
</table>


## Supported feed formats

### Standards

Feeds that adhere to the following standards are supported and most properties will be parsed:

  * [Atom 1.0](https://datatracker.ietf.org/doc/html/rfc4287)
  * Atom 0.3 (no spec available but an example is [here](https://pythonhosted.org/feedparser/annotated-atom03.html))
  * [RSS 2.0](https://www.rssboard.org/rss-specification)
  * [RSS 0.9](https://www.rssboard.org/rss-0-9-2)
  * [RDF Site Summary 1.0](https://web.resource.org/rss/1.0/spec)

The following XML namespaces are also parsed, and more data will be parsed out for RSS feeds that implement these:

  * [DublinCore](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/) (e.g. `dc:creator`)
  * [iTunes Podcast RSS feed](https://podcasters.apple.com/support/823-podcast-requirements) (e.g. `itunes:author`)

### Leniency

Feeds in the real world rarely comply strictly with the standards and can sometimes be invalid XML. We try to be as lenient as possible, only throwing errors if no data can be pulled out of the feed. We test against a suite of real-world feeds.


## Contributing

[The contributing guide is available here](docs/contributing.md). All contributors must follow [this library's code of conduct](docs/code_of_conduct.md).


## License

Licensed under the [MIT](LICENSE) license.<br/>
Copyright &copy; 2022, Rowan Manning


## Credit

This library takes inspiration from the following:

  * [Feedparser](https://github.com/danmactough/node-feedparser#readme) from [Dan MacTough](https://github.com/danmactough) which I've been using for years.

  * [Gofeed](https://github.com/mmcdole/gofeed#readme) by [mmcdole](https://github.com/mmcdole) which has a lovely API.
