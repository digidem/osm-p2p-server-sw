if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(function (registration) {
    // The service worker has been registered!
    console.log('registered!')
    console.log(navigator.serviceWorker.controller)
  }).catch(err => console.log('oops', err))

  // Listen for claiming of our ServiceWorker
  navigator.serviceWorker.addEventListener('controllerchange', function(event) {
    console.log('controllerchange')
    // Listen for changes in the state of our ServiceWorker
    navigator.serviceWorker.controller.addEventListener('statechange', function() {
      // If the ServiceWorker becomes "activated", let the user know they can go offline!
      console.log('state', this.state)
    });
  });
}

