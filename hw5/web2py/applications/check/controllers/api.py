import tempfile

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

# @auth.requires.signature()
def add_images():
    t_id = db.user_images.insert(
    	image_url = request.vars.get_url,
        price = request.vars.price,
        )
    return 'ok'

def update_price():
    created_by_db = db(db.user_images.id == request.vars.id).select().first()
    created_by_db.price = request.vars.price
    created_by_db.update_record()
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
                name_ = r.name_,
                price = r.price,
                id = r.id,
                in_cart = r.in_cart,
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
                name_ = r.name_,
                price = r.price,
                id = r.id,
                in_cart = r.in_cart,
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

def add_to_cart():
    print "made it to add_to_cart"
    id = request.vars.id
    created_by_db = db(db.user_images.id == id).select().first()
    created_by_db.in_cart = not created_by_db.in_cart
    created_by_db.update_record()
    print created_by_db.in_cart
    return 'ok'

def display_cart():
    print 'in display cart'
    cart=[]
    rows = db(auth.user_id != db.user_images.created_by).select(db.user_images.ALL, orderby=~db.user_images.created_on)
    for r in rows:
        if r.in_cart == True:
            t = dict(
                id = r.id,
                image_url = r.image_url,
                price = r.price,
                in_cart = r.in_cart,
            )
            if t not in cart:
                cart.append(t)
    return response.json(dict(
        cart = cart,
        ))

def purchase():
    print ('made it to purchase')
    """Ajax function called when a customer orders and pays for the cart."""
    if not URL.verify(request, hmac_key=session.hmac_key):
        print 'issue'
        raise HTTP(500)
    # Creates the charge.
    import stripe
    # Your secret key.
    stripe.api_key = myconf.get('stripe.private_key')
    token = json.loads(request.vars.transaction_token)
    amount = float(request.vars.amount)
    try:
        charge = stripe.Charge.create(
            amount=int(amount * 100),
            currency="usd",
            source=token['id'],
            description="Purchase",
        )
    except stripe.error.CardError as e:
        logger.info("The card has been declined.")
        logger.info("%r" % traceback.format_exc())
        return response.json(dict(result="nok"))
    return response.json(dict(result="nok"))






# Here go your api methods.
