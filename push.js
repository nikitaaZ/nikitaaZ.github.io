firebase.initializeApp({
    messagingSenderId: '685431820643'
});

var bt_delete = $('#stop');

if (window.location.protocol === 'https:' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'localStorage' in window &&
    'fetch' in window &&
    'postMessage' in window
) { 
    var messaging = firebase.messaging();
     // already granted
    bt_delete.on('click', function() {
        // Delete Instance ID token.
        messaging.getToken()
            .then(function(currentToken) {
                messaging.deleteToken(currentToken)
                    .then(function() {
                        console.log('Token deleted.');
                        setTokenSentToServer(false);
                        // Once token is deleted update UI.
                    })
                    .catch(function(error) {
                    });
            })
            .catch(function(error) {
            });
    }); 
    messaging.onMessage(function(payload) {
        console.log('Message received. ', payload);
        info_message
            .text('')
            .append('<strong>'+payload.notification.title+'</strong>')
            .append('<em> '+payload.notification.body+'</em>')
        ;

        // register fake ServiceWorker for show notification on mobile devices
        navigator.serviceWorker.register('/serviceworker/messaging-sw.js');
        Notification.requestPermission(function(permission) {
            if (permission === 'granted') {
                navigator.serviceWorker.ready.then(function(registration) {
                    payload.notification.data = payload.notification;
                    registration.showNotification(payload.notification.title, payload.notification);
                }).catch(function(error) {
                    // registration failed :(
                    showError('ServiceWorker registration failed.', error);
                });
            }
        });
    });
    
       messaging.onTokenRefresh(function() {
        messaging.getToken()
            .then(function(refreshedToken) {
                console.log('Token refreshed.');
                // Send Instance ID token to app server.
                sendTokenToServer(refreshedToken);
            })
    });
}

function getToken() {
    messaging.requestPermission()
        .then(function() {
            // Get Instance ID token. Initially this makes a network call, once retrieved
            // subsequent calls to getToken will return from cache.
            messaging.getToken()
                .then(function(currentToken) {

                    if (currentToken) {
                        sendTokenToServer(currentToken);
                    } else {
                        setTokenSentToServer(false);
                    }
                })
                .catch(function(error) {
                    setTokenSentToServer(false);
                });
        })
        .catch(function(error) {
            showError('Unable to get permission to notify.', error);
        });
}

function sendNotification(notification) {
    var key = 'AAAAn5brkWM:APA91bEsY_gH8-XmxAcrjp-3GNj4rXuBauQiNbG-ePuwAfLX9qEBb7MYnOarBwL_L-cDP7Wb5FKr2stdstxmBquPD8SiXrLC38uGIihahFJRRRsOQoR1CeV-lunnfdrVJC_hWqqWvyRr';

    console.log('Send notification', notification);

    // hide last notification data
    messaging.getToken()
        .then(function(currentToken) {
            fetch('https://fcm.googleapis.com/fcm/send', {
                'method': 'POST',
                'headers': {
                    'Authorization': 'key=' + key,
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'notification': {
                        "title":"Контролеры Брест",
                        "body": notification,
                        "icon": "https://peter-gribanov.github.io/serviceworker/Bubble-Nebula.jpg",
                        "click_action": "https://www.nasa.gov/feature/goddard/2016/hubble-sees-a-star-inflating-a-giant-bubble"
                    },
                    'to': currentToken
                })
            }).then(function(response) {
                return response.json();
            }).then(function(json) {
                console.log('Response', json);

                if (json.success == 1) {
                    massage_row.show();
                    massage_id.text(json.results[0].message_id);
                } else {
                    massage_row.hide();
                    massage_id.text(json.results[0].error);
                }
            }).catch(function(error) {
                showError(error);
            });
        })
        .catch(function(error) {
            showError('Error retrieving Instance ID token.', error);
        });
}
function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer(currentToken)) {
        console.log('Sending token to server...');
        // send current token to server
        //$.post(url, {token: currentToken});
        setTokenSentToServer(currentToken);
    } else {
        console.log('Token already sent to server so won\'t send it again unless it changes');
    }
}

function isTokenSentToServer(currentToken) {
    return window.localStorage.getItem('sentFirebaseMessagingToken') == currentToken;
}

function setTokenSentToServer(currentToken) {
    if (currentToken) {
        window.localStorage.setItem('sentFirebaseMessagingToken', currentToken);
    } else {
        window.localStorage.removeItem('sentFirebaseMessagingToken');
    }
}
