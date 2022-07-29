/**
 * Created by vishal on 5/10/16.
 */
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  moment = require('moment'),
  bcrypt = require('bcrypt');

passport.serializeUser(function(user, done) {
  //done(null, user.id);
  done(null, user);
});

passport.deserializeUser(function(user, done) {
      //sails.log.info("Enter passport");
	  var id = user.id;
	  if(user.logintype=='local')
	  {
		  Adminuser.findOne({ id: id } , function (err, user) {
			//done(err, user);
			if(err){
				return done(null,err);
			}
			done(null, user);
		  });
	  }
	  
	  if(user.logintype=='user-local')
	  {
		  User.findOne({ id: id } , function (err, user) {
			//done(err, user);
			if(err){
				return done(null,err);
			}
			done(null, user);
		  });
	  }
	  
	  if(user.logintype=='staff-local')
	  {
		  PracticeUser.findOne({ id: id } , function (err, user) {
			//done(err, user);
			if(err){
				return done(null,err);
			}
			done(null, user);
		  });
	  }
});

// Admin Login
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
   
    Adminuser.findOne({ email: email }, function (err, user) {
											 	  
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      bcrypt.compare(password, user.password, function (err, res) {
																
        if (!res)
          return done(null, false, {
            message: 'Invalid Password'
          });
		   
		var returnUser = {
		  email: user.email,
		  createdAt: moment(user.createdAt).format('MM-DD-YYYY'),
		  role: user.role,
		  id: user.id,
		  logintype:'local'
		};
		return done(null, returnUser, {
		  message: 'Logged In Successfully'
		});
		
      });
    });
  }
));

// Borrower login
passport.use('user-local', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
	function(email, password, done) {
				   
				   //sails.log.info("email", email);
				   
		User.findOne({ email: email }, function (err, user) {
		  
		  if (err) { return done(err); }
		  if (!user) {
			return done(null, false, { message: 'Incorrect email.' });
		  }
		  
		  /*sails.log.info("user", user);
		  sails.log.info("password", password);
		  sails.log.info("user.password", user.password);*/
		  
		  bcrypt.compare(password, user.password, function (err, res) {
					
			//sails.log.info("err", err);
					
			if (!res)
			  return done(null, false, {
				message: 'Invalid Password'
			  });
			   
			var returnUser = {
			  email: user.email,
			  firstname: user.firstname,
			  lastname: user.lastname,
			  createdAt: moment(user.createdAt).format('MM-DD-YYYY'),
			  role: user.role,
			  id: user.id,
			  logintype:'user-local'
			};
			//sails.log.info("returnUser", returnUser);
			
			return done(null, returnUser, {
			  message: 'Logged In Successfully'
			});
			
		  });
		});		
	 }
 ));

// Staff Login

 passport.use('staff-local', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
	function(username, password, done) {
			   
		PracticeUser.findOne({ username: username }, function (err, user) {
		  
		  if (err) { return done(err); }
		  
		  if (!user) {
			return done(null, false, { message: 'Incorrect username.' });
		  }
		 		  
		  bcrypt.compare(password, user.password, function (err, res) {
					
					
			if (!res)
			  return done(null, false, {
				message: 'Invalid Password'
			  });
			   
			var returnUser = {
		      username: user.username,		
			  email: user.email,
			  createdAt: moment(user.createdAt).format('MM-DD-YYYY'),
			  role: user.role,
			  id: user.id,
			  logintype:'staff-local'
			};
			
			return done(null, returnUser, {
			  message: 'Logged In Successfully'
			});
			
		  });
		});		
	 }
  ));

