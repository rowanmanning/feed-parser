'use strict';

module.exports = [
	{
		description: 'a single name',
		input: 'Mock Name',
		expectedOutput: {
			name: 'Mock Name',
			email: null,
			url: null
		}
	},
	{
		description: 'a single email address',
		input: 'mock@localhost',
		expectedOutput: {
			name: null,
			email: 'mock@localhost',
			url: null
		}
	},
	{
		description: 'a single web address (HTTPS)',
		input: 'https://localhost',
		expectedOutput: {
			name: null,
			email: null,
			url: 'https://localhost'
		}
	},
	{
		description: 'a single web address (HTTP)',
		input: 'http://localhost',
		expectedOutput: {
			name: null,
			email: null,
			url: 'http://localhost'
		}
	},
	{
		description: 'a name with an email address',
		input: 'Mock Name mock@localhost',
		expectedOutput: {
			name: 'Mock Name',
			email: 'mock@localhost',
			url: null
		}
	},
	{
		description: 'a name with an email address in parenthesis',
		input: 'Mock Name (mock@localhost)',
		expectedOutput: {
			name: 'Mock Name',
			email: 'mock@localhost',
			url: null
		}
	},
	{
		description: 'a name with an email address in square brackets',
		input: 'Mock Name [mock@localhost]',
		expectedOutput: {
			name: 'Mock Name',
			email: 'mock@localhost',
			url: null
		}
	},
	{
		description: 'a name with an email address in angle brackets',
		input: 'Mock Name <mock@localhost>',
		expectedOutput: {
			name: 'Mock Name',
			email: 'mock@localhost',
			url: null
		}
	},
	{
		description: 'a name with a web address',
		input: 'Mock Name https://localhost',
		expectedOutput: {
			name: 'Mock Name',
			email: null,
			url: 'https://localhost'
		}
	},
	{
		description: 'a name with a web address in parenthesis',
		input: 'Mock Name (https://localhost)',
		expectedOutput: {
			name: 'Mock Name',
			email: null,
			url: 'https://localhost'
		}
	},
	{
		description: 'a name with a web address in square brackets',
		input: 'Mock Name [https://localhost]',
		expectedOutput: {
			name: 'Mock Name',
			email: null,
			url: 'https://localhost'
		}
	},
	{
		description: 'a name with a web address in angle brackets',
		input: 'Mock Name <https://localhost>',
		expectedOutput: {
			name: 'Mock Name',
			email: null,
			url: 'https://localhost'
		}
	},
	{
		description: 'an email address with a name in parenthesis',
		input: 'mock@localhost (Mock Name)',
		expectedOutput: {
			name: 'Mock Name',
			email: 'mock@localhost',
			url: null
		}
	},
	{
		description: 'an email address with a name in square brackets',
		input: 'mock@localhost [Mock Name]',
		expectedOutput: {
			name: 'Mock Name',
			email: 'mock@localhost',
			url: null
		}
	},
	{
		description: 'an email address with a name in angle brackets',
		input: 'mock@localhost <Mock Name>',
		expectedOutput: {
			name: 'Mock Name',
			email: 'mock@localhost',
			url: null
		}
	},
	{
		description: 'an email address with a web address in parenthesis',
		input: 'mock@localhost (https://localhost)',
		expectedOutput: {
			name: null,
			email: 'mock@localhost',
			url: 'https://localhost'
		}
	},
	{
		description: 'an email address with a web address in square brackets',
		input: 'mock@localhost [https://localhost]',
		expectedOutput: {
			name: null,
			email: 'mock@localhost',
			url: 'https://localhost'
		}
	},
	{
		description: 'an email address with a web address in angle brackets',
		input: 'mock@localhost <https://localhost>',
		expectedOutput: {
			name: null,
			email: 'mock@localhost',
			url: 'https://localhost'
		}
	},

	// EDGE-CASE: mailto in email address
	{
		description: 'a single email address that starts with a mailto protocol',
		input: 'mailto:mock@localhost',
		expectedOutput: {
			name: null,
			email: 'mock@localhost',
			url: null
		}
	},
	{
		description: 'a name with an email address that starts with a mailto protocol',
		input: 'Mock Name (mailto:mock@localhost)',
		expectedOutput: {
			name: 'Mock Name',
			email: 'mock@localhost',
			url: null
		}
	},

	// EDGE-CASE: name divided by other author information
	{
		description: 'a single name divided by an email address',
		input: 'Mock mock@localhost Name',
		expectedOutput: {
			name: 'Mock Name',
			email: 'mock@localhost',
			url: null
		}
	},
	{
		description: 'a single name divided by an email address in parenthesis',
		input: 'Mock (mock@localhost) Name',
		expectedOutput: {
			name: 'Mock Name',
			email: 'mock@localhost',
			url: null
		}
	},
	{
		description: 'a single name divided by a web address',
		input: 'Mock https://localhost Name',
		expectedOutput: {
			name: 'Mock Name',
			email: null,
			url: 'https://localhost'
		}
	},
	{
		description: 'a single name divided by a web address in parenthesis',
		input: 'Mock (https://localhost) Name',
		expectedOutput: {
			name: 'Mock Name',
			email: null,
			url: 'https://localhost'
		}
	},

	// EDGE-CASE: name with parenthesis
	{
		description: 'a single name with part of the name in parenthesis',
		input: 'Mock Name (Managing Editor)',
		expectedOutput: {
			name: 'Mock Name (Managing Editor)',
			email: null,
			url: null
		}
	},
	{
		description: 'a single name with part of the name and an email address in parenthesis',
		input: 'Mock Name (Managing Editor) <mock@localhost>',
		expectedOutput: {
			name: 'Mock Name (Managing Editor)',
			email: 'mock@localhost',
			url: null
		}
	},

	// EDGE-CASE: multiple email addresses
	{
		description: 'a single name with multiple email addresses',
		input: 'Mock Name (mock1@localhost) (mock2@localhost)',
		expectedOutput: {
			name: 'Mock Name',
			email: 'mock1@localhost',
			url: null
		}
	},

	// EDGE-CASE: multiple web addresses
	{
		description: 'a single name with multiple web addresses',
		input: 'Mock Name (https://localhost/1) (https://localhost/2)',
		expectedOutput: {
			name: 'Mock Name',
			email: null,
			url: 'https://localhost/1'
		}
	},

	// ERROR-CASE: non-string
	{
		description: 'a non-string',
		input: 123,
		expectedOutput: null
	},

	// ERROR-CASE: empty string
	{
		description: 'an empty string',
		input: '',
		expectedOutput: null
	},

	// ERROR-CASE: whitespace-only string
	{
		description: 'a whitespace-only string',
		input: '    ',
		expectedOutput: null
	}
];
