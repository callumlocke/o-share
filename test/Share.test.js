/* eslint-env mocha, sinon, proclaim */

import proclaim from 'proclaim';
import sinon from 'sinon/pkg/sinon';
import * as fixtures from './helpers/fixtures';

sinon.assert.expose(proclaim, {
	includeFail: false,
	prefix: ''
});

const Share = require('./../main');


let testShare;
let shareEl;

describe('general behaviour', () => {

	beforeEach(() => {
		fixtures.insertShareLinks();
		shareEl = document.querySelector('[data-o-component=o-share]');
		testShare = new Share(shareEl);
	});

	afterEach(() => {
		testShare.destroy();
		fixtures.reset();
	});

	it('initialisation', () => {
		proclaim.isTrue(shareEl.hasAttribute('data-o-share--js'));
	});
});

describe('links', () => {
	let twitterLinkEl;
	let spy;

	beforeEach(() => {
		fixtures.insertShareLinks();
		shareEl = document.querySelector('[data-o-component=o-share]');
		testShare = new Share(shareEl);
		spy = newWindowSpy();
		window.open = spy.func;
		twitterLinkEl = document.querySelector('.o-share__action--twitter a');
		const ev = document.createEvent('Event');
		ev.initEvent('click', true, true);
		twitterLinkEl.dispatchEvent(ev);
	});

	afterEach(() => {
		testShare.destroy();
		fixtures.reset();
	});

	it('clicking link opens new window', () => {
		proclaim.strictEqual(spy.calledWith[0], twitterLinkEl.getAttribute('href'));
		proclaim.strictEqual(spy.calledWith[1], '');
		proclaim.strictEqual(spy.calledWith[2], 'width=646,height=436');
	});

	it('clicking link opens new window only once', () => {
		proclaim.strictEqual(spy.callCount, 1);

		proclaim.strictEqual(spy.calledWith[0], twitterLinkEl.getAttribute('href'));
		proclaim.strictEqual(spy.calledWith[1], '');
		proclaim.strictEqual(spy.calledWith[2], 'width=646,height=436');

		const ev = document.createEvent('Event');
		ev.initEvent('click', true, true);
		twitterLinkEl.dispatchEvent(ev);
		proclaim.strictEqual(spy.callCount, 1);
	});
});

describe('component', () => {
	let spy;

	beforeEach(() => {
		fixtures.insertShareComponent();
		shareEl = document.querySelector('[data-o-component=o-share]');
		new Share(shareEl);

		spy = newWindowSpy();
		window.open = spy.func;
	});

	it('generates markup when instantiating a component', () => {
		proclaim.instanceOf(document.querySelector('.o-share__action--twitter'), HTMLElement);
		proclaim.instanceOf(document.querySelector('.o-share__action--facebook'), HTMLElement);
		proclaim.instanceOf(document.querySelector('.o-share__action--linkedin'), HTMLElement);
		proclaim.instanceOf(document.querySelector('.o-share__action--whatsapp'), HTMLElement);
		proclaim.instanceOf(document.querySelector('.o-share__action--googleplus'), HTMLElement);
		proclaim.instanceOf(document.querySelector('.o-share__action--pinterest'), HTMLElement);
		proclaim.instanceOf(document.querySelector('.o-share__action--link'), HTMLElement);
	});

	it('responds correctly to twitter clicks in the component', () => {
		const twitterLinkElement = document.querySelector('.o-share__action--twitter a');
		const event = document.createEvent('Event');
		event.initEvent('click', true, true);
		twitterLinkElement.dispatchEvent(event);

		proclaim.strictEqual(spy.callCount, 1);
		proclaim.strictEqual(spy.calledWith[0], twitterLinkElement.getAttribute('href'));
		proclaim.strictEqual(spy.calledWith[1], '');
		proclaim.strictEqual(spy.calledWith[2], 'width=646,height=436');

	});

	it('responds correctly to url clicks in the component', () => {
		proclaim.isNull(document.querySelector('.o-share-tooltip'));

		const urlLinkElement = document.querySelector('.o-share__action--link a');
		const event = document.createEvent('Event');
		event.initEvent('click', true, true);
		urlLinkElement.dispatchEvent(event);

		proclaim.instanceOf(document.querySelector('.o-share-tooltip'), HTMLElement);
		proclaim.equal(document.querySelector('.o-share__action--link input').value, 'https://www.ft.com/content/test');
	});
});

describe('data normalisation', () => {
	it('converts relative urls to absolute urls before sharing them', () => {
		fixtures.insertRelativeShareComponent();
		shareEl = document.querySelector('[data-o-component=o-share]');
		new Share(shareEl);

		const twitterLinkElement = document.querySelector('.o-share__action--twitter a');
		proclaim.match(twitterLinkElement.getAttribute('href'), /url=https?:\/\/localhost:[\d]+\/content\/test/);
	});
});

function newWindowSpy() {
	const self = {
		callCount: 0,
		calledWith: [],
		func: function() {
			self.callCount++;
			self.calledWith = arguments;

			return {
				focus: function() {}
			};
		}
	};

	return self;
}
