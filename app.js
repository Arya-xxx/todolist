const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const { redirect } = require("express/lib/response");

const _= require("lodash");


const app= express();
 var item=[];

var workItems=[];

mongoose.connect('mongodb://localhost:27017/todolistdb',{useNewUrlParser: true});

const itemsSchema={
  name: String
};

const Item=mongoose.model("Item",itemsSchema);



const item1 = new Item({ name: "Welcome to your Todolist!" });
const item2 = new Item({ name: "Hit + button to add a new item." });
const item3 = new Item({ name: "<-- Hit this to delete a item" });
const defaultItems = [item1, item2, item3];

//----------- Custome List schema -----------
const listSchema = { 
  name: String,
   items: [itemsSchema]
   };

const List = mongoose.model("List", listSchema);



app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


app.get("/", function(req, res){


   var today= new Date();
    var day=today.getDay();

    var options={

        weekday: "long",
        day: "numeric",
        month: "long"
    };


  var Day=  today.toLocaleDateString('hin-IN',options);



  Item.find({}, function(err, foundItems){

  
    if(foundItems.length==0)
    {
      res.redirect("/");
    }

    else
    {
       res.render('list', {listTitle: "Today", ITEM:foundItems});
    }

  });


   

  
// res.send();

});


app.get("/work", function(req, res){

    res.render("list", {listTitle: "Work List", ITEM: workItems});

});


app.post("/work", function(req,res){

    let addnew=req.body.addit;
    console.log(req.body.list)
    console.log(addnew);
        workItems.push(addnew);
        req.redirect("/work");
    

  res.send();

});


app.get("/about", function(req,res){

    res.render("about");

});

app.get("/:customList", function(req,res){

  const customList=req.params.customList;

  _.capitalize(customList);

  List.findOne({name:customList}, function(err,foundList){

    if(!err)
    {
      if(!foundList)
      {
            const list=new List({
        name: customList,
        items: defaultItems
      });

  list.save();
  res.redirect("/" + customList);
      }

      else {

        res.render("list", {listTitle:foundList.name, ITEM: foundList.items});
      }
    }

    else {

      console.log("error");
    }

  });

 



});

app.post("/", function(req,res){

   var addnew=req.body.addit;
   var listname=req.body.list;
   

  const entry= new Item({
    name: addnew
  });

  if(listname=="Today") {

    entry.save();
    res.redirect("/");
  }

  else {
    List.findOne({name: listname}, function(err, foundList){

      foundList.items.push(entry);
      foundList.save();
      res.redirect("/" + listname);
       res.send();

    });
  }

  // entry.save();
  // res.redirect("/");
 
});


app.post("/delete",function(req, res){

  const ID=req.body.checkbox;
  const listName= req.body.listName;

  if(listName=="Today")
  {
  console.log(ID);

  Item.deleteOne({_id:ID}, function(err){
    if(err) {console.log(err);}

    else{ console.log("hm");}
  });
  res.redirect("/");
  res.send();
}

else {
  List.findOneAndUpdate({name:listName}, {$pull:{items: {_id:ID}}}, function(err, founditem){
    if(!err){

      res.redirect("/"+listName);
      res.send();

    }
  });
}

});




app.listen("3000", function(){

    console.log("http://localhost:3000");
});