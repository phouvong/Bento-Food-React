importScripts(
    'https://www.gstatic.com/firebasejs/9.13.0/firebase-app-compat.js'
)
importScripts(
    'https://www.gstatic.com/firebasejs/9.13.0/firebase-messaging-compat.js'
)
firebase?.initializeApp({
    apiKey: 'AIzaSyD0Z911mOoWCVkeGdjhIKwWFPRgvd6ZyAw',
    authDomain: 'stackmart-500c7.firebaseapp.com',
    projectId: 'stackmart-500c7',
    storageBucket: 'stackmart-500c7.appspot.com',
    messagingSenderId: '491987943015',
    appId: '1:491987943015:web:d8bc7ab8dbc9991c8f1ec2',
    measurementId: '',
})

// Retrieve firebase messaging
const messaging = firebase?.messaging()

messaging.onBackgroundMessage(function (payload) {
    const notificationTitle = payload.notification.title
    const notificationOptions = {
        body: payload.notification.body,
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
})
