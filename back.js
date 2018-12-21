var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var expressSession = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");

var transporter = nodemailer.createTransport(smtpTransport({
    service:'gmail.com',
    auth: {
        user:'kineticpac@gmail.com',
        pass:'artsandphotograph'
    }
}));

var index = "index.html";
var port = process.env.PORT || 8080;


var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('./public/'));

app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: ["My pet name is HD and Harshi"]
}));
app.use(expressSession({
    secret:"My pet name is HD and Harshi",
    saveUninitialized:true,
    resave:false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    console.log("serialize User");
    done(null, user);
});

passport.deserializeUser(function(user, done) {

    done(null, user);
});


var clientSchema = mongoose.Schema({
    fullName: String,
    email: String,
    phoneNumber: String,
    password: String,
    address: String,
    history:[{
        serviceName:String,
        spName:String,
        spPhoneNumber:String,
        dateOfBooking:String
    }]
});

var servicesSchema = mongoose.Schema({
    sid:String,
    service:String,
    serviceType:String,
    providers:[{
        name:String,
        serviceOtherName:String,
        spid:String
    }]
});

var serviceProvidersSchema = mongoose.Schema({
    spid:String,
    fullName:String,
    service:String,
    serviceOtherName:String,
    serviceType:String,
    phoneNumber:String,
    email:String,
    password:String
});

/*mongoose.connect('mongodb://harshdeepsingh:har2972ar@ds145563.mlab.com:45563/qtaskers');*/


passport.use("client-local",new LocalStrategy({
    usernameField:'emailUsername',
    passwordField:'password'
},function (username,password,done) {
    console.log("strategy: username: " + username + " password: " + password);
    /*var emailUsername = req.query.emailUsername;
    var password = req.query.password;*/

    mongoose.connect('mongodb://harshdeepsingh:har2972ar@ds145563.mlab.com:45563/qtaskers');
    console.log("Connect");

    var clientModel = mongoose.model("Client",clientSchema,"clients");
    var dbpasswordHash,dbpasswordSalt;

    var temp = clientModel.findOne({email:username});
    temp.exec(function (err,response) {

        if(err) throw err;
        if(!response){
            return done(null,false,{message:"Incorrect Username/Email."});
        }
        if(response) {
            var passwordCheck = (password==response.password);
            if (!passwordCheck) {
                return done(null, false, {message: "Incorrect Password."});
            } else {
                //console.log("all good: " + response);
                return done(null, response, {message: "Success"});
            }
        }
    });
}));

passport.use("provider-local",new LocalStrategy({
    usernameField:'emailUsername',
    passwordField:'password'
},function (username,password,done) {
    console.log("strategy: username: " + username + " password: " + password);
    /*var emailUsername = req.query.emailUsername;
    var password = req.query.password;*/

    mongoose.connect('mongodb://harshdeepsingh:har2972ar@ds145563.mlab.com:45563/qtaskers');
    console.log("Connect");

    var providerModel = mongoose.model("Provider",serviceProvidersSchema,"serviceProviders");
    var dbpasswordHash,dbpasswordSalt;

    var temp = providerModel.findOne({email:username});
    temp.exec(function (err,response) {

        if(err) throw err;
        if(!response){
            return done(null,false,{message:"Incorrect Username/Email."});
        }
        if(response) {
            var passwordCheck = (password==response.password);
            if (!passwordCheck) {
                return done(null, false, {message: "Incorrect Password."});
            } else {
                //console.log("all good: " + response);
                return done(null, response, {message: "Success"});
            }
        }
    });
}));

app.get("/",function(req,res,next){
    if(req.user) index = "/dash.html";
    else index = "/index.html";
    res.sendFile(__dirname+ index);
})


app.get("/accountsDetailsAndroid",function(req,res,next) {
    var temp = clientModel.findOne({email: req.query.username});
    temp.exec(function (err, response) {
        if (err) throw err;
        if (!response) {
            res.send("Incorrect Username/Email.");
        }
        if (response) {
            var passwordCheck = (password == response.password);
            if (!passwordCheck) {
                res.send("Incorrect Password.");
            } else {
                //console.log("all good: " + response);
                res.json(response);
            }
        }
    });
})

app.get("/accountDetails",checkLogin,function(req,res,next){
    /*mongoose.connect('mongodb://harshdeepsingh:har2972ar@ds145563.mlab.com:45563/qtaskers');
    var clientModel = mongoose.model("Client",clientSchema,"clients");

    var username = "harshdeepsingh13@gmail.com", password = "har1234";
    var message;
    var temp = clientModel.findOne({email:username});
    temp.exec(function (err,response) {
        if(err) throw err;
        if(!response){
            res.send("In
            correct Username/Email.");
        }
        if(response) {
            var passwordCheck = (password==response.password);
            if (!passwordCheck) {
                res.send("Incorrect Password.");
            } else {
                //console.log("all good: " + response);
                res.json    (response);
            }
        }
    });*/
    var details = {
        fullName: req.user.fullName,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        address: req.user.address,
        history:req.user.history
    }
    res.json(details);
});

app.get("/checkProviderLogin",function(req,res,next){
    console.log("REQUEST GET: ");

    passport.authenticate('provider-local',function (err,user,info) {
        // console.log("info.message: " + info.message);
        if(err) {return next(err);}
        if(!user){
            res.send(info.message);
        }
        req.login(user,function (err) {
            if(err) {
                return next(err);
            }

            return res.send(info.message);
        })
        /*https://stackoverflow.com/questions/20521795/how-to-update-req-user-session-object-set-by-passportjs*/

    })(req, res, next);
})

app.get('/checkUserLogin',function(req,res,next){

    console.log("REQUEST GET: ");

    passport.authenticate('client-local',function (err,user,info) {
        // console.log("info.message: " + info.message);
        if(err) {return next(err);}
        if(!user){
            res.send(info.message);
        }
        req.login(user,function (err) {
            if(err) {
                return next(err);
            }
            index = "/dash.html";
            return res.send(info.message);
        })
        /*https://stackoverflow.com/questions/20521795/how-to-update-req-user-session-object-set-by-passportjs*/

    })(req, res, next);
    /*passport.authenticate('local', { successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true })*/
});

app.get('/checkForSession',function (req,res,next) {
    if(req.user){
        res.send({isSession:true,userInfo:{fullName:req.user.fullName}});
    }
    else res.send({isSession:false});
});


app.get('/logout',function(req,res,next){
    req.logout();
    index = "/index.html";
    res.redirect('/');
});

app.get("/test",function(req,res,next){
   console.log("test this is!!");
});

app.get("/login",function(req,res,next){
   res.sendFile(__dirname + "/login.html");
});

app.get("/login-provider",function(req,res,next){
    res.sendFile(__dirname + "/login1.html");
})

app.get("/dashboard",checkLogin ,function(req,res,next){
    res.sendFile(__dirname + "/dash.html");
})
app.get("/profile",checkLogin,function(req,res,next){
    res.sendFile(__dirname + "/profile.html")
})

app.get("/register",function(req,res,next){
    res.sendFile(__dirname + "/register.html");
});

app.get('/checkForRedundancy',function (req,res) {
    mongoose.connect('mongodb://harshdeepsingh:har2972ar@ds145563.mlab.com:45563/qtaskers'); //%40 is for '@' symbol
    var clientModel = mongoose.model("Client",clientSchema,"clients");
    if(req.query.email){
        // console.log("check " + req.query.email);
        clientModel.find({email:req.query.email},function(err,response){
            if(response.length>0){
                res.send(false);
            }
            else if(response.length == 0) res.send(true);
        });
    }

});
app.get('/checkForRedundancyProvider',function (req,res) {
    mongoose.connect('mongodb://harshdeepsingh:har2972ar@ds145563.mlab.com:45563/qtaskers'); //%40 is for '@' symbol
    var providerModel = mongoose.model("Provider",serviceProvidersSchema,"serviceProviders");
    if(req.query.email){
        // console.log("check " + req.query.email);
        providerModel.find({email:req.query.email},function(err,response){
            if(response.length>0){
                res.send(false);
            }
            else if(response.length == 0) res.send(true);
        });
    }

});

app.get("/getServiceProviders",function(req,res,next){
    mongoose.connect('mongodb://harshdeepsingh:har2972ar@ds145563.mlab.com:45563/qtaskers');
    console.log("Connect");
    var spModel = mongoose.model("ServiceProvider",serviceProvidersSchema,"serviceProviders");
    var findObject = {service:req.query.service, serviceType:req.query.serviceType};
    spModel.find(findObject,function(err,response){
       console.log(response);
       var returnObject=[];
       for(var i=0;i<response.length;i++){
           returnObject[i] = {
               email:response[i].email,
               phoneNumber:response[i].phoneNumber,
               spid:response[i].spid,
               fullName:response[i].fullName
           }
           if(response[i].service == "Others"){
               returnObject[i].serviceName = response[i].serviceOtherName
           }
           else returnObject[i].serviceName = response[i].service;
       }
       res.json(returnObject);

    });

})

app.get("/bookNow",checkLogin,function(req,res,next){
    var id = req.query.id;
    mongoose.connect('mongodb://harshdeepsingh:har2972ar@ds145563.mlab.com:45563/qtaskers');
    console.log("Connect");
    var clientModel = mongoose.model("Client",clientSchema,"clients");
    var providerModel = mongoose.model("Provider",serviceProvidersSchema,"serviceProviders");

    /*clientModel.findOne({email:req.user.email},function(err,response){
        var history = response.history;
        var newHistory = {};
        providerModel.findOne({spid:req.query.id},function(err,response){

            newHistory = {
                spName:response.fullName,
                spPhoneNumber:response.phoneNumber,
                dateOfBooking:Date(Date.now()).toString()
            }
            if(response.service == "Others")
                newHistory.serviceName = response.serviceOtherName;
            else newHistory.serviceName = response.service;
            history.push(newHistory);

            clientModel.findOneAndUpdate({email:response.email},{history:history},function(err,response){
                req.session.passport.user.history = history;
                console.log("updated");
                res.redirect("/profile")
            })
        })
    })*/


    var history = req.user.history;
    var newHistory = {};
    providerModel.findOne({spid:req.query.id},function(err,response) {
        console.log(response);
        newHistory = {
            spName: response.fullName,
            spPhoneNumber: response.phoneNumber,
            dateOfBooking: new Date().toISOString().substring(0,10)
        }
        if (response.service == "Others")
            newHistory.serviceName = response.serviceOtherName;
        else newHistory.serviceName = response.service;

        history.push(newHistory);
        clientModel.findOneAndUpdate({email:req.user.email},{history:history},function(err,response){
            req.session.passport.user.history = history;
            console.log("updated");
            var str = "Hey there,<br>Hope everything is well.<br>Please contact <b>" + newHistory.spName + "</b> to fix up the visit and share your concern for the same at <b>" + newHistory.spPhoneNumber + "</b>.<br>Thanks for stopping by.";
            var mailOptions = {
                from:"no-reply@qtaskers.com",
                to:req.user.email + ",harshdeepsingh13@gmail.com",
                subject:"Greetings from QTaskers, a new service have been booked",
                html:str
            }
            str = "Please contact <b>" + req.user.fullName + "</b> and fix up a meeting at <b>" + req.user.address + "</b>";
            transporter.sendMail(mailOptions,function(err,info){
                if(err) {console.log(err);}
                else {console.log("Done!");}
            });
            var mailOptions = {
                from:"no-reply@qtaskers.com",
                to:response.email + ",harshdeepsingh13@gmail.com",
                subject:"Greetings from QTaskers, you have a job",
                html:str
            }
            transporter.sendMail(mailOptions,function(err,info){
                if(err) {console.log(err);}
                else {console.log("Done!");}
            });
            res.redirect("/success")
        })
    });


});

app.get("/success",checkLogin,function (req,res,next) {
    res.sendFile(__dirname + "/success.html");
});

app.post("/newClient",function(req,res,next){

   var client = {
       fullName:req.body.fullName,
       email:req.body.email,
       phoneNumber:req.body.phoneNumber,
       password:req.body.password,
       address:req.body.address,
       history:[]
   };

    mongoose.connect('mongodb://harshdeepsingh:har2972ar@ds145563.mlab.com:45563/qtaskers'); //%40 is for '@' symbol
    var clientModel = mongoose.model("Client",clientSchema,"clients");
    var newClient = new clientModel(client);
    newClient.save(function(err,clientModel){
       if(err) throw err;
       res.redirect("/login");
    });
});

app.post("/newProvider",function(req,res,next){
    var sp = {
        fullName:req.body.fullName,
        email:req.body.email,
        phoneNumber:req.body.phoneNumber,
        password:req.body.password,
        serviceType:req.body.serviceType,
        address:req.body.address
    };
    console.log(sp);

    if(req.body.service != "Others")
        sp.service = req.body.service;
    else
        {
            console.log(req.body.serviceText);
            sp.service = "Others";
            sp.serviceOtherName = req.body.serviceText;
        }
    mongoose.connect('mongodb://harshdeepsingh:har2972ar@ds145563.mlab.com:45563/qtaskers'); //%40 is for '@' symbol
    console.log("connect");
    var spModel = mongoose.model("ServiceProvider",serviceProvidersSchema,"serviceProviders");
    var spId = "spihaad" + (Math.floor((Math.random() * 225500) + 1)+new Date().getDate() + new Date().getMinutes() + new Date().getSeconds());

    sp.spid = spId;
    var newSp = new spModel(sp);
    newSp.save(function(err,spModel){
        if(err) throw err;
        var servicesModel = mongoose.model("Serivces",servicesSchema,"services");
        console.log(spModel);
            servicesModel.find({service:spModel.service, serviceType:spModel.serviceType},function(err,response){

            if(response.length > 0){
                console.log("hello")
                console.log(response[0].service + " " + response[0].serviceType);
                var providersArray = response[0].providers;
                console.log(providersArray);
                var newProvider = {
                    name:spModel.fullName,
                    spid:spModel.spid
                };
                if(spModel.service == "Others"){
                    newProvider.serviceOtherName = spModel.serviceOtherName
                }
                var b = providersArray.includes(newProvider);
                if(!b)
                {

                    providersArray.push(newProvider);
                    console.log(providersArray)
                    servicesModel.findOneAndUpdate({service:response[0].service,serviceType:response[0].serviceType},{providers:providersArray},function(err,response){
                        console.log("Updated")
                    });
                }

            }
            else {
                var newService = {
                    service:spModel.service,
                    serviceType:spModel.serviceType,
                    providers:[
                        {
                            name:spModel.fullName,
                            spid:spModel.spid
                        }
                    ]
                }
                if(newService.service == "Others") newService.providers[0].serviceOtherName = spModel.serviceOtherName;
                var sId = "sihaad" + (Math.floor((Math.random() * 225500) + 1)+new Date().getDate() + new Date().getMinutes() + new Date().getSeconds());
                newService.sid = sId;
                var newModel = new servicesModel(newService);
                newModel.save(function(err,model){
                    console.log("Saved");
                })
            }
        })
        res.redirect("/login");
    });
});



app.listen(port,function(){
    console.log("Backend is running at http://localhost:" + port);
});


function checkLogin(req,res,next){
    if(req.user) next();
    else res.redirect("/login");
}
