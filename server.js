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

var debug = true;

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
										 p[PARAMS.PROCESS] == "processed"),
				callback = p[PARAMS.CALLBACK],
				output = p[PARAMS.OUTPUT];

			switch(output) {	
				case 'json':
				case 'rss':
				case 'atom':
				case 'html':
					output = output;
					break;
				default:
					output = 'text';			
			}
			
			if(callback && output === 'json') ouput = 'jsonp';
			var filename = ['response',output].join('.');

		    proxy.fetch().on('complete', function(originData, transformData) {
					var result;
					if(transformData) {
						var codeSandbox = {
							DATA: originData,
							RESULT: '',
							_:_
						};
					
						try {
							var Script = process.binding('evals').Script;
							if(transformData) Script.runInNewContext(transformData, codeSandbox);
						} catch (err) {
							var error = JSON.stringify({success: false, error: err.message})
							var result = error;
							response.end(result, "binary");	
							return false;
						}					
						result = codeSandbox.RESULT;
					} else {
						result = originData;
					}
					
					if(callback) result = [callback, '(', JSON.stringify(result) ,')'].join('');
					if(!_(result).isString()) result = JSON.stringify(result);
					
					response[output].call(response, result);
			});
		});
	})
);

server.listen(settings.server.port);
