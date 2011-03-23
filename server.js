var Connect = require('connect'),
    quip = require('quip'),
    dispatch = require('dispatch'),
	sys = require('sys');

var server = Connect.createServer(
	quip(),
    Connect.router(function(app){
		app.get('/', function(req, res){
			res.text('list blog posts. try /post/0');
		});

		app.get(/fetch\/(.+)\/(.+)\/(.+)\.(.+)/, function(req, res){
			sys.puts(sys.inspect(req.params));
			res.text(req.params.join(' '));
		});
	})
);

server.listen(8080);
