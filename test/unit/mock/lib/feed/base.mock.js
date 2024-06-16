'use strict';

module.exports = function createMock() {
	class Feed {
		constructor(document) {
			this.document = document;
		}

		get meta() {
			return 'mock-feed-meta';
		}

		get language() {
			return 'mock-feed-language';
		}

		get title() {
			return 'mock-feed-title';
		}

		get description() {
			return 'mock-feed-description';
		}

		get copyright() {
			return 'mock-feed-copyright';
		}

		get url() {
			return 'mock-feed-url';
		}

		get self() {
			return 'mock-feed-self';
		}

		get published() {
			return 'mock-feed-published';
		}

		get updated() {
			return 'mock-feed-updated';
		}

		get generator() {
			return 'mock-feed-generator';
		}

		get image() {
			return 'mock-feed-image';
		}

		get items() {
			return 'mock-feed-items';
		}
	}
	return Feed;
};
