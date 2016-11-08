var DISCARD_DUPS = ['age', 'authorization', 'content-length', 'content-type', 'etag', 'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since', 'last-modified', 'location', 'max-forwards', 'proxy-authorization', 'referer', 'retry-after', 'user-agent']

module.exports = {
  toObject: toObject
}

function toObject (headers) {
  var headersObj = {}
  for (var pair of headers.entries()) {
    var key = pair[0].toLowerCase()
    var value = pair[1].toLowerCase()
    if (key === 'set-cookie') {
      headersObj[key] = headersObj[key] ? headersObj[key].push(value) : [value]
    } else if (typeof headersObj[key] === 'undefined') {
      headersObj[key] = value
    } else if (DISCARD_DUPS.indexOf(key) === -1) {
      headersObj[key] += ', ' + value
    }
  }
  return headersObj
}
