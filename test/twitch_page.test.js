/**
 * Checks the addon's selectors against the Twitch player as captured during
 * an ad (test/fixtures/twitch_ad_player.html, saved 2026-10-20). If Twitch
 * changes its markup, capture a new page during an ad and replace the fixture.
**/
const { test, beforeEach } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const {
    main,
    get_mute_button,
    is_button_muted,
    is_ad_current,
    reset_state,
} = require("../mute_tab.js");

const fixture = fs.readFileSync(path.join(__dirname, "fixtures", "twitch_ad_player.html"), "utf8");
const mute_selector = '[data-a-target="player-mute-unmute-button"]';

function load_page() {
    global.document = new JSDOM(fixture).window.document;
}

function all_mute_buttons() {
    return [...document.querySelectorAll(mute_selector)];
}

beforeEach(() => {
    reset_state();
    load_page();
});

test("fixture has a visible mute button and a hidden copy", () => {
    const buttons = all_mute_buttons();
    assert.strictEqual(buttons.length, 2);
    assert.strictEqual(buttons.filter((button) => button.closest("[hidden]")).length, 1);
});

test("finds the visible mute button", () => {
    const button = get_mute_button();
    assert.ok(button);
    assert.strictEqual(button.closest("[hidden]"), null);
});

test("finds the visible mute button even when the hidden copy comes first", () => {
    const hidden_controls = document.querySelector("[hidden]");
    hidden_controls.parentElement.prepend(hidden_controls);
    assert.ok(all_mute_buttons()[0].closest("[hidden]"));

    assert.strictEqual(get_mute_button().closest("[hidden]"), null);
});

test("reads the muted state from the button label", () => {
    // The page was saved while the addon had the ad muted.
    assert.strictEqual(is_button_muted(get_mute_button()), true);

    get_mute_button().setAttribute("aria-label", "Mute (m)");
    assert.strictEqual(is_button_muted(get_mute_button()), false);
});

test("detects the ad label", () => {
    assert.strictEqual(is_ad_current(), true);

    document.querySelector('[data-a-target="video-ad-label"]').remove();
    assert.strictEqual(is_ad_current(), false);
});

test("clicks the visible mute button when an ad starts", () => {
    for (const button of all_mute_buttons()) {
        button.setAttribute("aria-label", "Mute (m)");
    }
    const clicked = [];
    for (const button of all_mute_buttons()) {
        button.addEventListener("click", () => clicked.push(button));
    }

    main();

    assert.strictEqual(clicked.length, 1);
    assert.strictEqual(clicked[0].closest("[hidden]"), null);
});
