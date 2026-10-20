/**
 * True only while the stream is muted because the addon muted it for an ad.
 * Any other mute state belongs to the user and is left alone.
**/
var muted_by_addon = false;
/**
 * True when the user unmuted during the current ad, so it is not muted again
 * until the next ad.
**/
var user_unmuted_ad = false;

const CHECK_INTERVAL_MS = 1000;
const true_button_label = "Unmute (m)";

/**
 * Twitch re-renders the player when changing channels (and sometimes around
 * ads), so the mute button is looked up fresh on every check instead of cached.
 * The player also keeps a hidden copy of its controls, so prefer a button that
 * is not inside a hidden element.
**/
function get_mute_button() {
    const buttons = document.querySelectorAll('[data-a-target="player-mute-unmute-button"]');
    for (const button of buttons) {
        if (!button.closest("[hidden]")) {
            return button;
        }
    }
    return buttons[0] || null;
}

function is_button_muted(button) {
    return button.ariaLabel == true_button_label;
}

function is_ad_current() {
    return document.querySelector('[data-a-target="video-ad-label"]') != null;
}

function main() {
    const mute_button = get_mute_button();
    if (!mute_button) {
        console.debug(`Mute button is not present on ${document.title}.`);
        return;
    }
    const is_muted = is_button_muted(mute_button);
    const ad_current = is_ad_current();

    if (!ad_current) {
        user_unmuted_ad = false;
    }

    if (muted_by_addon && !is_muted) {
        // The user unmuted during the ad (or the player was reset). Respect it.
        console.debug(`Stream was unmuted outside the addon on ${document.title}.`);
        muted_by_addon = false;
        user_unmuted_ad = ad_current;
    }
    else if (ad_current && !is_muted && !muted_by_addon && !user_unmuted_ad) {
        console.debug(`Ad is present on ${document.title}. Muting stream.`);
        mute_button.click();
        muted_by_addon = true;
    }
    else if (!ad_current && muted_by_addon) {
        console.debug(`Ad is not present on ${document.title}. Unmuting stream.`);
        mute_button.click();
        muted_by_addon = false;
    }
}

if (typeof module !== "undefined") {
    // Running under Node for tests: expose main and a state reset instead of polling.
    module.exports = {
        main,
        get_mute_button,
        is_button_muted,
        is_ad_current,
        reset_state() {
            muted_by_addon = false;
            user_unmuted_ad = false;
        },
    };
} else {
    setInterval(main, CHECK_INTERVAL_MS);
}
