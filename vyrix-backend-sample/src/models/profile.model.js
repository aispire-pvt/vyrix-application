const mongoose= require("mongoose");

const profileSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user-data"
    },
    profile_pic:{
        type:String,
        default:""
    },
    username:{
        type:String,
        trim:true,
        default:""
    },
    profession:{
        type:String,
        trim:true,
        default:""
    },
    theme:{
        type:String,
        enum:["light","dark"],
        default:"light"
    },
    },
    {
        timestamps:true,
        versionKey:false
    });

const profileModel= mongoose.model("profile",profileSchema);

module.exports=profileModel;