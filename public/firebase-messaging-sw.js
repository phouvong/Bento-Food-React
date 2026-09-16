importScripts(
    'https://www.gstatic.com/firebasejs/9.13.0/firebase-app-compat.js'
)
importScripts(
    'https://www.gstatic.com/firebasejs/9.13.0/firebase-messaging-compat.js'
)

// A static file can't read process.env, so the config is passed in via the
// registration URL's query string instead (see registerFirebaseSw in
// src/firebase.js) — the values still originate from NEXT_PUBLIC_FIREBASE_*
// env vars, just handed off at registration time rather than hardcoded here.
const firebaseConfig = Object.fromEntries(
    new URL(location.href).searchParams.entries()
)

firebase?.initializeApp(firebaseConfig)

// Retrieve firebase messaging
const messaging = firebase?.messaging()

messaging.onBackgroundMessage(function (payload) {
    const notificationTitle = payload.notification.title
    const notificationOptions = {
        body: payload.notification.body,
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
})
