const Settings = (function () {
  const settings = {};

  const settingsNames = 
    ["clamppitch", "snap", "slidemidi2tc", "slidetccc", "pitchbendrange"];

  function getSetting(name) {
    switch (name) {
      case "clamppitch":
      case "slidemidi2tc":
      case "slidetccc":
        return settings[name].checked;
      case "snap":
      case "pitchbendrange":
        return Number(settings[name].value);
      default:
        throw `Unknown setting: ${name}`;
    }
  }

  Init.register(function () {
    for (const settingName of settingsNames) {
      const setting = document.getElementById(settingName);
      if (!setting) throw `Could not find setting: ${settingName}`;
      settings[settingName] = setting;
    }
  });

  return { getSetting };
})();
