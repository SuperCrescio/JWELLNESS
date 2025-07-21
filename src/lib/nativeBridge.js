const isIOS = () => !!(window.webkit && window.webkit.messageHandlers);
const isAndroid = () => !!(window.Capacitor && window.Capacitor.androidBridge);

export const nativeBridge = {
  isNativeApp() {
    return isIOS() || isAndroid();
  },

  showNotification(options) {
    const { title, body } = options;
    console.log(`Native Bridge: Showing notification - ${title}: ${body}`);
    
    if (isIOS() && window.webkit.messageHandlers.notifications) {
      window.webkit.messageHandlers.notifications.postMessage({
        command: 'show',
        title: title,
        body: body,
      });
    } else if (isAndroid()) {
      window.Capacitor.androidBridge.postMessage(JSON.stringify({
        command: 'showNotification',
        title: title,
        body: body,
      }));
    } else {
      console.warn('Native notification bridge not found. Ignoring showNotification call.');
    }
  },

  clearNotification() {
    console.log('Native Bridge: Clearing notifications');
    if (isIOS() && window.webkit.messageHandlers.notifications) {
      window.webkit.messageHandlers.notifications.postMessage({
        command: 'clear',
      });
    } else if (isAndroid()) {
      window.Capacitor.androidBridge.postMessage(JSON.stringify({
        command: 'clearNotification',
      }));
    } else {
      console.warn('Native notification bridge not found. Ignoring clearNotification call.');
    }
  },
};

// Expose the bridge globally for easy access from native code if needed
window.nativeBridge = nativeBridge;