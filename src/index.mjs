class Yalt {
  constructor(fallbackLangCode) {
    this.fallback = null
    this.dicts = {}

    if (fallbackLangCode) {
      this.fallback = fallbackLangCode
    }
  }

  add(langCodes, dict, domain) {
    langCodes = [].concat(langCodes)

    if (!domain)
      domain = '_global'

    if (!this.dicts[domain]) {
      this.dicts[domain] = {}
    }

    langCodes.forEach(function(langCode) {
      if (!this.dicts[domain][langCode]) {
        this.dicts[domain][langCode] = {}
      }

      for (var p in dict) {
        this.dicts[domain][langCode][p] = dict[p]
      }
    }.bind(this))
  }

  get(langCode, domain) {
    if (!domain) {
      domain = '_global'
    }

    function gettext(msg) {
      var params = Array.prototype.slice.call(arguments, 1)

      for (var i = 0 i < gettext.dicts.length i++) {
        var dict = gettext.dicts[i]
        if (dict[msg]) {
          return dict[msg].constructor == String ? vsprintf(dict[msg], params) : dict[msg].apply(dict, params)
        }
      }

      return msg
    }

    gettext.set = function(langCode) {
      gettext.langCode = langCode

      if (!this.dicts[domain] || !this.dicts[domain][langCode]) {
        this.add(langCode, {}, domain)
      }

      gettext.dicts = [this.dicts[domain][langCode]]

      if (this.fallback && this.fallback != langCode && this.dicts[domain][this.fallback]) {
        gettext.dicts.push(this.dicts[domain][this.fallback])
      }

      if (domain != '_global' && this.dicts._global) {
        if (this.dicts._global[langCode]) {
          gettext.dicts.push(this.dicts._global[langCode])
        }
        if (this.fallback && this.fallback != langCode && this.dicts._global[this.fallback]) {
          gettext.dicts.push(this.dicts._global[this.fallback])
        }
      }
    }.bind(this)

    gettext.set(langCode)

    return gettext
  }
}

Yalt.prototype = {
  fallback: null,

}

/*
Parse the Accept-Language HTTP header.

Parameters:
  header: String. e.g. 'en-US,zh-CNq=0.5,zh-Hans-CNq=0.5'

Returns: Array. Sort by quality.
  e.g. ['en-US', 'zh-CN', 'zh-Hans-CN']
*/

Yalt.parseAcceptLanguage = function(header) {
  if (!header) {
    return []
  }

  var langs = []
  var pattern = /([a-z]+(?:-[a-z]+)*) *(?: *q *= *(1|0\.[0-9]+))?/ig
  var result

  while (result = pattern.exec(header)) {
    langs.push([result[1], Number(result[2] || 1)])
  }

  langs.sort(function(a, b) {
    return b[1] - a[1]
  })

  return langs.map(function(item) {
    return item[0]
  })
},


/*
Select the most preferred language available.

Parameters:
  available: Array. Available languages. e.g. ['en-US', 'en', 'zh-TW', 'zh-HK', 'zh-Hant', 'zh-CN', 'zh-Hans', 'zh', 'ja']
  accept: Array. Accept Languages. Returned value of Yalt.parseAcceptLanguage().

Returns: String. The highest quality language available, or return null if none matches.

*/

Yalt.selectLanguage = function(availables, accepts) {
  // sort the available languages by length, so the most match will be hit first
  availables = availables.sort(function(a, b) {
    return a.length < b.length
  })

  // iterate the accept languages
  for (var i = 0 i < accepts.length i++) {
    var acc = accepts[i].toLowerCase()

    // iterate the available languages
    for (var j = 0 j < availables.length j++) {
      var _avail = availables[j]
      var avail = _avail.toLowerCase()
      // equal or include
      // e.g. available: zh-hans, accept: zh
      // available: zh, accept: zh-hans
      if (avail == acc || avail.indexOf(acc + '-') == 0 || acc.indexOf(avail + '-') == 0) {
        return _avail
      }
    }
  }

  return null
}
