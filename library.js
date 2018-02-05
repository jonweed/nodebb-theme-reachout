'use strict';

var striptags = require('striptags');
var meta = module.parent.require('./meta');
var user = module.parent.require('./user');
var categories = module.parent.require('./categories');
var colorConvert = require('color-convert');


var winston = module.parent.require('winston'),
	User = module.parent.require('./user'),
	Posts = module.parent.require('./posts'),
	Topics = module.parent.require('./topics'),
	Categories = module.parent.require('./categories'),
	Meta = module.parent.require('./meta'),
	db = module.parent.require('./database'),
async = module.parent.require('async');

var library = {};

library.init = function(params, callback) {
	var app = params.router;
	var middleware = params.middleware;

	app.get('/admin/plugins/persona', middleware.admin.buildHeader, renderAdmin);
	app.get('/api/admin/plugins/persona', renderAdmin);

	callback();
};

library.bgColorImage = function(hex) {
    var c = colorConvert.hex.hsl(hex),h=c[0],s=c[1]+'%',l1=c[2]-10+'%',l2=c[2]+10+'%';
    return ['linear-gradient(45deg,hsl(',[h,s,l1].join(','),'),hsl(',[h,s,l2].join(','),'))'].join('');
};

library.addUserData = function (data, callback) {
	for (var i=0, ii=data.length; i < ii; i++) {
		if (data[i]['icon:bgColor']) {
			data[i]['icon:bgColorImage'] = library.bgColorImage(data[i]['icon:bgColor']);
		}
	}

	callback(null, data);
};

library.addPostData = function(data, callback) {
	for (var i=0,ii=data.posts.length; i < ii; i++) {
		if (data.posts[i].toPid) {
			data.posts[i].toIndex = data.posts[i].toPid-1;
		}
	}

	callback(null, data);
};

library.addRepliesToTopic = function(data, callback) {
	
//	console.log(data.templateData.topics);
//console.log(data.templateData.topics[1].teaser);
//console.log(data.templateData.cid, data.req.uid, 3);
//posts.getPostField(pid, 'tid', next);

callback(null,data);
};


library.addAdminNavigation = function(header, callback) {
	header.plugins.push({
		route: '/plugins/persona',
		icon: 'fa-paint-brush',
		name: 'Persona Theme'
	});

	callback(null, header);
};

library.getTeasers = function(data, callback) {
	data.teasers.forEach(function(teaser) {
		if (teaser && teaser.content) {
			teaser.content = striptags(teaser.content, ['img']);
			if (teaser.content.length > 150) {
				teaser.content = teaser.content.substr(0, 150);
				teaser.content = teaser.content.substr(0, Math.min(teaser.content.length, teaser.content.lastIndexOf(" ")))+'...';
			}
		}
	});
	callback(null, data);
};

library.defineWidgetAreas = function(areas, callback) {
	areas = areas.concat([
		{
			name: "Categories Sidebar",
			template: "categories.tpl",
			location: "sidebar"
		},
		{
			name: "Category Sidebar",
			template: "category.tpl",
			location: "sidebar"
		},
		{
			name: "Topic Sidebar",
			template: "topic.tpl",
			location: "sidebar"
		},
		{
			name: "Categories Header",
			template: "categories.tpl",
			location: "header"
		},
		{
			name: "Category Header",
			template: "category.tpl",
			location: "header"
		},
		{
			name: "Topic Header",
			template: "topic.tpl",
			location: "header"
		},
		{
			name: "Categories Footer",
			template: "categories.tpl",
			location: "footer"
		},
		{
			name: "Category Footer",
			template: "category.tpl",
			location: "footer"
		},
		{
			name: "Topic Footer",
			template: "topic.tpl",
			location: "footer"
		}
	]);

	callback(null, areas);
};

library.getThemeConfig = function(config, callback) {

	meta.settings.get('persona', function(err, settings) {
		config.hideSubCategories = settings.hideSubCategories === 'on';
		config.hideCategoryLastPost = settings.hideCategoryLastPost === 'on';
		config.enableQuickReply = settings.enableQuickReply === 'on';
	});

	callback(false, config);
};

function renderAdmin(req, res, next) {
	res.render('admin/plugins/persona', {});
}

library.addUserToTopic = function(data, callback) {
	if (data.req.user) {
		user.getUserData(data.req.user.uid, function(err, userdata) {
			if (err) {
				return callback(err);
			}

			data.templateData.loggedInUser = userdata;
			callback(null, data);
		});
	} else {
		callback(null, data);
	}
};

library.getLinkTags = function (data, callback) {
	data.links.push({
		rel: 'prefetch stylesheet',
		type: '',
		href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
	});

	callback(null, data);
};

module.exports = library;
