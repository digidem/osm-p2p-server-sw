function testServer (cb) {
  registerServiceWorker(function (err, registration) {
    if (err) return console.error(err)
    cb({
      server: {
        cleanup: cb => {
          msgServiceWorker('cleanup', function (err, reply) {
            if (err) console.error(err)
            if (err) cb(err)
            cb()
          })
        }
      },
      base: window.location.protocol + '//' + window.location.host + '/api/0.6/'
    })
  })
}

module.exports = testServer

function registerServiceWorker (cb) {
  if (!('serviceWorker' in navigator)) {
    return cb(new Error('ServiceWorker not supported'))
  }

  navigator.serviceWorker.register('/sw.js').then(function (registration) {
    // The service worker has been registered!
    if (navigator.serviceWorker.controller) cb()
  }).catch(err => console.log('oops', err))

  // Listen for claiming of our ServiceWorker
  navigator.serviceWorker.addEventListener('controllerchange', function (event) {
    // Listen for changes in the state of our ServiceWorker
    navigator.serviceWorker.controller.addEventListener('statechange', function () {
      // If the ServiceWorker becomes "activated", let the user know they can go offline!
      if (this.state === 'activated') cb()
    })
  })
}

function msgServiceWorker (msg, cb) {
  var msgCh = new window.MessageChannel()
  msgCh.port1.onmessage = function (evt) {
    if (evt.data.error) return cb(evt.data.error)
    cb(null, evt.data)
  }
  navigator.serviceWorker.controller.postMessage(msg, [msgCh.port2])
}
