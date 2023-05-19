const express = require('express');
const app = express();
const cors = require('cors');
const nodemailer=require('nodemailer')
const mongoose = require('mongoose')
const signinSc = require("./schema");
const productSchema = require("./schemaproduct");
const bcryptjs = require("bcryptjs");
require('dotenv').config()
app.use(express.json())

app.use(cors())
app.use(express.urlencoded({extended:false}))
     
mongoose
  .connect(
    "mongodb+srv://gokul332020:sample@cluster0.aoyk9fm.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("db connect");
  })
  .catch((e) => {
    console.log(e);
    console.log("db note connect");
  });

// bcrypt........................././/.///////////////

async function hashPass(password) {
  const res = await bcryptjs.hash(password, 10);
  return res;
}


async function compare(userPass, hashPass) {
  const res = await bcryptjs.compare(userPass, hashPass);
  return res;
}


//sign in.............................//.................

  try {
    app.get("/sign", async (req, res) => {
      const getone = await signinSc.find({});
    
      res.status(200).json(getone);

    });
  } catch (error) {
    console.log("error show");
    res.status(400).json(error)
}

 
app.post('/sign', async (req, res) => {
  const form = req.body.form
 
  const datasign = {
    names: form.name,
    email: form.email,
    password: await hashPass(form.password)                          // form.password,
  };


  try {

    const check = await signinSc.findOne({ email: form.email });
   
    if (check) {
  res.json("exist")
    } else {
        console.log(datasign);
      res.status(200).json("noexist");
      const app = await signinSc.insertMany([datasign]);
      
      console.log(app);
      console.log("data save");
   
    
}
  
  } catch (err) {
    console.log(err);
    res.status(400).json({message:"not send"})
    
  }
})
  


//login..........................................//....................


app.post('/login', async (req, res) => {
  const logdata = req.body.form

  try {
    const check = await signinSc.findOne({ email: logdata.email })

    if (check) {

     const passCheck = await compare(logdata.password, check.password);
      // check.password == logdata.password ? res.json("loginpass") : res.json("loginfail")

    passCheck ? res.json("loginpass") : res.json("loginfail")
     
    }
    else {
      res.json("nouser")
    }
  } catch (e) {
    res.json("fail")
    
  }
})


//MY ACCOUNT............................................/.................................


app.post('/myaccount', async (req, res) => {
  try {
    const email = req.body.cookieval
    
   
    const check = await signinSc.findOne({ email: email })
    console.log(check);
   return res.json(check.names)
    
  } catch (err) {
    res.json("fail")
  }
})



//forgot password send email........................................./.....................................


app.post("/sendEmail", async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.OTP;
console.log(otp);
    const check = await signinSc.findOne({ email: email });

    if (check) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MY_EMAIL, // replace with your email address
          pass: process.env.PASS, // replace with your email password or app password
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: "Ecommerce", // replace with your email address
        to: email,
        subject: "Password Reset",
        text: `The code to create a new password for the demo Ecommerce website is ${otp}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.json("fail");
           console.log(error);
        } else {
          res.json("pass");
        }
      });
    } else {
      res.json("notexist");
    }
  } catch (e) {
   
    res.json("fail");
  }
});

//................................/resetpassword......................../////////////

app.post("/resetPassword", async (req, res) => {
  const cookieVal = req.body.cookieVal;
  const password = req.body.password;
  console.log(cookieVal);
  console.log(password);
  try {
    const newPass = await hashPass(password);  //bcrypt the password
    
    await signinSc.updateOne(
      { email: cookieVal },
      { $set: { password: newPass } }
    );

    res.json("pass");
  } catch (e) {
    res.json("fail");
    console.log(e);
  }
  
});

//..................../............adminadd products.....................


app.post("/adminupdate", async (req, res) => {
  const form = req.body.form;
  const allimage = req.body.allimage;

  try {
 
    const datapro = {
      name: form.name,
      type: form.type,
      price: form.price,
      offer: form.offer,
      stocks: form.stocks,
      img: allimage,
      allRatings: [],
      reviews: [],
    };
 
    await productSchema.insertMany([datapro]);
    res.json("pass")
   
     
  } catch (e) {
    res.json("fail");
  }
});

//get product datas


app.get('/getval', async (req, res) => {
  try {
    const alldatas = await productSchema.find();
    console.log();
    res.status(200).json(alldatas);
    console.log("datas get succes");
  } catch (error) {
    console.log(error);
    console.log("not get value");
  }
 

})

//delete data


app.delete('/deletedata/:id', async (req, res) => {
  const { id } = req.params;
  console.log(req.params,"jhoiyoiuhu");
try {
  const deledatas = await productSchema.findByIdAndDelete({_id:id})
  res.status(200).json(deledatas);
} catch (error) {
  console.log("not delete");
  console.log(error);
  res.status(400).json(error)
}
})


//product updation works



app.patch('/upadte/:id', async (req, res) => {
  
  const {id}=req.params
  try {
    const ub = await productSchema.findByIdAndUpdate({
      _id: id
    },{
      ...req.body
    })


    res.status(200).json(ub)
    console.log("update Success");
  } catch (error) {
    console.log("not update");
    res.status(400).json(error)
  }
})



//getsingle data

app.get('/getonedata/:id', async (req, res) => {
  const { id } = req.params
  try {
      const values = await productSchema.findById(id);
      res.status(200).json(values);
      console.log("one data");
  } catch (error) {
    console.log("not get one data");
    res.status(400).json(error)
  }

})


//products page home


app.post("/alldatas", async (req, res) => {
  console.log(req.body.selectedoption);
  try {

    const type = req.body.selectedoption
    if (type == 'All') {
      const allproducts = await productSchema.find({}).skip(0).limit(12)
      const totalitmes = await productSchema.find({}).countDocuments() 
      console.log(totalitmes);
      const data = {
        allproducts: allproducts,
        totalitmes:totalitmes,
      }
      res.json(data)
     
   }   else {
      const allproducts = await productSchema.find({ type:type }).skip(0).limit(12); //product schema datas check the type input
      const totalitmes = await productSchema.find({ type:type }).countDocuments()
     const data = {
       allproducts: allproducts,
       totalitmes: totalitmes,
     }
     res.json(data);
 
   }
  } catch (err) {
    console.log(err)
    res.json("fail")
    
  }
});

//pagenumber to find page 1...2..3


app.post("/pageChange", async (req, res) => {
  console.log(req.body.selectedoption);
  try {
    const type = req.body.selectedoption;
    const pageNum = req.body.pageNum;
    if (type == "All") {
      const allproducts = await productSchema.find({}).skip((pageNum-1)*12).limit(12);
      // const totalitmes = await productSchema.find({}).countDocuments();
 
 res.json(allproducts);
    } else {
      const allproducts = await productSchema
        .find({ type: type })
        .skip((pageNum-1)*12)
        .limit(12); //product schema datas check the type input
  
      res.json(allproducts)
    }
  } catch (err) {
    console.log(err);
    res.json("fail");
  }
});



app.listen(process.env.PORT || 5000, () => {
  console.log("port is run");
});