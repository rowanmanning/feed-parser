'use strict';

const td = require('testdouble');

exports.createMock = function createMock() {
	class Element {
		constructor() {
			this.findElementsWithName = td.func();
			this.findElementWithName = td.func();
			this.getAttribute = td.func();
			this.getAttributeAsUrl = td.func();
			this.getAttributeAsNumber = td.func();
			this.hasElementWithName = td.func();
		}
	}
	return Element;
};
