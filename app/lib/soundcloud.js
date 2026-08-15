// Utility to dynamically load the SoundCloud HTML5 Widget API script once

let scriptLoadingPromise = null;

export function loadSoundCloudAPI() {
  if (typeof window === "undefined") return Promise.reject("SSR not supported");
  if (window.SC && window.SC.Widget) return Promise.resolve(window.SC.Widget);

  if (!scriptLoadingPromise) {
    scriptLoadingPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById("sc-widget-api-script");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.SC.Widget));
        existingScript.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.id = "sc-widget-api-script";
      script.src = "https://w.soundcloud.com/player/api.js";
      script.async = true;
      script.onload = () => {
        if (window.SC && window.SC.Widget) {
          resolve(window.SC.Widget);
        } else {
          reject(new Error("SC.Widget unavailable after script load"));
        }
      };
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  return scriptLoadingPromise;
}
