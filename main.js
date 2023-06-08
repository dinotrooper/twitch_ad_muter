var tabs = browser.tabs;
let delay_log = false;
const cached_tabs = [];

function is_tab_already_cached(tab_id) {
    for (let tab of cached_tabs) {
        if (tab.id == tab_id) {
            return true;
        }
    }
    return false;
}

async function has_tab_been_deleted(tab_id) {
    let twitch_tabs = await get_twitch_tabs();
    for (let tab of twitch_tabs) {
        if (tab.id == tab_id) {
            return false;
        }
    }
    return true;
}

async function get_twitch_tabs() {
    let twitch_tabs = await tabs.query({url:"*://*.twitch.tv/*"});
    return twitch_tabs;
}

async function click_mute_button(tab_id) {
    let click_button_code_two = `
        button = document.querySelector('[data-a-target="player-mute-unmute-button"]');
        if (button) {
            button.click();
        }
        delete button;
    `;
    try {
        await tabs.executeScript(tab_id, {code: click_button_code_two});
    } catch (error) {
        console.error(error);
    }
}

async function update_cache_tabs(){
    try {
        let twitch_tabs = await get_twitch_tabs();
        for (let tab of twitch_tabs) {
            if (!is_tab_already_cached(tab.id)) {
                let cached_tab = {id: tab.id, muted: false}; 
                cached_tabs.push(cached_tab);
            }
        }
        for (let cached_tab of cached_tabs) {
            let result = await has_tab_been_deleted(cached_tab.id);
            if (result) {
                remove_cached_tab(cached_tab);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function remove_cached_tab(cached_tab) {
    let index = cached_tabs.indexOf(cached_tab);
    cached_tabs.splice(index, 1);
}

function update_cached_tab(tab_id, new_state) {
    for (let cached_tab of cached_tabs) {
        if (cached_tab.id == tab_id) {
            let index = cached_tabs.indexOf(cached_tab);   
            cached_tabs.splice(index, 1);
            let tmp_tab = {id: tab_id, muted: new_state};
            cached_tabs.push(tmp_tab);
        }
    }
}

async function check_and_mute_cached_tabs(){
    try {
        for (let tab of cached_tabs) {
            let result = await tabs.executeScript(tab.id, {
                code: 'document.querySelector(\'[data-a-target="video-ad-label"]\') != null;'
            });
            if (result[0] == undefined) {
                continue;
            }
            if (result[0] && !tab.muted) {
                console.debug("Muting Twitch stream: ", tab.id);
                // await tabs.update(tab.id, {muted: true});
                update_cached_tab(tab.id, true);
                await click_mute_button(tab.id);
            } else if (!result[0] && tab.muted) {
                console.debug("Unmuting Twitch stream: ", tab.id);
                // await tabs.update(tab.id, {muted: false});
                update_cached_tab(tab.id, false);
                await click_mute_button(tab.id);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function main(){
    await update_cache_tabs();
    check_and_mute_cached_tabs();
    if (delay_log){
        delay_log = false;
    } else {
        delay_log = true;
        console.log("cached tabs = ", cached_tabs);
    }
}

async function check_and_mute_tabs() {
    try {
        let allTabs = await tabs.query({});
        for (let tab of allTabs) {
            let result = await tabs.executeScript(tab.id, {
                code: 'document.querySelector(\'[data-a-target="video-ad-label"]\') != null;'
            });
            if (result[0] == undefined) {
                continue;
            }
            if (result[0]) {
                console.log("muting tab ", tab.id);
                // await tabs.update(tab.id, {muted: true});
                click_mute_button(tab.id);
            } else {
                console.log("unmuting tab ", tab.id);
                // await tabs.update(tab.id, {muted: false});
                click_mute_button(tab.id);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

const CHECK_INTERVAL_MS = 1000;

setInterval(async () => {
    await main();
}, CHECK_INTERVAL_MS);