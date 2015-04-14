var yalt = {
  add: function(code, dict, domain, isFallback) {
    if (!domain)
      domain = '_global';

    if (!yalt.dicts[domain])
      yalt.dicts[domain] = {};

    if (!yalt.dicts[domain][code])
      yalt.dicts[domain][code] = {};

    for (var p in dict)
      yalt.dicts[domain][code][p] = dict[p];

    if (isFallback || !yalt.dicts[domain]._fallback)
      yalt.dicts[domain]._fallback = yalt.dicts[domain][code];
  },

  get: function(code, domain) {
    if (!domain)
      domain = '_global';

    function gettext(msg) {
      var params = Array.prototype.slice.call(arguments, 1);

      for (var i = 0; i < gettext.dicts.length; i++) {
        var dict = gettext.dicts[i];
        if (dict[msg])
          return dict[msg].constructor == String ? vsprintf(dict[msg], params) : dict[msg].apply(null, params);
      }

      return msg;
    }

    gettext.set = function(code) {
      gettext.dicts = [yalt.dicts[domain][code]];
      if (yalt.dicts[domain][code] != yalt.dicts[domain]._fallback)
        gettext.dicts.push(yalt.dicts[domain]._fallback);
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
