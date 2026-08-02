// Custom Service Worker logic for Push Notifications
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('push', (event: PushEvent) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/icon-192x192.png',
            badge: data.badge || '/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.data?.url || '/'
            }
        };

        event.waitUntil(
            sw.registration.showNotification(data.title, options)
        );
    }
});

sw.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();
    event.waitUntil(
        sw.clients.openWindow(event.notification.data.url)
    );
});
