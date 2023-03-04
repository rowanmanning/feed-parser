'use strict';

module.exports = function createMock() {
	class FeedItem {

		constructor(feed, element) {
			this.feed = feed;
			this.element = element;
		}

		get id() {
			return 'mock-feed-item-id';
		}

		get title() {
			return 'mock-feed-item-title';
		}

		get description() {
			return 'mock-feed-item-description';
		}

		get url() {
			return 'mock-feed-item-url';
		}

		get published() {
			return 'mock-feed-item-published';
		}

		get updated() {
			return 'mock-feed-item-updated';
		}

		get content() {
			return 'mock-feed-item-content';
		}

		get image() {
			return 'mock-feed-item-image';
		}

		get media() {
			return 'mock-feed-item-media';
		}

	}
	return FeedItem;
};
