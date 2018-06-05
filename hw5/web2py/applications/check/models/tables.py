# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

def get_user_email():
    return auth.user.email if auth.user else None

def get_user_first_name():
	return auth.user.first_name if auth.user else None


db.define_table('user_images',
                Field('id'),
                Field('created_on', 'datetime', default=request.now),
				Field('created_by', 'reference auth_user', default=auth.user_id),
				Field('name_', default=get_user_first_name()),
				Field('image_url'),
                Field('price', 'float'),
                Field('in_cart','boolean', default = False),
                )

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
