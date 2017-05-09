
openerp.chjs_custom_view = function(instance) {
	
	var _t = instance.web._t, _lt = instance.web._lt;


	var old_format_value = instance.web.format_value;
	
	instance.web.format_value = function(value, descriptor, value_if_empty) {
		switch (descriptor.widget || descriptor.type || (descriptor.field && descriptor.field.type)) {
			case 'float_time':
				if (value == 0) return '';
		}
		return old_format_value(value, descriptor, value_if_empty);
	}
	
	var phone_formatting = function(value) {
		if (!value) return '';
		var country = value.substring(0,3);
		var temp = [];
		var interval = 3;
		for (var i=3; i<value.length; i+=interval) {
			if (value.substring(i, i+interval).trim()) {
			  temp.push(value.substring(i, i+interval).trim());
			}
		}
		var rest = temp.join('-');
		return country + '-' + rest;
	}
	
	instance.web.form.FieldPhone = instance.web.form.FieldChar.extend({
		render_value: function() {
			var value = this.get('value');
			if (!this.get("effective_readonly")) {
				if (value) {
					this.$el.find('input').val(value);
				} else {
					this.$el.find('input').val('');
				}
			} else {
				this.$el.text(phone_formatting(value));
			}
		},
	});	
	
	instance.web.form.widgets.add('phone_number','instance.web.form.FieldPhone');
	
	instance.web.list.Phone = instance.web.list.Column.extend({
		_format: function (row_data, options) {
			var value = row_data[this.id].value;
			if (value) {
				return phone_formatting(value);
			}
			return this._super(row_data, options);
		}
	});
	
	instance.web.list.columns.add('field.phone_number', 'instance.web.list.Phone');
	
	instance.web.list.EmptyTransparent = instance.web.list.Column.extend({
		_format: function (row_data, options) {
			var value = row_data[this.id].value;
			if (!value) {
				return '<span style="color: transparent">'+value+'</span>';
			}
			return this._super(row_data, options);
		}
	});
	
	instance.web.list.columns.add('field.empty_transparent', 'instance.web.list.EmptyTransparent');
	
	instance.web.list.Binary.include({
		_format: function (row_data, options) {
		//untuk kolom bertipe binary, link downloadnya pasti harus ke controller yang buat download.
		//di parent ada if value == " " maka kalau user klik link Download nya maka pergi ke controller 
		//yang buat download (/web/binary/saveas). Jadi di sini kita sengajain valuenya diisi ' ' alias
		//single space, supaya if itu masuk.
			row_data[this.id].value = " "
			return this._super(row_data, options);
		}
	});
	
	instance.web.ComboCheckBox = instance.web.Widget.extend({
		template: 'chjs_custom_view.combo_checkbox',
		events: {
			'click .dropdown-menu div': 'onclick_combo_checkbox_menu',
		},
		
		options: [],
		option_selection: [],
		
		init: function(that, option_selection) {
			this._super(that);
			this.option_selection = option_selection;
			/*
			var ul = that.$('.dropdown-menu');
			var i;
			for (i=0; i<this.option_selection.length; i++) {
				ul.append('<li><div value="' + this.option_selection[i]['value'] + 
							'"><input type="checkbox"/>' + this.option_selection[i]['text'] + '</div></li>');
			}
			*/
		},
		
		start: function() {
			var ul = this.$('.dropdown-menu');
			var i;
			for (i=0; i<this.option_selection.length; i++) {
				ul.append('<li><div value="' + this.option_selection[i]['value'] + 
							'"><input type="checkbox"/>' + this.option_selection[i]['text'] + '</div></li>');
			}
		},

		onclick_combo_checkbox_menu: function(event) {
			var $target = $(event.currentTarget),
				val = $target.attr('value'),
				$inp = $target.find('input'),
				idx;

			if ((idx = this.options.indexOf(val)) > -1) {
				this.options.splice(idx, 1);
				setTimeout(function() {$inp.prop('checked', false)}, 0);
			} else {
				this.options.push(val);
				setTimeout(function() {$inp.prop('checked', true)}, 0);
			}

			var i,j;
			var option_string = '';
			for (i=0; i<this.options.length; i++) {
				for (j=0; j<this.option_selection.length; j++) {
					if (this.options[i] === this.option_selection[j]['value']) {
						option_string += this.option_selection[j]['text']
					}
				}
				if(i+1<this.options.length) {
					option_string += ', ';
				}
			}

			if(option_string !== '') {
				$(".combo_checkbox_text").html(option_string);
			} else {
				$(".combo_checkbox_text").html('Select');
			}

			return false;
		}, 
	});
	
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

	instance.web.CustomFormView = instance.web.FormView.extend({
	
	//setelah save (baik create maupun edit), load action tertentu yang disimpan sebagai atribut after_save dari tag <form>
	//isinya adalah module.nama_action
	//si tag form harus punya version="7.0"
	//contoh pemakaian: 
	/*
		<record ...>
			<field name="arch" type="xml">
				<form version="7.0" after_save="jonas.jonas_action_jom_party"> jonas = nama modul, jonas_action_jom_party = XML ID action
				</form>
			</field>
		</record>
	*/
		record_created: function(r, prepend_on_create) {
			if (!r) return this._super(r, prepend_on_create);
			var after_save = this.fields_view.arch.attrs.after_save; //self.fields_view.arch ftw!!
			if (after_save && after_save != '') {
				this.ViewManager.ActionManager.do_action(this.fields_view.arch.attrs.after_save,{
					clear_breadcrumbs: true
				});
			} else {
				return this._super(r, prepend_on_create);	   		
	    }
		},
		
		record_saved: function(r) {
			if (!r) return this._super(r);
			var after_save = this.fields_view.arch.attrs.after_save; //self.fields_view.arch ftw!!
			if (after_save && after_save != '') {
				this.ViewManager.ActionManager.do_action(this.fields_view.arch.attrs.after_save,{
					clear_breadcrumbs: true
				});
			} else {
				return this._super(r);	   		
	    }
		},
		
	//memungkinkan form di-load tanpa kemampuan untuk saving data. Tipikalnya form semacam ini digunakan
	//untuk menampilkan informasi tertentu berdasarkan masukan/pilihan user, dan isiannya tidak dimaksudkan
	//untuk disimpan ke database.
	//contoh penggunaan:
	/*
		<record ...>
			<field name="arch" type="xml">
				<form version="7.0" no_save="1">
				</form>
			</field>
		</record>
	*/
	//juga memungkinkan untuk mengubah label button save. Cara pemakaian:
	/*
		<record ...>
			<field name="arch" type="xml">
				<form version="7.0" save_label="Set Allocation">
				</form>
			</field>
		</record>
	*/
		load_form: function(data) {
			result = this._super(data);
			var no_save = this.fields_view.arch.attrs.no_save;
			if (no_save) {
				$('.oe_form_buttons').remove();
			}
			var save_label = this.fields_view.arch.attrs.save_label;
			if (save_label) {
				$('.oe_form_buttons .oe_form_button_save').html(_t(save_label));
			}
			return result;
		},
		
		can_be_discarded: function() {
			var no_save = this.fields_view.arch.attrs.no_save;
			if (this.$el.is('.oe_form_dirty') && !no_save) {
				if (!confirm("Warning: the record has been modified, your changes will be discarded.\n\nAre you sure you want to leave this page ?")) {
						return false;
				}
				this.$el.removeClass('oe_form_dirty');
			}
			return true;
		},
		
	//untuk form2 yang langsung diakses dari menu (bukan button Create atau Edit), yang muncul 
	//di title hanyalah "New", sehingga kurang informatif. code di bawah memungkinkan supaya yang muncul
	//adalah name dari action yang diacu oleh menu tersebut.
	/*
		tambahan, dengan mengisi option di field yang punya onchange, maka dalam kondisi editing 
		onchange nya tetep ditrigger. Ini adalah modifikasi dari behaviour standar Odoo di mana bila form 
		digunakan untuk mengedit maka begitu form beres diload onchange2 field TIDAK ditrigger.
		Cara pakai:

			<form>
				<field name="customer_id" on_change="blabla" options="{'force_onchange': 1}"
			</form>
	*/
		load_record: function(record) {
			var self = this;
			var new_title = this.options.action.name;
			result = this._super(record);
			this.set({ 'title' : record.id ? record.display_name : (new_title ? _t(new_title) : _t("New")) });
			return result.then(function() {
				if (record.id) {
					_.each(self.fields, function(spec, name) {
						if (spec.options.force_onchange == 1) {
							self.do_onchange(spec);
						}
					});
				}
			});
		},

	//kalau pengen supaya nilai field readonly tetap ikut disubmit. Cara pemakaian:
	/*
		<record ...>
			<field name="arch" type="xml">
				<form version="7.0">
					...
					<field name="customer_name" readonly_force_submit="1" />
				</form>
			</field>
		</record>
	*/
	//untuk field o2m, kondisikan supaya field o2m nya itu sendiri JANGAN readonly. Meskipun field2 
	//di bawah <tree> nya readonly (baik readonly dari modelnya maupun menggunakan attrs/readonly di view), 
	//ketika disubmit field2 readonly tersebut akan tetap diikutsertakan.

		_process_save: function(save_obj) {
			var self = this;
			var prepend_on_create = save_obj.prepend_on_create;
		
			for (var f in self.fields) {
				var tmp = f;
				if (!self.fields.hasOwnProperty(f)) { continue; }
				f = self.fields[f];
				if (f.node.attrs.readonly_force_submit) {
					self.fields[tmp].set('readonly',false,{silent: true});
				}
			}
			return this._super(save_obj);

		},
	
	//mampukan supaya onchange bisa membawa current values of the form ke server, ke method onchange yang menghandlenya
	//di server. current values ini ditangkap di parameter context si method handler
		do_onchange: function(widget) {
			this.dataset._model._context['onchange_values'] = this._get_onchange_values();
			return this._super(widget);
		}

		
	});
	
	instance.web.views.add('form', 'instance.web.CustomFormView');
	
	instance.web.CustomListView = instance.web.ListView.extend({
	
	//enable autorefresh di list
	//contoh pemakaian (artinya refresh setiap 20 detik):
	/*
		<record ...>
			<field name="arch" type="xml">
				<tree version="7.0" auto_refresh="20">
				</tree>
			</field>
		</record>
	*/
		init: function(parent, dataset, view_id, options) {
			var self = this;
			this._super(parent, dataset, view_id, options);
			this.timer = null;
			this.on("list_view_loaded", this, function(data, grouped) {
				if (self.fields_view.arch.attrs.auto_refresh) { // self.fields_view.arch.attrs ftw!! hehehe!
					var interval = parseInt(data.arch.attrs.auto_refresh);
					if (!isNaN(interval) && self.timer == null) { 
						interval = Math.max(5,interval); // minimal 5 detik untuk mengantisipasi latensi jaringan
						self.timer = setInterval(function() {
							self.reload_content();
						},interval*1000);
					}
				}			
			});
		},
		
	//enable fasilitas untuk mengubah label button Create. Cara pemakaian:
	/*
		<record ...>
			<field name="arch" type="xml">
				<tree version="7.0" create_label="Set Resources">
				</tree>
			</field>
		</record>
	*/
		start: function() {
			var self = this;
			return this._super().then(function() {
				var create_label = self.fields_view.arch.attrs['create_label'];
				if (create_label) {
					self.$buttons.find('.oe_list_add').html(' '+_t(create_label)+' ');
				}
			});
		},
		
		destroy: function() {
			clearInterval(this.timer);
			this._super();
		},
	//abis load list yang bergroup, langsung expand group nya bila diminta
	//sekalian hapus space kosong di sebelah kiri list dengan cara meng-colspan si group
	//contoh cara pakai:
	/*
		<record ...>
			<field name="arch" type="xml">
				<tree version="7.0" autoexpand_group="1">
				</tree>
			</field>
		</record>
	*/
		compute_aggregates: function(records) {
			var self = this;
			this._super(records);
			if (self.fields_view.arch.attrs.autoexpand_group && self.grouped) {
				var group_header = $('.oe_group_header', this.$el);
				this.$el.addClass('autoexpand_group');
				group_header.click().off("click");
				var colspan = group_header.parents('.oe_list_content').eq(0).find('thead .oe_list_header_columns');
				group_header.find('.oe_list_group_name').attr('colspan',colspan.children().length);
				group_header.find('td').remove();
				this.$el.find('tr td:first-child').remove();
			} else {
				this.$el.find(".oe_list_header_columns > th").show();
			}
		},
	});
	
	instance.web.views.add('list', 'instance.web.CustomListView');
	
//---------------------------------------------------------------------------------------------------------------------------------------------------
	
	/*
	Memungkinkan supaya kalau ada checkbox di list o2m user ngga harus klik dua kali buat check/uncheck
	Anda tidak perlu menambah apapun di kode, sudah otomatis.
	*/
	instance.web.ListView.List.include({
		row_clicked: function (event) {
			if (!this.view.editable() || ! this.view.is_action_enabled('edit')) {
				return this._super.apply(this, arguments);
			}
			var record_id = $(event.currentTarget).data('id');
			var focus_field = $(event.target).data('field');
			var is_checkbox = $(event.target).is(':checkbox');
			if (!focus_field && is_checkbox) focus_field = $(event.target).parent().data('field');
			var result = this.view.start_edition(
				record_id ? this.records.get(record_id) : null, {
				focus_field: focus_field
			});
			if (is_checkbox) {
				var initial_checked = $(event.target).get(0).checked;
				var checkbox = this.view.editor.$el.find("input.field_boolean[name='"+focus_field+"']");
				this.view.editor.form.fields[focus_field].set_value(initial_checked);
			}
			
			return result;
		},
	});

	
	instance.web.ActionManager = instance.web.ActionManager.extend({
	
	//refresh view setelah sebuah wizard melakukan aksinya / diclose
	//cara pakenya tinggal di bagian returnnya ditulis begini
	//return { 'type' :  'ir_actions_act_close_wizard_and_reload_view' }
		ir_actions_act_close_wizard_and_reload_view: function (action, options) {
			if (!this.dialog) {
				options.on_close();
			}
			this.dialog_stop();
			this.inner_widget.views[this.inner_widget.active_view].controller.reload();
			return $.when();
		},
	//
		ir_actions_act_window: function (action, options) {
			var self = this;
			if (action['clear_breadcrumbs']) options['clear_breadcrumbs'] = action['clear_breadcrumbs'];
			return this.ir_actions_common({
				widget: function () { return new instance.web.ViewManagerAction(self, action); },
				action: action,
				klass: 'oe_act_window',
				post_process: function (widget) {
						widget.add_breadcrumb({
								on_reverse_breadcrumb: options.on_reverse_breadcrumb,
								hide_breadcrumb: options.hide_breadcrumb,
						});
				},
			}, options);
		},
	});
	
//sertakan context form parentnya ketika mengambil context untuk one2many widget
	instance.web.form.One2ManyDataSet = instance.web.form.One2ManyDataSet.extend({
		get_context: function() {
			result = this._super();
			this.context.__contexts[0] = this.parent_view.dataset.context;
			return this.context;
		}
	});
	
}

