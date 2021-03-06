{
	'name': 'CHJS Customized Views',
	'version': '0.1',
	'category': 'General',
	'description': """
		Custom view functionality, used for internal projects.
	""",
	'author': 'Christyan Juniady and Associates',
	'maintainer': 'Christyan Juniady and Associates',
	'website': 'http://www.chjs.biz',
	'depends': ["base","web"],
	'sequence': 145,
	'data': [
		'views/chjs_custom_view.xml',
	],
	'demo': [
	],
	'test': [
	],
	'update_xml': [
	],
	'qweb': [
		'static/src/xml/month_year_spinner.xml',
		'static/src/xml/chjs.view.combo.checkbox.xml',
	],
	'installable': True,
	'auto_install': True,
}
