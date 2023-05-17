const express = require("express");
const router = new express.Router();
const Products = require("../models/productsSchema");
const USER = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const Razorpay = require('razorpay');
const mongodb = require('mongodb')
const Address = require('../models/addSchema')


   
//payment





const athenticate = require("../middleware/authenticate");
//get product data api
router.get("/getproducts" , async(req ,res)=>{
		try{
			const productsdata = await Products.find();
			//  console.log("console the data"+ productsdata);
			res.status(201).json(productsdata);
		}catch(error){
				console.log("error" + error.message );
		}
});

//get individual data

router.get("/getproductsone/:id",async(req,res)=>{

	try {
		const {id} = req.params;
		// console.log(id);
		const individuadata = await Products.findOne({id:id});
		// 
		res.status(201).json(individuadata);
	}catch(error){
		res.status(400).json(individuadata);
		console.log("error" + error.message);
	}


});

//address
router.post("/address", async (req, res) => {
    // console.log(req.body);
    const { fname, number , address, landmark, pin } = req.body;
    console.log("yaha hai")
    if (!fname || !number || !address || !landmark || !pin) {
        res.status(422).json({ error: "filll the all details" });
        console.log("bhai nathi present badhi details");
    };

      try{
          const finaladdress = new Address({
              fname,number,address,landmark,pin
          })
          console.log(finaladdress)
          const storedata = await finaladdress.save();
          console.log(storedata + "user successfully added");
          res.status(201).json(storedata);

      }catch(error){
          console.log("error " + error.message);
          res.status(422).send(error+"hi");
      }
  
  })
  

// register data
router.post("/register", async (req, res) => {
    // console.log(req.body);
    const { fname, email, mobile, password, cpassword } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ error: "filll the all details" });
        console.log("bhai nathi present badhi details");
    };

    try {

        const preuser = await USER.findOne({ email: email });

        if (preuser) {
            res.status(422).json({ error: "This email is already exist" });
        } else if (password !== cpassword) {
            res.status(422).json({ error: "password are not matching" });;
        } else {

            const finalUser = new USER({
                fname, email, mobile, password, cpassword
            });
            console.log(finalUser)

            // yaha pe hasing krenge
			

            const storedata = await finalUser.save();
            // console.log(storedata + "user successfully added");
            res.status(201).json(storedata);
        }

    } catch (error) {
        console.log("error " + error.message);
        res.status(422).send(error);
    }

});

//login user api 
router.post("/login" , async(req,res) =>{
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "fill the details" });
    };
    try {

        const userlogin = await USER.findOne({ email: email });
        console.log(userlogin + "userlogin");
        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            // console.log(isMatch);
              //token
              const token = await userlogin.generateAuthtoken();
              console.log(token);

              res.cookie("TrendTrail" , token, {
                    expires: new Date(Date.now() + 25890000),
                    httpOnly: true
                });
                console.log("nahi kya kar raha bhai tu");


            if (!isMatch) {
                res.status(400).json({ error: "password is incorrect" });
            } else {
                res.status(201).json(userlogin);
                
                
            }
        }else{
            res.status(400).json({error:"user does not exist"})
        }
        


         
    } catch (error) {
        res.status(400).json({ error: "invalid crediential pass" });
        console.log("error in login" + error.message);
    }
});

//adding data to cart
router.post("/addcart/:id" ,athenticate ,async(req,res) =>{
    try{
        const {id} = req.params;
        const cart = await Products.findOne({id:id});
        console.log(cart +"cart value");

        const UserContact = await USER.findOne({_id : req.userID});
        console.log(UserContact);
        console.log("1step");
        if(UserContact){
            const cartData = await UserContact.addcartdata(cart);
            await UserContact.save();
            console.log(cartData);
            res.status(201).json(UserContact);

        }else{
            res.status(401).json({error:"user does not exist"})
        }
    }catch(error){

    }
});
 //get cart detail
 router.get("/cartdetails" , athenticate ,async(req, res)=>{
    try{
        const buyuser = await USER.findOne({_id:req.userID});

        res.status(201).json(buyuser);
    }catch(error){
        console.log("error" + error);

    }
 })
// get valid user
router.get("/validuser" , athenticate ,async(req, res)=>{
    try{
        const validuserone = await USER.findOne({_id:req.userID});

        res.status(201).json(validuserone);
    }catch(error){
        console.log("error" + error);

    }
 });

 

 router.get("/remove/:id", athenticate, async (req, res) => {
    try {
        const { id } = req.params;

        req.rootUser.carts = req.rootUser.carts.filter((curel) => {
            return curel.id != id
        });

        req.rootUser.save();
        res.status(201).json(req.rootUser);
        console.log("iteam remove");

    } catch (error) {
        console.log(error + "jwt provide then remove");
        res.status(400).json(error);
    }
});
//  router.delete("/remove/:id",athenticate ,async(req,res)=>{
//     try{
//         const {id} = req.params;
        
//         req.rootUser = req.rootUser.carts.filter((cruval)=>{
//             return cruval.id !== id;
            
//         }); 
        
//         req.rootUser.save();
//         res.status(201).json(req.rootUser);
//         console.log("item remove")


//     }catch(error){
//         console.log("error ba ho" + error);
//         res.status(400).json(req.rootUser);

//     }
//  });
 

 router.get("/logout", async (req, res) => {
    try {
        res.clearCookie("TrendTrail", { path: "/" });
        
        res.status(201).send('User logout');
        console.log("user logout");

    } catch (error) {
        console.log(error + "jwt provide then logout");
    }
});


//for payment

router.post("/payment" ,async(req , res)=>{
    
var instance = new Razorpay({ key_id: 'rzp_test_srsyXDwPbCkIPf', key_secret: 'lzfTBVfbdG76OR4VW4JruHyk' })

    
 const options = {
    amount: 50000,  // amount in the smallest currency unit
    currency: "INR",
    
  };
  const order = await instance.orders.create(options)
    console.log(order);
  }
)

//












module.exports = router;