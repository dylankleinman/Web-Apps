// This is the js for the default/index.html view.


var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    self.open_uploader = function () {
        $("div#uploader_div").show();
        self.vue.is_uploading = true;
    };

    self.close_uploader = function () {
        $("div#uploader_div").hide();
        self.vue.is_uploading = false;
        $("input#file_input").val(""); // This clears the file choice once uploaded.

    };

    self.upload_file = function (event) {
        // Reads the file.
        var input = $("input#file_input")[0];
        var file = input.files[0];
        if (file) {
            // First, gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    req.addEventListener("load", self.upload_complete(get_url));
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };


    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        var price = $('#price_input').val();
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
        $.post(add_images_url,
            {
                price: price,
                get_url: get_url
            },
            function (data) {
                console.log(data);
            });
    setTimeout(function(){self.display_images()}, 1000);
    setTimeout(function(){self.get_users()}, 1000);
    };

    self.display_images = function(){
        $.getJSON(get_images_url, function(data) {
            self.vue.user_images = data.images;
            console.log(data);
        })
    };

    self.get_users = function(){
        $.getJSON(get_users_url, function(data) {
            self.vue.users = data.users;
            self.vue.logged_in = data.logged_in;
            var index = data.current_user;
            var temp;
            // console.log(data.current_user);
            for(i = 0; i<self.vue.users.length;i++){
                if(self.vue.users[i].name_ == index){
                    temp = self.vue.users[0];
                    self.vue.users[0] = self.vue.users[i];
                    self.vue.users[i] = temp;
                }
            }
            console.log(data);
        })
    }

    self.user_selected = function(selected_user){
        $.getJSON(selected_images_url, function(data) {
            self.vue.selected_user_images = data.images;
            // console.log(data.images);
            for(i = 0; i<self.vue.selected_user_images.length;i++){
                if(self.vue.selected_user_images[i].name_ == selected_user){
                    self.vue.trimmed_array.push(self.vue.selected_user_images[i]);
                }
            }
            self.vue.user_images = self.vue.trimmed_array;
            self.vue.trimmed_array = [];
        })

        $.getJSON(get_users_url, function(data) {
            var index = data.current_user;
            if(index != selected_user){
              self.vue.my_images = false;
            }
            if(index == selected_user){
              self.vue.my_images = true;
            }
        })
    }

    self.set_price = function(id, price){
      $.post(price_update_url,
          {
              id: id,
              price: price,
          },);
    }

    self.add_to_cart = function(id,in_cart){
      for(i=0;i<self.vue.user_images.length;i++){
        if(self.vue.user_images[i].id == id){
          self.vue.user_images[i].in_cart = !self.vue.user_images[i].in_cart;
        }
      }
      for(i=0;i<self.vue.user_images.length;i++){
        if(self.vue.user_images[i].in_cart){
          if(self.vue.cart.includes(self.vue.user_images[i]) == false){
            console.log(self.vue.user_images[i].id, 'added to cart');
            self.vue.cart.push(self.vue.user_images[i]);
            self.vue.total_price += self.vue.user_images[i].price;
          }
        }
        if(in_cart){
          for(i=0;i<self.vue.cart.length;i++){
            if(id == self.vue.cart[i].id){
              self.vue.total_price -= self.vue.cart[i].price;
              self.vue.cart.splice(i, 1);
              console.log(id, 'remove');
            }
          }
        }
      }
      console.log(self.vue.cart);
      $.post(add_to_cart_url,
          {
              id: id,
          },);
    //self.display_images();
    // self.display_cart();
    }

    self.display_cart = function(){
      $.getJSON(get_cart_url, function(data) {
        self.vue.cart = data.cart;
        console.log(data.cart);
        for(i=0;i<self.vue.cart.length;i++){
          self.vue.total_price += self.vue.cart[i].price;
        }
      })
    }

    self.goto = function(page){
      if (page == 'cart') {
            // prepares the form.
            self.stripe_instance = StripeCheckout.configure({
                key: 'pk_test_CeE2VVxAs3MWCUDMQpWe8KcX',    //put your own publishable key here
                image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
                locale: 'auto',
                token: function(token, args) {
                    console.log('got a token. sending data to localhost.');
                    self.stripe_token = token;
                    self.customer_info = args;
                    self.send_data_to_server();
                }
            });
        };
    }

    self.open_payment = function(){
      self.stripe_instance.open({
            name: "Your nice cart",
            description: "Buy cart content",
            billingAddress: true,
            shippingAddress: true,
            amount: Math.round(self.vue.total_price * 100),
        });
    }

    self.send_data_to_server = function () {
        console.log("Payment for:", self.customer_info);
        console.log('stripe token:', self.stripe_token);
        console.log('amount:', self.vue.total_price);

        // Calls the server.
        $.post(purchase_url,
            {
                customer_info: JSON.stringify(self.customer_info),
                transaction_token: JSON.stringify(self.stripe_token),
                amount: self.vue.total_price,
                cart: JSON.stringify(self.vue.cart),
            },
            function (data) {
              console.log('hello');
                if (data.result === "nok") {
                    // The order was successful.
                    self.vue.cart = [];
                    // self.update_cart();
                    // self.store_cart();
                    // self.goto('prod');
                    $.web2py.flash("Thank you for your purchase");
                } else {
                    $.web2py.flash("The card was declined.");
                }
            }
        );
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            trimmed_array: [],
            selected_user_images: [],
            user_images: [],
            users: [],
            cart: [],
            is_uploading: false,
            logged_in: false,
            my_images: true,
            is_checkout: false,
            total_price: 0,
             // Leave it to true, so initially you are looking at your own images.
        },
        methods: {
            open_payment: self.open_payment,
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_file: self.upload_file,
            user_selected: self.user_selected,
            set_price: self.set_price,
            add_to_cart: self.add_to_cart,
            checkout_toggle: self.checkout_toggle,
            goto: self.goto,
        }

    });
    self.display_cart();
    self.display_images();
    self.get_users();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
