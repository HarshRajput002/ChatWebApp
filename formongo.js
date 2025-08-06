const mongoose=require('mongoose');
const formd=new mongoose.Schema({
 id:String,
 name:String,
 lastmessage:[],
 conversation:[],
 groups:[]
})
module.exports=mongoose.model('chat',formd);