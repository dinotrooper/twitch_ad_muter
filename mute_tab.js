var user_muted = false;
var prev_muted = false;
var init_status = false;
var old_url = window.location.href;
var tab_title = document.title

var mute_button = document.querySelector('[data-a-target="player-mute-unmute-button"]'); 
if (!mute_button) {
    console.error(`Cannot find mute button on ${tab_title}`);
}
const CHECK_INTERVAL_MS = 1000;
const true_button_label = "Unmute (m)";

async function update_url() { 
    new_url = window.location.href;
    if (new_url !== old_url) {
        console.debug(`URL changed to ${new_url}`);
        old_url = new_url;
        tab_title = document.title;
        /**
         * When a user changes channels, the page finishes loading first before
         * the mute button element is present. We have to wait before we can
         * check the status of the mute button.
        **/
        setTimeout(update_mute_button, 1000);
    }
    return Promise.resolve();
}
function update_mute_button() {
    console.debug("looking for new mute button.");
    /**
     * If the user visited a previous channel in this tab, we need to remove the previous
     * mute button event listener.
    **/
    if (mute_button) {
        mute_button.removeEventListener("click", update_user_muted);
    }
    mute_button = document.querySelector('[data-a-target="player-mute-unmute-button"]');
    if (mute_button){
        init_status = is_button_muted(mute_button);
        console.debug(`init_status = ${init_status}`);
        mute_button.addEventListener("click", update_user_muted);
    } else {
        console.error(`Cannot find mute button on ${tab_title}`);
    }
}

function update_user_muted(event) {
    console.debug("isTrusted = " + event.isTrusted);
    if (!event.isTrusted) {
        console.debug(`Not a user click. Ignoring.`);
    }
    else if (is_button_muted(mute_button)){
        console.debug(`User unmuted stream on ${tab_title}`);
        user_muted = false;
        init_status = false;
    }
    else {
        console.log(`User muted stream on ${tab_title}`);
        user_muted = true;
    }
}

setInterval(async () => {
    await update_url();
    await main();
}, CHECK_INTERVAL_MS);


function is_button_muted(button) {
    console.debug(`button.ariaLabel = ${button.ariaLabel}`);
    return button.ariaLabel == true_button_label;
}

function is_ad_current() {
    return document.querySelector('[data-a-target="video-ad-label"]') != null;
}

async function main(){
    if (!mute_button) {
        console.error(`Mute button is not present on ${tab_title}.`);
    }
    else if (init_status || user_muted) {
        console.debug(`Tab started muted or user muted stream on ${tab_title}.`);
    }
    else if (user_muted) {
        console.debug(`User manually muted stream on ${tab_title}.`)
    }
    else if (is_ad_current() && !prev_muted) {
        console.debug(`Ad is present on ${tab_title}. Muting stream.`)
        mute_button.click();
        prev_muted = true;
    }
    else if (!is_ad_current() && prev_muted) {
        console.debug(`Ad is not present ${tab_title}. Unmuting stream.`)
        mute_button.click();
        prev_muted = false;
    }
    return Promise.resolve();
}