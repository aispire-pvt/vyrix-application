const mongoose= require("mongoose");

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
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
    emailVerified:{
        type:Boolean,
        default:false
    },
    otp:{
        type:String,
        default:null
    },
    otpExpiresAt:{
        type:Date,
        default:null
    },
    onboardingCompleted:{
        type: Boolean,
        default: false
    }
},
{
    versionKey: false,
    timestamps:true
});

const userModel= mongoose.model("user-data",userSchema);

module.exports=userModel;