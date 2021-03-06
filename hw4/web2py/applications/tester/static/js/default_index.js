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
        var input = event.target;
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
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
        $.post(add_images_url,
            {
                get_url: get_url
            },
            function (data) {
                console.log(data);
            });
    setTimeout(function(){self.display_images()}, 1000);
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
        })
        for(i = 0; i<self.vue.selected_user_images.length;i++){
            if(self.vue.selected_user_images[i].name_ == selected_user){
                self.vue.trimmed_array.push(self.vue.selected_user_images[i]);
            }
        }
        self.vue.user_images = self.vue.trimmed_array;
        self.vue.trimmed_array = [];
    }


    self.current_user = function(){
        $.getJSON(current_user_url, function(data) {
            console.log(data);
        })
    }

    self.sort_users = function(){
        console.log(users);
    }

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            trimmed_array: [],
            selected_user_images: [],
            user_images: [],
            users: [],
            is_uploading: false,
            logged_in: true,
             // Leave it to true, so initially you are looking at your own images.
        },
        methods: {
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_file: self.upload_file,
            user_selected: self.user_selected,
        }

    });
    self.display_images();   
    self.get_users();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});

