/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

/* global self, window, navigator, document, require, process, module */
;(function (app) {
  'use strict'
  var namespace = 'cuid'
  var c = 0
  var blockSize = 4
  var base = 36
  var discreteValues = Math.pow(base, blockSize)

  var pad = function pad (num, size) {
    var s = '000000000' + num
    return s.substr(s.length - size)
  }

  var randomBlock = function randomBlock () {
    return pad((Math.random() *
    discreteValues << 0)
      .toString(base), blockSize)
  }

  var safeCounter = function () {
    c = (c < discreteValues) ? c : 0
    c++ // this is not subliminal
    return c - 1
  }

  var api = function cuid () {
    // Starting with a lowercase letter makes
    // it HTML element ID friendly.
    var letter = 'c' // hard-coded allows for sequential access

    // timestamp
    // warning: this exposes the exact date and time
    // that the uid was created.
    var timestamp = (new Date().getTime()).toString(base)

    // Prevent same-machine collisions.
    var counter

    // A few chars to generate distinct ids for different
    // clients (so different computers are far less
    // likely to generate the same id)
    var fingerprint = api.fingerprint()

    // Grab some more chars from Math.random()
    var random = randomBlock() + randomBlock()

    counter = pad(safeCounter().toString(base), blockSize)

    return (letter + timestamp + counter + fingerprint + random)
  }

  api.slug = function slug () {
    var date = new Date().getTime().toString(36)
    var counter
    var print = api.fingerprint().slice(0, 1) +
                api.fingerprint().slice(-1)
    var random = randomBlock().slice(-2)

    counter = safeCounter().toString(36).slice(-4)

    return date.slice(-2) +
      counter + print + random
  }

  api.globalCount = function globalCount () {
    // We want to cache the results of this
    var cache = (function calc () {
      var env = typeof window === 'object' ? window : self
      return Object.keys(env).length
    }())

    api.globalCount = function () { return cache }
    return cache
  }

  api.fingerprint = function browserPrint () {
    return pad((
      navigator.userAgent.length).toString(36) +
      api.globalCount().toString(36), 4)
  }

  // don't change anything from here down.
  if (app.register) {
    app.register(namespace, api)
  } else if (typeof module !== 'undefined') {
    module.exports = api
  } else {
    app[namespace] = api
  }
}(this.applitude || this))
