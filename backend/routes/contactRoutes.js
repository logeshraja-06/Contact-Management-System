import express from 'express';
import Contact from '../models/Contact.js';

const router = express.Router();

router.post('/',async (req,res)=>{
    try{
        const contact = new Contact(req.body);
        await contact.save();
        res.json(contact);
    }
    catch(err){
      res.status(400).json({error: err.message})
    }
})

router.get('/',async(req,res)=>{
    try{
        const {status, search} = req.query;
        let filter = {};
        if (status) filter.status = status;
        if (search){
            const regex = new RegExp (search, "i");
            filter.$or = [
                {name: regex},
                {company: regex}
            ]
        }

        const contacts = await Contact.find(filter).sort({createdAt: -1});
        res.json(contacts);
    }
    catch(err){
        res.status(500).json({err: err.message})
    }
})

router.put('/:id', async(req,res)=>{
    try{
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        );
        res.json(contact)
    }
    catch(err){
        res.status(400).json({error: err.message})
    }
})

router.delete('/:id',async(req,res)=>{
    try{
        await Contact.findByIdAndDelete(req.params.id);
        res.json({message: "Contact deleted"})
    }
    catch(err){
        res.status(400).json({error: err.message})
    }
})

export default router;