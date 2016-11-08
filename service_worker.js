/* global self,URL,Response */

var osmdb = require('osm-p2p')
var osmRouter = require('osm-p2p-server')
var streamFromPromise = require('stream-from-promise')
var onEnd = require('end-of-stream')

var MockResponse = require('./lib/response')
var headers = require('./lib/headers')

var osm = osmdb()
var router = osmRouter(osm)

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', function (event) {
  var req = mockRequest(event.request)
  var res = new MockResponse()
  if (router.handle(req, res)) {
    console.log(req.url)
    event.respondWith(resToPromise(res))
  }
})

self.addEventListener('message', function (event) {
  if (event.data === 'cleanup') {
    cleanup(function (err) {
      console.log('cleaned')
      if (err) return event.ports[0].postMessage({ error: err })
      osm = osmdb()
      router = osmRouter(osm)
      event.ports[0].postMessage('cleaned')
    })
  }
})

function cleanup (cb) {
  var pending = 3
  var errors = []
  cleanChunkStore(osm.kdb.kdb.store, done)
  cleanLevelDB(osm.db, done)
  cleanLevelDB(osm.log.db, done)
  function done (err) {
    console.log('done', pending)
    if (err) errors.push(err)
    if (--pending === 0) cb(errors[0])
  }
}

function cleanLevelDB (levelup, cb) {
  var storeName = levelup.db.idb.storeName
  var db = levelup.db.idb.db
  var transaction = db.transaction([storeName], 'readwrite')
  var store = transaction.objectStore(storeName)
  transaction.addEventListener('error', function (err) { cb(err) })
  var request = store.clear()
  request.onsuccess = function () { cb() }
  request.onerror = cb
}

function cleanChunkStore (chunkStore, cb) {
  chunkStore._store('readwrite', function (err, store) {
    if (err) return cb(err)
    var request = store.clear()
    request.onsuccess = function () { cb() }
    request.onerror = cb
  })
}

function mockRequest (request) {
  var req = streamFromPromise(request.text())
  var url = new URL(request.url)
  req.url = url.pathname + url.search
  req.method = request.method
  req.headers = headers.toObject(request.headers)
  return req
}

function resToPromise (res) {
  return new Promise(function (resolve, reject) {
    onEnd(res, function (err) {
      if (err) return reject(err)
      var init = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res._headers
      }
      resolve(new Response(res._body, init))
    })
  })
}
