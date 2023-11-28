import mongoose from "mongoose";

const userSchema = new  mongoose.Schema({

    firstname:{
        type:String,
        required:true,
        trim:true,
        maxlength:25,
    },
    lastname:{
        type:String,
        required:true,
        trim:true,
        maxlength:25,
    },
    username:{
        type:String,
        required:true,
        trim:true,
        maxlength:25,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    bYear: {
        type: Number,
        require: true,
        trim: true
    },
    bMonth: {
        type: Number,
        require: true,
        trim: true
    },
    bDay: {
        type: Number,
        require: true,
        trim: true
    },
    avatar: {
        type: String,
        default: 'https://png.pngtree.com/png-vector/20220607/ourmid/pngtree-person-gray-photo-placeholder-man-in-t-shirt-on-gray-background-png-image_4853796.png'
    },
    role: { type: String, default: 'user' },
    gender: { type: String, default: 'male' },
    mobile: { type: String, default: '' },
    address: { type: String, default: '' },
    story: {
        type: String,
        default: '',
        maxlength: 200
    },
    website: { type: String, default: '' },
    followers: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    following: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    saved: [{ type: mongoose.Types.ObjectId, ref: 'user' }]

} , {
    timestamps:true
});


const Users = mongoose.model('user' , userSchema);
export default Users;