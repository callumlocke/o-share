/*global require, module*/

const DomDelegate = require('ftdomdelegate');
const Tooltip = require('./Tooltip');

/**
 * Gets the width of a text by using a <canvas> element
 *
 * @param {string} text - The text to measure
 * @param {HTMLElement} refEl - The reference element where the text will be to get the font properties
 *
 * @returns {number}
 */
function getPixelWidthOfText(text, refEl) {
	const c = document.createElement("canvas");

	if (c.getContext && window.getComputedStyle) {
		const ctx = c.getContext("2d");
		const refElStyle = window.getComputedStyle(refEl);
		ctx.font = refElStyle.getPropertyValue('font-style') + " " + refElStyle.getPropertyValue('font-size') + " " + refElStyle.getPropertyValue('font-family');
		ctx.fillText(text, 10, 100);
		return ctx.measureText(text).width;
	}

	return -1;
}

/**
 * @class TextCopyHelper
 *
 * @param {Object} config
 * @param {string} config.text - Value of the url input element
 * @param {string} config.message - Tooltip text
 * @param {HTMLElement} config.parentEl - Parent element
 * @param {function} config.onDestroy - Optional, callback that will be ran on {@link destroy}
 * @param {function} config.onCopy - Optional, callback that will be ran when the 'copy' event is triggered
 */
function TextCopyHelper(config) {

	const textCopyHelper = this;
	/**
	 * Creates an input element for the URL setting it's correct width corresponding to said URL
	 *
	 * @private
	 * @returns {HTMLElement} inputEl
	 */
	function createInputElement(text) {
		const inputEl = document.createElement('input');
		inputEl.setAttribute('type', 'text');
		inputEl.setAttribute('value', text);

		return inputEl;
	}

	/**
	 * Initializes document.body and input dom-delegates and creates tooltip and input element
	 *
	 * @private
	 */
	function init() {
		textCopyHelper.inputEl = createInputElement(config.text);
		config.parentEl.insertBefore(textCopyHelper.inputEl, config.parentEl.childNodes[0]);
		const inputWidth = getPixelWidthOfText(config.text, textCopyHelper.inputEl);

		if (inputWidth !== -1) {
			textCopyHelper.inputEl.style.width = inputWidth + 'px';
		}
		textCopyHelper.inputEl.select();

		textCopyHelper.tooltip = new Tooltip(config.message, config.parentEl);
		textCopyHelper.config = config;
		textCopyHelper.bodyDomDelegate = new DomDelegate(document.body);
		textCopyHelper.inputDomDelegate = new DomDelegate(textCopyHelper.inputEl);
	}

	init();

	this.bodyDomDelegate.on('click', function(ev) {
		if (!config.parentEl.contains(ev.target)) {
			textCopyHelper.destroy();
		}
	});
	this.bodyDomDelegate.on('keydown', function(ev) {
		// 27 = Escape, 9 = Tab
		if (ev.keyCode === 27 || ev.keyCode === 9) {
			textCopyHelper.destroy();
		}

		// 8 = Backspace
		if (ev.keyCode === 8) {
			ev.stopImmediatePropagation();
			ev.preventDefault();
		}
	});

	// Stop input from being edited
	this.inputDomDelegate.on('keypress', function(ev) {
		ev.preventDefault();
	});

	this.inputDomDelegate.on('copy', function() {
		textCopyHelper.tooltip.setText('Copied!');

		if (typeof config.onCopy === "function") {
			config.onCopy();
		}
	});

}

/**
 * Destroys the TextCopyHelper, disabling event listeners, and removing the input and tooltip from DOM. Also runs optional {@link config.onDestroy}
 */
TextCopyHelper.prototype.destroy = function() {
	this.inputEl.parentElement.removeChild(this.inputEl);
	this.tooltip.destroy();
	this.tooltip = undefined;
	this.inputEl = undefined;
	this.bodyDomDelegate.destroy();
	this.inputDomDelegate.destroy();

	if (typeof this.config.onDestroy === "function") {
		this.config.onDestroy();
	}
};


module.exports = TextCopyHelper;
