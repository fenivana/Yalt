if (typeof module != 'undefined' && module.exports) { // node
  var yalt = require('yalt');
  module.exports = yalt;
}


/*
Parse the Accept-Language HTTP header.

Parameters:
  header: String. e.g. 'en-US,zh-CN;q=0.5,zh-Hans-CN;q=0.5'

Returns: Array. Sort by quality.
  e.g. ['en-US', 'zh-CN', 'zh-Hans-CN']
*/

yalt.parseAcceptLanguage = function(header) {
  if (!header)
    return [];

  var langs = [];
  var pattern = /([a-z]+(?:-[a-z]+)*) *(?:; *q *= *(1|0\.[0-9]+))?/ig;
  var result;

  while (result = pattern.exec(header))
    langs.push([result[1], Number(result[2] || 1)]);

  langs.sort(function(a, b) {
    return b[1] - a[1];
  });

  return langs.map(function(item) {
    return item[0];
  });
};


/*
Select the most preferred language available.

Parameters:
  available: Array. Available languages. e.g. ['en-US', 'en', 'zh-TW', 'zh-HK', 'zh-Hant', 'zh-CN', 'zh-Hans', 'zh', 'ja']
  accept: Array. Accept Languages. Return value of yalt.parseAcceptLanguage().

Returns: String. The highest quality language available, or null if no accept.
*/

yalt.selectLanguage = function(available, accept) {
  // sort the available languages to match the most.
  available = available.sort(function(a, b) {
    return a.length < b.length;
  });

  for (var i = 0; i < accept.length; i++) {
    var ac = accept[i].toLowerCase();
    for (var j = 0; j < available.length; j++) {
      var av = available[j].toLowerCase();
      if (av == ac || av.indexOf(ac + '-') == 0 || ac.indexOf(av + '-') == 0)
        return available[j];
    }
  }

  return null;
};
