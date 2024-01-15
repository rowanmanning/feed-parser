'use strict';

/**
 * @typedef {object} Contact
 * @property {string | null} name
 *     The author's name.
 * @property {string | null} email
 *     The author's email address.
 * @property {string | null} url
 *     The URL of a page representing the author.
 */

const GROUP_CHARACTERS = {
	'(': ')',
	'[': ']',
	'<': '>'
};
const GROUP_OPENING_CHARACTERS = Object.keys(GROUP_CHARACTERS);

const MAILTO_REGEXP = /^mailto:/i;

/**
 * @param {string} authorString
 *     The string to parse.
 * @returns {Contact | null}
 *     Returns the parsed author or `null` if no author data is available.
 */
module.exports = function parseContactString(authorString) {
	if (typeof authorString !== 'string' || !authorString.trim()) {
		return null;
	}

	const words = authorString.split(' ').map(originalText => {
		let text = originalText;
		const openingParen = GROUP_OPENING_CHARACTERS.includes(text[0]) ? text[0] : null;
		if (openingParen && text[text.length - 1] === GROUP_CHARACTERS[openingParen]) {
			text = originalText.substring(1, text.length - 1);
		}

		const textLowerCase = text.toLowerCase();

		const isUrl = textLowerCase.startsWith('http://') || textLowerCase.startsWith('https://');
		const isEmail = !isUrl && text.includes('@');

		if (isEmail) {
			text = text.replace(MAILTO_REGEXP, '');
		}

		return {
			isUrl,
			isEmail,
			text
		};
	});

	const email = words
		.find(({isEmail}) => isEmail)?.text || null;
	const url = words
		.find(({isUrl}) => isUrl)?.text || null;

	/** @type {string | null} */
	let name = authorString;
	if (email || url) {
		name = words
			.filter(({isEmail, isUrl}) => !isEmail && !isUrl)
			.map(({text}) => text).join(' ')?.trim() || null;
	}
	if (
		name &&
		GROUP_OPENING_CHARACTERS.includes(name[0]) &&
		name.at(-1) === GROUP_CHARACTERS[name[0]]
	) {
		name = name.substring(1, name.length - 1);
	}

	return {
		name,
		email,
		url
	};
};
