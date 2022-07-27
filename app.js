//ADDING DATABASE into 'todolist-v1' 
const express = require("express");//install  externally express 
const bodyParser = require("body-parser");//install externally using nmp i body-parser
const res = require("express/lib/response");
const mongoose = require("mongoose");
const _ = require("lodash");


// console.log(date());

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));//since ejs don't support 'css file directly', so put that css file inside 
//"public folder" & express.static allows accessing static files ,so now "ejs file " will pick "css file" from 
//public folder


mongoose.connect("mongodb+srv://admin-tahira:and123or123@cluster0.zvb9wyb.mongodb.net/todolistDB" , {useNewUrlParser: true}); // todolistDB is Database name here

const itemSchema = { //"itemSchema" here is a schema
  name : String
};

const Item = mongoose.model("Item", itemSchema) //"Item" is Collection here inside 'itemSchema' which will be
// considered as a PLURAL "Items" bydefault by database.

const item1 = new Item({
  name : "Welcome to the todolist"
});

const item2 = new Item({
  name : "Hit the + button to add item to the todolist"
});

const item3 = new Item({
  name : "Hit the <-- button to delete item from the todolist"
});

const defaultItems = [item1, item2, item3];

const listSchema = { //listSchema here is an Schema
 name : String,
 items : [itemSchema]  //itemSchema i.e "Schema" is passed here as an Array into "items" variable
};

const List = mongoose.model("List", listSchema); //"List" is Collection here inside 'listSchema' which will be 
// considered as a PLURAL "Lists" bydefault by database.


// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Successfully saved items in DB");
//   }
// });



//const items = ["buy Food", "Cook food", "Eat Food"];
//const workItems = [];//here in JS, const can add new items in ARRAY , but cannot Assign a NEW ARRAY to "workItems"

app.get("/", function(req,res){
   
     //const day = date.getDay();
    Item.find({}, function(err, foundItems){ // here 'find{}' means FIND ALL , here 'foundItems' is the 
      //result/items found inside the database 
      // console.log(foundItems);
      if (foundItems.length == 0){
       Item.insertMany(defaultItems, function(err){//doing this so that defaultItems get inserted only Once
        // despite of getting '/' request multiple times
       if(err){
        console.log(err);
       }
       else{
       console.log("Successfully saved items in DB");
       }
      });
      res.redirect("/");
      }else  { //this render will take to the 'list.ejs' file 
        res.render("list", {listTitle : 'Today', newListItems: foundItems}); //getting data from webserver to webpage
        //writing all "ejs" once b/c writing it more than once creates error
      }
      
    });
   
  });


  app.get("/:customListName", function(req,res){  // when any custom list name is entered on google, like 
    //localhost:3000/:shopping , that request will be triggered here inside this block
    const customListName = _.capitalize(req.params.customListName); //capitalize 1st word only rest remain small

    List.findOne({ name : customListName}, function (err, foundList) {
      if(!err){
        if(!foundList){ //checks if this new List name either already exists in our Schema or not
          //console.log("Doesn't exists");
          //Create a new list
          const list = new List({
            name : customListName,
            items : defaultItems
          });
          list.save();
          res.redirect("/" + customListName); //this again redirects back to main List Named Page
        }
        else{  //if list name entered already exists then directly render it
          //console.log("Exists!");
          //Show an existing list
          res.render("list", {listTitle : foundList.name, newListItems: foundList.items});
          
        }
      }
    
    });

    
  });


  app.post("/",function(req,res){
      //console.log(req.body);
     const itemName = req.body.newItem;
     const listName = req.body.list;   //these will fetch whatever entered in NEW ITEM input box

     const item = new Item({ //this is called as creating a 'Document'
      name : itemName
     });

     if(listName === 'Today'){
      item.save(); //saving new item into 'items collection'
      res.redirect("/");
     }else{
      List.findOne( {name : listName}, function( err, foundList){ //foundlist is 
        foundList.items.push(item); //item contains 'itemName' , this will be saved inside 'foundlist'
        foundList.save();
        res.redirect("/"  + listName);
      });
     }
     
    //   if(req.body.list === "Work"){ //list type shown on console...if its "Home Route"  or "Work"
    //   workItems.push(item);//then push that newly entered item into "workItems Array"
    //   res.redirect("/work"); //this redirects to app.get("/work"0
    //   }else{
    //     items.push(item);

    //     res.redirect("/"); //this takes to app.get()
      
     
     // console.log(item); //getting data from webpage to webserver

      
  });

  app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
      Item.findByIdAndRemove(checkedItemId, function(err){
        if(!err){
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        }
      });
    }else{
      List.findOneAndUpdate( {name : listName}, {$pull : {items : {_id: checkedItemId} }}, function(err, foundList){
      if(!err){  //here $pull will remove the item by identifying 'id' of checkedItemId
        res.redirect("/" + listName)

      }
    });
  }

    
  });

  app.get("/work" ,function(req,res){
  res.render("list", {listTitle : "Work List", newListItems : workItems});
  });

  app.post("/work", function(req,res){
      const item = req.body.newItem;
      workItems.push(item);
      res.redirect("/work");
  });

  app.get("/about", function(req,res){
   res.render("about");
  });

  app.listen(3000, function(){
    console.log("Server is running on port 3000");
});