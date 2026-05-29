// Room8 Service Worker — handles Web Push notifications

self.addEventListener("push", (event) => {
  let data = { title: "Room8", body: "You have a new notification." };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Room8", {
      body:    data.body   || "",
      icon:    "/icon.png",
      badge:   "/icon.png",
      tag:     data.tag    || "room8-notification",
      data:    { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(target);
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(target);
      })
  );
});
