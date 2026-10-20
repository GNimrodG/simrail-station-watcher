// Only shows station-free notifications: browsers like Chrome on Android don't allow `new Notification()` in a page.
// There is no fetch handler on purpose, the worker doesn't touch any request.

function notifyClients(station) {
  return self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => clients.forEach((client) => client.postMessage({ type: "station-notification-closed", station })));
}

self.addEventListener("notificationclick", (event) => {
  const { station, url } = event.notification.data ?? {};
  event.notification.close();

  event.waitUntil(Promise.all([notifyClients(station), url ? self.clients.openWindow(url) : Promise.resolve()]));
});

self.addEventListener("notificationclose", (event) => {
  event.waitUntil(notifyClients(event.notification.data?.station));
});
