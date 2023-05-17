const mongoose = require("mongoose");


const addSchema = new mongoose.Schema({
	fname:{
		type:String,
		required:true,
		 
	},
		number:{
		type:String,
		required:true,
	    
		
		} ,
		address:{
			type:String,
		   required:true,
	     

		},
		landmark:{
			type:String,
		   required:true,
		   
		},
		pin:{
			type:String,
		   required:true,
		   
		},
		

		Order : Array
});


const Address = new mongoose.model("Address",addSchema );

module.exports = Address;