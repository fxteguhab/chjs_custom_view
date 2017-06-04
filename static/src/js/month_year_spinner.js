(function () {
	'use strict';

	var instance = openerp;

	instance.web.YearSpinnerWidget = instance.web.Widget.extend({
		template: 'chjs_custom_view.year_spinner',
		events: {
			'click .year_spinner_previous': 'onchange_year',
			'click .year_spinner_next': 'onchange_year',
			'change .year_spinner_year': 'onchange_year',
		},

		set_today: function() {
			var default_year = new Date().getFullYear();
			this.set("year", default_year);
		},

		onchange_year: function(event) {
			event.stopPropagation();
			var target = $(event.target);
			var current_year = this.get('year');
			if (target.is('.year_spinner_previous')) {
				current_year = current_year - 1;
			} else if (target.is('.year_spinner_next')) {
				current_year = current_year + 1;
			} else if (target.is('.year_spinner_year')) {
				current_year = parseInt(target.val());
			}
			this.set("year", current_year);
		},

		set: function(arg1, arg2, arg3) {
			this._super(arg1, arg2, arg3);
			var year_input = this.$('.year_spinner_year');
			year_input.val(this.get("year"));
		},
	});

	instance.web.MonthYearSpinnerWidget = instance.web.Widget.extend({
		template: 'chjs_custom_view.month_year_spinner',
		events: {
			'click .year_spinner_previous': 'onchange_month_year',
			'click .year_spinner_next': 'onchange_month_year',
			'change .year_spinner_year': 'onchange_month_year',
			'change .year_spinner_month': 'onchange_month_year',
		},

		set_today: function() {
			var now = new Date();
			var default_year = now.getFullYear();
			var default_month = now.getMonth() + 1;
		//supaya kalau default month 1 (integer) maka diubah jadi "01" (string)
			var pad = "00";
			default_month = "" + default_month; //supaya jadi string
			default_month = pad.substring(0, pad.length - default_month.length) + default_month;
			this.set("month_year",default_year+'-'+default_month);
		},

		onchange_month_year: function(event) {
			event.stopPropagation();
			var target = $(event.target);
			var current_month_year = this.get('month_year');
			var temp = current_month_year.split("-");
			var current_month = parseInt(temp[1]);
			var current_year = parseInt(temp[0]);
			if (target.is('.year_spinner_previous')) {
				current_month -= 1;
				if (current_month <= 0) {
					current_year -= 1;
					current_month = 12;
				}
			} else if (target.is('.year_spinner_next')) {
				current_month += 1;
				if (current_month >= 13) {
					current_year += 1;
					current_month = 1;
				}
			} else if (target.is('.year_spinner_year')) {
				current_year = parseInt(target.val());
			} else if (target.is('.year_spinner_month')) {
				current_month = parseInt(target.val());
			}
			var pad = "00";
			current_month = "" + current_month; //supaya jadi string
			current_month = pad.substring(0, pad.length - current_month.length) + current_month;
			this.set("month_year",current_year+'-'+current_month);
		},

		set: function(arg1, arg2, arg3) {
			this._super(arg1, arg2, arg3);
			var year_input = this.$('.year_spinner_year');
			var month_input = this.$('.year_spinner_month');
			var current_month_year = this.get('month_year');
			var temp = current_month_year.split("-");
			year_input.val(temp[0]);
			month_input.val(temp[1]);
		},
	});

	
})();




