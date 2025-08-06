const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const bodyParser=require('body-parser')
const session=require('express-session');
const dir = path.join(__dirname, 'frontend');
const server = http.createServer(app);
const { Server, Socket } = require("socket.io");
const io = new Server(server);
const mongoose=require("mongoose");
const data=require("./formongo");
const { Console } = require("console");
mongoose.connect("mongodb://0.0.0.0/test")
let id={}
let cl={}
let room={}
//socket handling
io.on("connection", (socket) => {
    socket.on("new-user",async(name)=>{
        const client=name
        cl[0]=name;
        id[0]=socket.id
        console.log(id[0])
        const userid=id[0];
        res=await data.findOne({name:name})
        console.log(userid);
        if(!res){
        const re=await new data({id:userid,name:client});
        const users=await re.save()
                 }
         else{
                const mesages=await  data.updateOne({name:name},{
                 $set:{
                  id:userid
                  }
             })
                console.log(mesages)
    }
    socket.broadcast.emit("user-join",name)
})
    
    socket.on("message",async(message,name)=>{
        name=name
                 const userid=id[0];
            const mesages=await  data.updateOne({id:userid,name:name},{
                $set:{
                    lastmessage:message
                }
            })
        io.emit("mesages",message,name);
    
    })

    socket.on("disconnect",async(message)=>{
        const delet=id[0];
         const re=await data.findOne({id:delet})
        
         const name=re!==null?re.name:"Unknown"
        socket.broadcast.emit("left",name);
        const res= await data.deleteOne({id:delet})

    })
    socket.on("perchat",async(mesage,name)=>{
        const percon=mesage;
        const d=await data.findOne({name:percon})
        const rec=name
        if(d){
        io.to(d.id).emit("percon",rec)
        }
        else{
            const x=await data.findOne({name:name})
            io.to(x.id).emit("none");
        }
    })
    socket.on("pechat",async(mess,name,recpname)=>{
        console.log("hello");
        const rec=recpname
        console.log(rec)
        console.log(rec)
        const y=await data.findOne({name:rec})
        const mesages=await  data.updateOne({name:name},{
            $set:{
                lastmessage:mess
            },
                $push:{conversation:rec
                }
            
        })
        io.to(y.id).emit("chat",mess,name) 
    })
    socket.on("grpchat",async(grpname,name)=>{
        const  rooms=grpname
        room=grpname
        const mesages=await  data.updateOne({name:name},{
                $push:{groups:grpname
                }
            
        })
        socket.join(rooms);
        console.log("hello")
        io.to(rooms).emit("group",room,name)
    })
    socket.on("grpmsg",async(message,name)=>{
            const msg=message;
            const names=name
            const mesages=await  data.updateOne({name:names},{
                $set:{lastmessage:msg
                }
            
        })
            io.to(room).emit("grp",msg,names);
    })
});

app.use(express.static(path.join(__dirname,'frontend')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({secret:"screct",resave:true,saveUninitialized:true}));

app.get("/log",(req,res)=>{
    res.sendFile(path.join(__dirname,'frontend','log.html'));

})
app.post("/log",async(req,res)=>{
    const name=req.body
    console.log(name)
    const re=await new data(name);
    const user=await re.save()
    console.log(user);
    

    req.session.sesion = user;
    res.redirect("/")

})

app.get("/",(req,res)=>{
        if(req.session.sesion){
            
            res.sendFile(path.join(__dirname,'frontend','chat.html'));
        }
        else{
            res.redirect("/log")
        }
})

app.get("/name",(req,res)=>{
    if(req.session.sesion){
        const send=req.session.sesion.name;
        res.json({ name: send});
    }
    else{
        res.redirect("/log")
    }
})
app.get("/newtab",(req,res)=>{
         req.session.destroy((err)=>{
                if(err){
                    res.send("opss,close tab and reopen website")
                }
                else{
                    res.redirect("/log")
                }
          })
})


server.listen(8000,()=>{

})
