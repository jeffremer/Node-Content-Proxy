var rest = require('restler'),
	uri = require('url'),
	_ = require('./underscore.js'),
	EventEmitter = require('events').EventEmitter;

var ProxyRequest = function(origin, transform, process, output, callback, response) {
    this.origin = origin;
    this.transform = transform;
    this.process = process;
    
	switch(output)
	{
		case 'json':
			this.output = 'application/json';
			break;
		case 'rss':
			this.output = 'application/rss+xml';
			break;
		case 'atom':
			this.output = 'application/rss+xml';
			break;
		default:
			this.output = 'text/html';			
	}
	
    this.callback = callback;

    this.response = response;

	this.initialize();
}

_.extend(ProxyRequest.prototype, EventEmitter.prototype, {
	initialize: function() {
		var self = this;
		this.addListener('origin', function(originData){
			self.originData = originData;
			if(!self.transformData) {
				self.addListener('transform', function(transformData){
					self.processData();
				});
			} else {
				self.processData();
			}			
		});

		this.addListener('transform', function(transformData){
			self.transformData = transformData;
		});
	},
    fetch: function() {
		var ProxyRequest = this;
		
		rest.get(this.origin).addListener('complete', function(originData){
			ProxyRequest.emit('origin', originData);
		}).addListener('error', function(err) {console.log(err)});
		
		rest.get(this.transform).addListener('complete', function(transformData){
			ProxyRequest.emit('transform', transformData);
		}).addListener('error', function(err) {console.log(err)});	
	},
	processData: function() {
		var codeSandbox = {
			DATA: this.originData,
			RESULT: '',
			_:_
		};
		try {
			var Script = process.binding('evals').Script;
			if(this.transformData) {
				Script.runInNewContext(this.transformData, codeSandbox);
			}
		} catch (err) {
			var error = JSON.stringify({success: false, error: err.message})
			var result = this.callback ? this.callback + "(" + error + ")" : error;
			this.response.end(result, "binary");	
			return false;
		}
		var result = this.callback ? this.callback + "(" + (_(codeSandbox.RESULT).isString() ? '"'+codeSandbox.RESULT+'"' : JSON.stringify(codeSandbox.RESULT)) + ")" : codeSandbox.RESULT;
		this.response.end(result, "binary");
	}
})

 exports.ProxyRequest = ProxyRequest;
