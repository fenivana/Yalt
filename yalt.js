function Yalt(fallbackLangCode) {
  this.dicts = {};
  if (fallbackLangCode) {
    this.fallback = fallbackLangCode;
  }
}

Yalt.prototype = {
  fallback: null,

  add: function(langCodes, dict, domain) {
    langCodes = [].concat(langCodes);

    if (!domain)
      domain = '_global';

    if (!this.dicts[domain]) {
      this.dicts[domain] = {};
    }

    langCodes.forEach(function(langCode) {
      if (!this.dicts[domain][langCode]) {
        this.dicts[domain][langCode] = {};
      }

      for (var p in dict) {
        this.dicts[domain][langCode][p] = dict[p];
      }
    }.bind(this));
  },

  get: function(langCode, domain) {
    if (!domain) {
      domain = '_global';
    }

    function gettext(msg) {
      var params = Array.prototype.slice.call(arguments, 1);

      for (var i = 0; i < gettext.dicts.length; i++) {
        var dict = gettext.dicts[i];
        if (dict[msg]) {
          return dict[msg].constructor == String ? vsprintf(dict[msg], params) : dict[msg].apply(dict, params);
        }
      }

      return msg;
    }

    gettext.set = function(langCode) {
      gettext.langCode = langCode;

      if (!this.dicts[domain] || !this.dicts[domain][langCode]) {
        this.add(langCode, {}, domain);
      }

      gettext.dicts = [this.dicts[domain][langCode]];

      if (this.fallback && this.fallback != langCode && this.dicts[domain][this.fallback]) {
        gettext.dicts.push(this.dicts[domain][this.fallback]);
      }

      if (domain != '_global' && this.dicts._global) {
        if (this.dicts._global[langCode]) {
          gettext.dicts.push(this.dicts._global[langCode]);
        }
        if (this.fallback && this.fallback != langCode && this.dicts._global[this.fallback]) {
          gettext.dicts.push(this.dicts._global[this.fallback]);
        }
      }
    }.bind(this);

    gettext.set(langCode);

    return gettext;
  },

  /*
  Parse the Accept-Language HTTP header.

  Parameters:
    header: String. e.g. 'en-US,zh-CN;q=0.5,zh-Hans-CN;q=0.5'

  Returns: Array. Sort by quality.
    e.g. ['en-US', 'zh-CN', 'zh-Hans-CN']
  */

  parseAcceptLanguage: function(header) {
    if (!header) {
      return [];
    }

    var langs = [];
    var pattern = /([a-z]+(?:-[a-z]+)*) *(?:; *q *= *(1|0\.[0-9]+))?/ig;
    var result;

    while (result = pattern.exec(header)) {
      langs.push([result[1], Number(result[2] || 1)]);
    }

    langs.sort(function(a, b) {
      return b[1] - a[1];
    });

    return langs.map(function(item) {
      return item[0];
    });
  },


  /*
  Select the most preferred language available.

  Parameters:
    available: Array. Available languages. e.g. ['en-US', 'en', 'zh-TW', 'zh-HK', 'zh-Hant', 'zh-CN', 'zh-Hans', 'zh', 'ja']
    accept: Array. Accept Languages. Return value of parseAcceptLanguage().

  Returns: String. The highest quality language available, or null if no accept.
  */

  selectLanguage: function(available, accept) {
    // sort the available languages to match the most.
    available = available.sort(function(a, b) {
      return a.length < b.length;
    });

    for (var i = 0; i < accept.length; i++) {
      var ac = accept[i].toLowerCase();
      for (var j = 0; j < available.length; j++) {
        var av = available[j].toLowerCase();
        if (av == ac || av.indexOf(ac + '-') == 0 || ac.indexOf(av + '-') == 0) {
          return available[j];
        }
      }
    }

    return null;
  }
};

// CommonJS
if (typeof module != 'undefined' && module.exports) {
  var vsprintf = require('sprintf-js').vsprintf;
  module.exports = Yalt;
}
