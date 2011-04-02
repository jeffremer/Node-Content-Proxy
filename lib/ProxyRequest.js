var rest = require('restler'),
	uri = require('url'),
	_ = require('./underscore.js'),
	EventEmitter = require('events').EventEmitter;

_.mixin({
	isUrl: function(str) {
		var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
		return regexp.test(str);
	}
});

var ProxyRequest = function(origin, transform, process) {
    this.origin = origin;
    this.transform = _(transform).isUrl() ? transform : null;
    this.process = process;
	this.initialize();
};

_.extend(ProxyRequest.prototype, EventEmitter.prototype, {
	initialize: function() {
		var self = this;
		this.addListener('origin', function(originData){
			self.originData = originData;
			if(!self.transformData && this.transform) {
				self.addListener('transform', function(transformData){
					self.emit('complete', self.originData, self.transformData);
				});
			} else {
				self.emit('complete', self.originData, self.transformData);
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
		});
		
		if(this.transform && this.transform) {
			console.log("Getting transform: " + this.tranform)
			rest.get(this.transform).addListener('complete', function(transformData){
				ProxyRequest.emit('transform', transformData);
			});
		}
		
		return this;
	}
});

exports.ProxyRequest = ProxyRequest;
