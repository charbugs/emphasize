'use strict';

var { TokenizerError } = require('../common/errors.js');

class Tokenizer {

	constructor({ langData, langCode }) {
		
		var code = langCode || 'any';

		if (langData.supportedLanguages.indexOf(code) === -1)
			throw TokenizerError(`Language ${code} not supported.`);

		this.prefixes = langData[code].prefixes;
		this.suffixes = langData[code].suffixes;
		this.fixedExpressions = langData[code].fixedExpressions;
	} 

	/*
	 * The algorithm is based on spacy's tokenizer algorithm as it is described at:
	 * https://spacy.io/usage/linguistic-features#section-tokenization
	 */
	tokenize(text) {

		var tokens = [];
		var specialTokens, prefixOffset, suffixOffset, tokenSuffixes;
		var substrings = text.match(/(\S+|\s+)/g);

		substrings.forEach(substring => {
			tokenSuffixes = [];
			while (substring) {
				if (this.isFixedExpression(substring)) {
					tokens.push(substring);
					break;
				}
				else if (specialTokens = this.tokenizeSpecialCase(substring)) {
					tokens = tokens.concat(specialTokens);
					break;
				} 
				else if (prefixOffset = this.findPrefix(substring)) {
					tokens.push(substring.slice(0, prefixOffset));
					substring = substring.slice(prefixOffset);
				}
				else if (suffixOffset = this.findSuffix(substring)) {
					tokenSuffixes.unshift(substring.slice(suffixOffset));
					substring = substring.slice(0, suffixOffset);
				}
				else {
					tokens.push(substring);
					break;
				}
			}
			tokens = tokens.concat(tokenSuffixes);
		});
		return tokens;
	}

	isFixedExpression(substring) {
		return this.fixedExpressions.indexOf(substring) > -1;
	}

	tokenizeSpecialCase(substring) {
	}

	findPrefix(substring) {
		for (var prefix of this.prefixes) {
			if (substring.startsWith(prefix))
				return prefix.length;
		}
	} 

	findSuffix(substring) {
		for (var suffix of this.suffixes) {
			if (substring.endsWith(suffix))
				return substring.length - suffix.length;
		}
	}
}

module.exports = { Tokenizer };