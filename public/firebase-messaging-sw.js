importScripts(
    'https://www.gstatic.com/firebasejs/9.13.0/firebase-app-compat.js'
)
importScripts(
    'https://www.gstatic.com/firebasejs/9.13.0/firebase-messaging-compat.js'
)
firebase?.initializeApp({
    apiKey: 'AIzaSyCHZCBLcVJf2NqZYsd37TzUxqzVcDI-2JU',
    authDomain: 'bento-food.firebaseapp.com',
    projectId: 'bento-food',
    storageBucket: 'bento-food.appspot.com',
    messagingSenderId: '299589180044',
    appId: '1:299589180044:web:b575785f8db4c9d93f79a9',
    measurementId: 'G-BS3XFY11Q6',
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
