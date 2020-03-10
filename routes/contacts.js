const express=require("express");
const router = express.Router();
const auth=require('../middleware/auth')
const {check,validationResult}=require('express-validator/check')

const User=require('../models/user');
const Contact=require('../models/contact');

//@route GET api/contacts
//@desc   Get all users contacts
//@access  Private
router.get('/',auth, async (req,res)=>{
try{
const contacts=await Contact.find({user:req.user.id}).sort({date:-1})
    res.json(contacts);

}catch(err){
console.error(err.message);
res.status(500).send('Server Error')
}
});

//@route POST api/contacts
//@desc   ADD new contact
//@access  Private
router.post(
    '/',
    [
auth,
[
    check('name',"Name is required")
    .not()
    .isEmpty()
]
],
async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
const {name,email,phone,type}=req.body;
try{
    const newContact=new Contact({
        name,
        email,
        phone,
        type,
        user:req.user.id
    });
    const contact=await newContact.save()
    res.json(contact);
}catch(err){
console.error(err.message)
res.status(500).send("Server Error")
}
}
);


//@route PUT api/contacts/:id
//@desc   Update contact
//@access  Private
router.put('/:id',auth, async (req,res)=>{
    const {name,email,phone,type}=req.body;

    //Build contact object
    const contactField={};
    if(name) contactField.name=name;
    if(email) contactField.email=email;
    if(phone) contactField.phone=phone;
    if(type) contactField.type=type;

    try{
let contact=await Contact.findById(req.params.id)
if(!contact)
    return res.status(404).json({msg:"Contact not found"});
    //Make sure user owns contact
    if(contact.user.toString() !==req.user.id){
        return res.status(401).json({msg:'Not autorized'})
    }
    contact= await Contact.findByIdAndUpdate(req.params.id,
        {$set:contactField},
        {new:true});

    res.json(contact);
    }catch(err){
console.error(err.message)
res.status(500).send("Server Error");
    }
});

//@route DELETE api/contacts/:id
//@desc   Deletecontact
//@access  Private
router.delete('/:id',(req,res)=>{
    res.send('Delete contact');
});



module.exports=router;