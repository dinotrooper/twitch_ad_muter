const { test, beforeEach } = require("node:test");
const assert = require("node:assert");
const { main, reset_state } = require("../mute_tab.js");

/**
 * Minimal stand-in for the Twitch page: a mute button whose aria-label tracks
 * the muted state, and an ad label that is present while an ad plays.
**/
let page;

function create_page() {
    const page = { muted: false, ad: false, has_button: true };
    const button = {
        get ariaLabel() {
            return page.muted ? "Unmute (m)" : "Mute (m)";
        },
        click() {
            page.muted = !page.muted;
        },
        closest() {
            return null;
        },
    };
    global.document = {
        title: "test channel",
        querySelectorAll(selector) {
            if (selector.includes("player-mute-unmute-button")) {
                return page.has_button ? [button] : [];
            }
            return [];
        },
        querySelector(selector) {
            if (selector.includes("video-ad-label")) {
                return page.ad ? {} : null;
            }
            return null;
        },
    };
    return page;
}

function user_clicks_mute() {
    page.muted = !page.muted;
}

beforeEach(() => {
    reset_state();
    page = create_page();
});

test("mutes during an ad and unmutes after", () => {
    main();
    assert.strictEqual(page.muted, false);

    page.ad = true;
    main();
    assert.strictEqual(page.muted, true);

    page.ad = false;
    main();
    assert.strictEqual(page.muted, false);
});

test("unmutes after a pre-roll ad when switching channels", () => {
    // The player is still loading when the ad label appears.
    page.has_button = false;
    page.ad = true;
    main();

    page.has_button = true;
    main();
    assert.strictEqual(page.muted, true);

    page.ad = false;
    main();
    assert.strictEqual(page.muted, false);
});

test("keeps the stream unmuted if the user unmutes during an ad", () => {
    page.ad = true;
    main();
    user_clicks_mute();
    main();
    main();
    assert.strictEqual(page.muted, false);

    page.ad = false;
    main();
    assert.strictEqual(page.muted, false);
});

test("leaves the stream muted if the user muted it before the ad", () => {
    user_clicks_mute();
    main();

    page.ad = true;
    main();
    assert.strictEqual(page.muted, true);

    page.ad = false;
    main();
    assert.strictEqual(page.muted, true);
});

test("leaves the stream muted if the user re-mutes during an ad", () => {
    page.ad = true;
    main();
    user_clicks_mute();
    main();
    user_clicks_mute();
    main();

    page.ad = false;
    main();
    assert.strictEqual(page.muted, true);
});

test("mutes the next ad after the user unmuted the previous one", () => {
    page.ad = true;
    main();
    user_clicks_mute();
    main();

    page.ad = false;
    main();
    page.ad = true;
    main();
    assert.strictEqual(page.muted, true);

    page.ad = false;
    main();
    assert.strictEqual(page.muted, false);
});

test("does nothing when the mute button is missing", () => {
    page.has_button = false;
    page.ad = true;
    main();
    assert.strictEqual(page.muted, false);
});
