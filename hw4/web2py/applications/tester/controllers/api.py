import tempfile

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

# @auth.requires.signature()
def add_images():
    t_id = db.user_images.insert(
    	image_url = request.vars.get_url,
        )
    return 'ok'

def get_images():
    print "Made it to the get images api"
    images = []
    rows = db(auth.user_id == db.user_images.created_by).select(db.user_images.ALL, orderby=~db.user_images.created_on, limitby=(0,20))
    for r in rows:
            t = dict(
            	created_by = r.created_by,
            	created_on = r.created_on,
            	image_url = r.image_url,
                name_ = r.name_
            )
            images.append(t)
    return response.json(dict(
        images = images,
        ))

def selected_images():
    print "displaying images of user"
    images = []
    rows = db().select(db.user_images.ALL, orderby=~db.user_images.created_on, limitby=(0,20))
    for r in rows:
            t = dict(
                created_by = r.created_by,
                image_url = r.image_url,
                name_ = r.name_
            )
            images.append(t)
    return response.json(dict(
        images = images,
        ))


def get_users():
    print "made it to get users"
    users = []
    current_user = None
    rows = db().select(db.user_images.ALL, orderby=~db.user_images.created_on, limitby=(0,20))
    for r in rows:
            t = dict(
                name_ = r.name_,
            )
            if t not in users:
                users.append(t)
    logged_in = auth.user_id is not None
    if(auth.user_id is not None):
        current_user = auth.user.first_name
    return response.json(dict(
        logged_in = logged_in,
        users = users,
        current_user= current_user,
        ))






# Here go your api methods.


