document.addEventListener("DOMContentLoaded", function() {
  // Retrieve stored options and update the UI
  browser.storage.local.get(["update_interval", "tabs_to_mute"]).then(function(result) {
    document.getElementById("update_interval").value = result.textboxValue || "1000";
    if (result.radioOption === "all_tabs") {
      document.getElementById("all_tabs").checked = true;
    } else if (result.radioOption === "only_activate_tab") {
      document.getElementById("only_activate_tab").checked = true;
    }
  });

  // Save options when the save button is clicked
  document.getElementById("saveButton").addEventListener("click", function() {
    var update_interval_value = document.getElementById("update_interval").value;
    var tabs_to_mute_value = document.querySelector('input[name="tabs_to_mute"]:checked').value;

    // Store options in browser storage
    browser.storage.local.set({
      update_interval: update_interval_value,
      radioOption: tabs_to_mute_value
    }).then(function() {
      console.log("Options saved!");
    }).catch(function(error) {
      console.error("Error saving options:", error);
    });
  });
});
