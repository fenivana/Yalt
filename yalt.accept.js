if (typeof module != 'undefined' && module.exports) { // node
	var yalt = require('yalt');
	module.exports = yalt;
}


/*
Format the Accept-Language HTTP header.

Parameters:
	header: String. e.g. 'en-US,zh-CN;q=0.5,zh-Hans-CN;q=0.5'

Returns: Array. Sort by quality.
	e.g.
	[
		["en-US", 1],
		["zh-CN", 0.5],
		["zh-Hans-CN", 0.5]
	]
*/

yalt.accept = function(header) {
	var langs = [];
	var pattern = /([a-z]+(?:-[a-z]+)*) *(?:; *q *= *(1|0\.[0-9]+))?/ig;
	var result;
	while (result = pattern.exec(header))
		langs.push([result[1], Number(result[2] || 1)]);
	
	langs.sort(function(a, b) {
		return b[1] - a[1];
	});

	return langs;
};


/*
Select the most preferred language available.

Parameters:
	available: Array. Available languages. If an item is array, returns the first language if anyone matches the accept languages.  e.g.
		[
			'en-US',
			['zh-CN', 'zh-Hans', 'zh'],
			['zh-TW', 'zh-HK', 'zh-Hant']
		]

	accept: Array. Accept Languages. Return value of yalt.accept().

Returns: String. The highest quality language available. If none matches, returns the first language in avaliable languages.
*/

yalt.select = function(available, accept) {
	for (var i = 0; i < accept.length; i++) {
		var ac = accept[i][0].toLowerCase();
		for (var j = 0; j < available.length; j++) {
			var av = available[j];
			if (av.constructor == String) {
				var avlc = av.toLowerCase();
				if (ac.indexOf(avlc) == 0 || avlc.indexOf(ac) == 0)
					return av;
			} else {
				var a = av[0];
				for (var k = 0; k < av.length; k++) {
					var b = av[k].toLowerCase();
					if (ac.indexOf(b) == 0 || b.indexOf(ac) == 0)
						return a;
				}
			}
		}
	}

	return available[0].constructor == String ? available[0] : available[0][0];
};
