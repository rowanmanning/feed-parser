'use strict';

const td = require('testdouble');

module.exports = function createMock() {
	class Element {

		constructor() {
			this.findElementsWithName = td.func();
			this.findElementWithName = td.func();
			this.getAttribute = td.func();
			this.getAttributeAsUrl = td.func();
			this.hasElementWithName = td.func();
		}

	}
	return Element;
};
