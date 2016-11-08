// Mocks http.ServerResponse

module.exports = ServerResponse

var Writable = require('readable-stream/writable')
var inherits = require('inherits')
var status = require('statuses')

function ServerResponse () {
  Writable.call(this)

  this.statusCode = 200
  this.statusMessage = status[this.statusCode]
  this._headers = {}
  this._body = ''
}

inherits(ServerResponse, Writable)

var SRproto = ServerResponse.prototype

SRproto._write = function (chunk, encoding, next) {
  if (chunk) this._body += chunk.toString()
  next()
}

SRproto.setHeader = function (name, value) {
  this._headers[name.toLowerCase()] = value
}

SRproto.getHeader = function (name) {
  return this._headers[name.toLowerCase()]
}

SRproto.removeHeader = function (name) {
  delete this._headers[name.toLowerCase()]
}

SRproto.writeHead = function (statusCode, reason, headers) {
  if (arguments.length === 2 && typeof arguments[1] !== 'string') {
    headers = reason
    reason = undefined
  }
  this.statusCode = statusCode
  this.statusMessage = reason || status[statusCode] || 'unknown'
  if (headers) {
    for (var name in headers) {
      this.setHeader(name, headers[name])
    }
  }
}
