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
            	image_url = r.image_url
            )
            images.append(t)
    return response.json(dict(
        images = images,
        ))

def get_users():
    print "made it to get users"
    users = []
    rows = db().select(db.user_images.ALL, orderby=~db.user_images.created_on, limitby=(0,20))
    for r in rows:
            t = dict(
                name_ = r.name_,
            )
            if t not in users:
                users.append(t)
    return response.json(dict(
        users = users,
        ))




# Here go your api methods.


