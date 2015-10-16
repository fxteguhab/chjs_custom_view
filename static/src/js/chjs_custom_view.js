
openerp.chjs_custom_view = function(instance) {

	var _t = instance.web._t, _lt = instance.web._lt;

/*
	var old_format_value = instance.web.format_value;
	
	instance.web.format_value = function(value, descriptor, value_if_empty) {
console.log(descriptor.name, descriptor);
		result = old_format_value(value, descriptor, value_if_empty);
		switch (descriptor.widget || descriptor.type || (descriptor.field && descriptor.field.type)) {
			case 'phone_number':
				var country = value.substring(0,3);
				var rest = value.substring(3);
				result = country + '-' + rest;
				break
		}
		return result;
	}
	
*/
	
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
			console.log(value);
			if (!this.get("effective_readonly")) {
				this.$el.find('input').val(value);
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
	
	instance.web.CustomFormView = instance.web.FormView.extend({
	
	//setelah save (baik create maupun edit), load action tertentu yang disimpan sebagai atribut after_save dari tag <form>
	//isinya adalah module.nama_action
	//si tag form harus punya version="7.0"
	//contoh pemakaian: 
	/*
		<record ...>
			<field name="arch" type="xml">
				<form version="7.0" after_save="jonas.jonas_action_jom_party">
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
				alert(after_save);
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
	//juga memungkinkan untuk mengubah label save. Cara pemakaian:
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
        if (!confirm("Warning, the record has been modified, your changes will be discarded.\n\nAre you sure you want to leave this page ?")) {
            return false;
        }
        this.$el.removeClass('oe_form_dirty');
      }
      return true;
    },
    
  //untuk form2 yang langsung diakses dari menu (bukan button Create atau Edit), yang muncul 
  //di title hanyalah "New", sehingga kurang informatif. code di bawah memungkinkan supaya yang muncul
  //adalah name dari action yang diacu oleh menu tersebut.
		load_record: function(record) {
    	var new_title = this.options.action.name;
			result = this._super(record);
			this.set({ 'title' : record.id ? record.display_name : (new_title ? _t(new_title) : _t("New")) });
			return result;
		},
		
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
		
	//enable fasilitas untuk mengubah label save. Cara pemakaian:
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
	
	instance.web.form.FieldMany2One = instance.web.form.FieldMany2One.extend({
	//menghapus option Create and Edit dan Create *beep* dari hasil pencarian
	//tambahkan atribut no_create="1" di <field> many2one yang mana dua opsi itu mau diilangin 
	//contoh pemakaian:
	/*
		<form...>
			<field name="level_id" no_create="1" />
		</form>
	*/
		render_editable: function() {
			this._super();
			var self = this;
			var no_create = this.node.attrs['no_create'];
			this.$input.autocomplete({
				source: function(req, resp) {
					self.get_search_result(req.term).done(function(result) {
						if (no_create) {
							var new_result = [];
							$.each(result, function() {
								if (!(typeof this.action == "function" && this.label.indexOf("Create") === 0)) {
									new_result.push(this);
								}
							});
							resp(new_result);
						} else {
							resp(result);
						}
					});
				},
			})
		},
	});
	
}

