(function () {
	'use strict';

	var website = openerp.website;
	var qweb = openerp.qweb;
  website.add_template_file('/chjs_custom_view/static/src/xml/website.list.view.xml');

	website.WebsiteListWidget = openerp.Widget.extend({
	
		events: {
			'click #btn_list_filter': 'click_filter_button',
		},
	
		init: function(parent, options) {
			var self = this;
			this._list_title = options['title'];
			this._filter_template_name = options['filter_template_name'];
			this._convert_filter = options['convert_filter_values'];
			this.list_options = options;
			this._super(parent);
		},
	
		start: function() {
			//this.$el.append('<div>test</div>');
			//return;
			this.$el.append(qweb.render("expandable_list_view", {
				list_title: this._list_title,
				filter_template: this._filter_template_name,
			}));
		},
	
		click_filter_button: function(event) {
			var self = this;
			var url_params_string = this._convert_filter(this.$el);
			alert(url_params_string);
		},
	
	});

	
})();




