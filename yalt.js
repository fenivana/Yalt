var yalt = {
  add: function(codes, dict, domain, isFallback) {
    codes = [].concat(codes);

    if (!domain)
      domain = '_global';

    if (!yalt.dicts[domain]) {
      yalt.dicts[domain] = {};
      Object.defineProperty(yalt.dicts[domain], '_fallback', { writable: true });
    }

    codes.forEach(function(code) {
      if (!yalt.dicts[domain][code])
        yalt.dicts[domain][code] = {};

      for (var p in dict)
        yalt.dicts[domain][code][p] = dict[p];
    });

    if (isFallback)
      yalt.dicts[domain]._fallback = codes[0];
  },

  get: function(code, domain) {
    if (!domain)
      domain = '_global';

    function gettext(msg) {
      var params = Array.prototype.slice.call(arguments, 1);

      for (var i = 0; i < gettext.fallbacks.length; i++) {
        var dict = gettext.fallbacks[i];
        if (dict[msg])
          return dict[msg].constructor == String ? vsprintf(dict[msg], params) : dict[msg].apply(null, params);
      }

      return msg;
    }

    gettext.set = function(code) {
      gettext.code = code;
      gettext.dict = yalt.dicts[domain][code];
      gettext.fallbacks = [gettext.dict];
      var fallback = yalt.dicts[domain]._fallback;
      if (fallback && code != fallback)
        gettext.fallbacks.push(yalt.dicts[domain][fallback]);
    };

    gettext.set(code);

    return gettext;
  },

  dicts: {}
};

if (typeof module != 'undefined' && module.exports) { // node
  var vsprintf = require('sprintf-js').vsprintf;
  module.exports = yalt;
  require('yalt/yalt-util');
}
