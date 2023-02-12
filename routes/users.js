var express = require('express');
var router = express.Router();
var {User} = require('../app/models/models')

/* GET users listing. */
router.route('/')
  .get( async(req,res) => {
    const user = await User.findAll();
    res.status(200).send(user);
  })

  .post( async (req,res) => {
    const { name, email, password} = req.body;
    const user = await User.create({
      name: name,
      email:email,
      password: password
    })
    if(user) return res.status(201).send(user);
    res.status(500).send("Something went wrong please try again later");
  })
module.exports = router;
