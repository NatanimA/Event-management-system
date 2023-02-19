var express = require('express');
var router = express.Router();
const verify = require('../verifyToken')
const { registerUser, authenticateUser, logoutUser, updatePassword, resetPassword,
  userEvents, createEvents, updateEvent, detailEvent, createInvite } = require('../controllers/user')

router.route('/')
  .post( async (req,res) => {
    return await registerUser(req,res)
  });

router.route('/login')
  .post( async(req,res) => {
    return await authenticateUser(req,res)
  })

router.delete('/logout',async (req,res) => {
  return await logoutUser(req,res)
})

router.put('/password',verify,async (req,res) => {
  return await updatePassword(req,res)
})

router.put('/password/reset',verify,async (req,res) => {
  return await resetPassword(req,res)
})

router.route('/events')
  .get(verify,async(req,res) => {
    return await userEvents(req,res)
  })

  .post(verify,async(req,res) => {
    return await createEvents(req,res)
  });

router.route('/events/:id')
  .put(verify,async(req,res) => {
    return await updateEvent(req,res)
  })

  .get(verify,async(req,res) => {
    return await detailEvent(req,res)
  });

router.route('/invites')
  .post(verify,async(req,res) => {
    return await createInvite(req,res)
  })


module.exports = router;
