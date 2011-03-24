var Connect = require('connect'),
    quip = require('quip'),
    dispatch = require('dispatch'),
	sys = require('sys');
	
var Settings = require('settings'),
 	file = __dirname + '/config/environment.js',
	settings = new Settings(file).getEnvironment('development');

var server = Connect.createServer(
	quip(),
    Connect.router(function(app){
		app.get('/', function(req, res){
			res.text('These are not the droids you are looking for.');
		});
        
		/**
		 * /fetch/:origin|[:xslt|:jslt|null]/[processed|raw].[rss|atom|json]|:callback
		 * /fetch/http%3A%2F%2Fjeffremer.com%2Fposts%2Frss.xml|http%3A%2F%2Ffoo.com%2Fjslt.js/compressed.json
		 */ 
		app.get(/fetch\/(.+)\|(.+)\/(processed|raw)\.(rss|atom|json)\|(.+)/, function(req, res){
			sys.puts(sys.inspect(req.params));
			res.text(req.params.join(', '));
		});
	})
);

server.listen(settings.server.port);
