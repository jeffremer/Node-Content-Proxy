// Dependencies
var Connect = require('connect'),
    quip = require('quip'),
	sys = require('sys'),
	_ = require('./lib/underscore.js');

// Libs
var ProxyRequest = require('./lib/ProxyRequest').ProxyRequest;

// Settings	
var Settings = require('settings'),
 	file = __dirname + '/config/environment.js',
	settings = new Settings(file).getEnvironment('development');
	
var PARAMS = {
	ORIGIN: 0,
	TRANSFORM: 1,
	PROCESS: 2,
	OUTPUT: 3,
	CALLBACK: 4
};	

var server = Connect.createServer(
	quip(),
    Connect.router(function(app){
		app.get('/', function(req, res){
			res.text('These are not the droids you are looking for.');
		});
        
		/**
		 * /fetch/:origin|[:xslt|:jslt|null]/[processed|raw].[rss|atom|json|html|text]|:callback
		 * /fetch/http%3A%2F%2Fapi.twitter.com%2F1%2Fstatuses%2Fuser_timeline.json%3Fscreen_name%3Djeffremer|http://cmdv.me/note/4d900f45.raw/raw.text|callback
		 */ 
		app.get(/fetch\/(.+)\|(.+)\/(processed|raw)\.(rss|atom|json|html|text)\|?(.+)?/, function(request, response){
			console.log(sys.inspect(request.params));
			var p = request.params;
				proxy = new ProxyRequest(p[PARAMS.ORIGIN],
										 p[PARAMS.TRANSFORM],
										 p[PARAMS.PROCESS] == "processed",
										 p[PARAMS.OUTPUT],
										 p[PARAMS.CALLBACK],
										 response);				
		    proxy.fetch();
		});
	})
);

server.listen(settings.server.port);
