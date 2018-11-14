var express=require("express"),
    app =express(),
    bodyParser=require("body-parser"),
    mongoose=require("mongoose"),
    methodOverride=require("method-override");
    expressSanitizer=require("express-sanitizer"),
    passport=require("passport"),
    User=require("./model/user.js"),
    localStrategy=require("passport-local"),
    passportLocalMongoose=require("passport-local-mongoose");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(require("express-session")({
secret:"Anything",
resave: false,
saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next) {
res.locals.isUser=req.user;
next();
});
app.set("view engine","ejs");
mongoose.connect("mongodb://ishan:yelpcamp123@ds029821.mlab.com:29821/blog876", { useNewUrlParser: true });
var blogSchema= new mongoose.Schema(
{
title: String,
image: String,
body: String,
created:{type:Date,default:Date.now()}
}
);
var blog=mongoose.model("blog",blogSchema);

// blog.create({
// title: "Pigeons",
// image:"https://images.mentalfloss.com/sites/default/files/styles/mf_image_16x9/public/459405241.jpg?itok=R-R95ENk&resize=1100x1100.jpg",
// body: "This is an awesome bird!"
// },function(err,blog) {
// if(err){
//  console.log(err);
// }else {
//  console.log(blog);
// }
// });
app.get("/",function(req,res) {
  res.redirect("/blogs");
})
// Index Route
app.get("/blogs",function(req,res) {
	blog.find(function(err,blogs) {
      if(err){
      	console.log(err);
      }else{
      	res.render("index",{blogs:blogs});
      }
	});
});

app.post("/blogs",function(req,res) {
    req.body.blog.body=req.sanitize(req.body.blog.body);
  blog.create(req.body.blog);
  res.redirect("/blogs");
});
// New Route
app.get("/blogs/new",isLoggedIn, function(req,res) {
res.render("form"); 
});
// Show Route
app.get("/blogs/:id",function(req,res) {
blog.findById(req.params.id,function(err,foundBlog) {
if(err){
  console.log(err);
}else{
res.render("show",{blog:foundBlog});
}
});
});
// Edit Route
app.get("/blogs/:id/edit",function(req,res) {
  blog.findById(req.params.id,function(err,foundBlog) {
if(err){
  res.redirect("/blogs");
}else {
  res.render("edit",{blog:foundBlog});
}
  });
});
//Update Route
app.put("/blogs/:id",function(req,res) {
    req.body.blog.body=req.sanitize(req.body.blog.body);
  //findByIdAndUpdate(id,newData,callBack);
blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog) {
if(err){
  res.redirect("/blogs");
}else {
 res.redirect("/blogs/"+req.params.id); 
}
});
});
// delete route
app.delete("/blogs/:id",function(req,res) {
blog.findByIdAndRemove(req.params.id,function(err,removedBlog) {
  if(err){
   res.redirect("/blogs");
  }else{
 res.redirect("/blogs");
  }
})
});
app.get("/register",function(req,res) {
res.render("register");
});
app.post("/register",function(req,res) {
User.register(new User({
  username:req.body.username
}),req.body.password,function(err,user) {
  if(err){
    console.log(err);
    return res.render("register");
  }
  passport.authenticate("local")(req,res,function() {
      res.redirect("/blogs");
  });
});
});
app.get("/login",function(req,res) {
  res.render("login");
});
app.post("/login",passport.authenticate("local",{
  successRedirect:"/blogs",
  failureRedirect:"/login"
}),function(req,res) {
});
app.get("/logout",function(req,res) {
  req.logout();
  res.redirect("/blogs");
});
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    next();
  }
  else{
    res.redirect("/login");
  }
}
app.listen("3000","127.0.0.1",function(){
console.log("Server Started!!")
});
