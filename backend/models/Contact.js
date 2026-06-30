import mongoose from 'mongoose';
const contactSchema = new mongoose.Schema({
    name: {type: String, required:true},
    email: String,
    phone: String,
    company: String,
    status:{
        type: String,
        enum: ["Interested","Follow-up","Closed"],
        default: "Interested"
    },
    createdAt: {type: Date, default: Date.now}
})

export default mongoose.model("Contact", contactSchema)