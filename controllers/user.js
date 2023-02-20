const { validateRegistration, validateAuthentication, validateChangePassword, validateResetPassword, validateCreateEvent, validateCreateInvite } = require('../validations')
var User = require('../models').User;
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
var Invite = require('../models').Invite;
var Event = require('../models').Event;
const Member = require('../models').Member;

const registerUser = async (req,res) => {
    try{
        const { error } = validateRegistration(req.body)
        if(error) return res.status(400).send(error.details[0].message)
        const userExist = await User.findOne({
            where:{
                email:req.body.email
            }
        })
        if(userExist) return res.status(400).send("Email is Already taken.")
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt)

        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })

        return res.status(201).send(user)

    }catch(err){
        return res.status(500).send(err)
    }
}

const authenticateUser = async (req,res) => {
    try{
        const { error } = validateAuthentication(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        const userExist = await User.findOne({
            where: {
                email: req.body.email
            }
        });
        if (!userExist) return res.status(400).send("User does not exist")
        const match = await bcrypt.compare(req.body.password, userExist.password)
        if (!match) return res.status(403).send("Email or password is not correct")

        const TOKEN = jwt.sign({ id: userExist.id, name: userExist.name, email: userExist.email}, process.env.TOKEN_SECRET)
        res.header('auth-system', TOKEN)
        const loggedUser = await User.findOne({
            where:{
                email:userExist.email
            },
            include: [Event, Invite]
        })
        res.status(200).send({
            "message":"Login success.",
            "events":loggedUser.Events,
            "invites":loggedUser.Invites
        })

    }catch(err){
        res.status(500).send(err)
    }
}

const logoutUser = (req,res) => {
    try{
        res.clearCookie('auth-system')
        res.cookie('auth-system', { expires: new Date(Date.now - 1) })
        res.status(200).send({
            message: "Successfully logged out"
        })
    }catch(err){
        res.status(500).send("Something went wrong please try again later")
    }
}

const updatePassword = async (req,res) => {
    try{
        // Check if request body is correct
        const { error } = validateChangePassword(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        const user = req.user
        const newPassword = req.body.newPassword;
        const oldPassword = req.body.oldPassword;
        const requestUser = await User.findOne({
            where: {
                id: user.id
            }
        })

        // Match old user password with the provided one
        const matcher = await bcrypt.compare(oldPassword, requestUser.password)
        if (!matcher) return res.status(400).send("Password is Incorrect.")

        // Hash the new password
        const salt = await bcrypt.genSalt(10)
        const newHashedPassword = await bcrypt.hash(newPassword, salt)

        // Update the users password
        requestUser.password = newHashedPassword
        requestUser.save({fields:['password']})

        return res.status(204).send({
            "message":"Password updated successfully"
        })

    }catch(err){
        res.status(500).send(err)
    }
}

const resetPassword = async (req,res) => {
    const { error } = validateResetPassword(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    const userExist = await User.findOne({
        where:{
            email:{
                [Op.like]: '%'+req.body.email+'%'
            },
            name:{
                [Op.like]: '%'+ req.body.name+'%'
            }
        }
    });

    if(!userExist) return res.status(400).send("Email or Name not registered")
    return res.status(200).send(
        {
            "message":"An Email has been sent to "+userExist.email+" on how you can reset your password"
    })
}

const userEvents = async(req,res) => {
    try{
        const user = await User.findOne({
            where: {
                id: req.user.id
            },
             include: Event
        })
        return res.status(200).send({
            "message": "Successful",
            "events": user.Events
        })

    }catch(err){
        return res.status(500).send("Something went wrong please try again later.")
    }
}

const createEvents = async(req,res) => {
    try{
        const { error } = validateCreateEvent(req.body)
        if(error) return res.status(400).send(error.details[0].message)
        const event = await Event.create({
            userId:req.user.id,
            name:req.body.name,
            description:req.body.description
        })
        return res.status(201).send(event)
    }catch(err){
        return res.status(500).send("Something went wrong please try again later.")
    }
}

const updateEvent = async(req,res) => {
    try{
        const { error } = validateCreateEvent(req.body)
        if(error) return res.status(400).send(error.details[0].message)
        const event = await Event.findOne({
            where:{
                id:req.params.id
            }
        })
        if(!event) return res.status(400).send("Event does not exist")
        if(event.userId !== req.user.id) return res.status(403).send("No access to the Event")
        if(req.body.name !== null && req.body.name.length !== 0){
            event.name=req.body.name
        }
        if(req.body.description !== null && req.body.description.length !== 0){
            event.description = req.body.description
        }
        if (req.body.name !== null && req.body.name.length !== 0 &&
            req.body.description !== null && req.body.description.length !== 0){
                await event.save({fields:['name','description']})
            }
        if (req.body.name !== null && req.body.name.length !== 0) {
            await event.save({ fields: ['name'] })
        }
        if (req.body.description !== null && req.body.description.length !== 0) {
            await event.save({ fields: ['description'] })
        }
        return res.status(204).send(event.dataValues)

    }catch(err){
        return res.status(500).send("Something went wrong please try again later.")
    }
}

const detailEvent = async(req,res) => {
    const event = await Event.findOne({
        where:{
            id:req.params.id
        },
        include: Member
    })
    if(!event) return res.status(404).send("Event does not exist")
    return res.status(200).send(event)
}

const createInvite = async(req,res) => {
    try{
        const { error } = validateCreateInvite(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        const event = await Event.findOne({
            where: {
                id: req.body.eventId
            },
            include: User
        })
        if (!event) return res.status(400).send("Event does not exist")
        const user = await User.findOne({
            where: {
                id: req.body.userId
            }
        })
        if (!user) return res.status(400).send("User does not exist")

        const newInvite = await Invite.create({
            eventId: req.body.eventId,
            userId: req.body.userId,
            status: false,
            owner: event.User.dataValues.email
        })
        return res.status(200).send(newInvite)
    }catch(err){
        return res.status(500).send(err)
    }

}

const acceptInvite = async(req,res) => {
    try{
        const invite = await Invite.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        })
        if (!invite) return res.status(400).send("Event could not be found");
        const newMember = await Member.create({
            eventId: invite.eventId,
            userId: req.user.id
        })
        await invite.destroy()
        return res.status(201).send(newMember)
    }catch(err){
        return res.status(500).send(err)
    }

}

const rejectInvite = async(req,res) => {
    try{
        const invite = await Invite.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        })
        if (!invite) return res.status(400).send("Event could not be found");
        await invite.destroy()
        return res.status(204).send("Reject success")
    }catch(err){
        return res.status(500).send(err)
    }
}

const searchEvents = async(req,res) => {
    try{
        const events = await Event.findAll({
            where:{
                name:{
                    [Op.like]: `${req.body.name}`
                }
            }
        })
        return res.status(200).send(events)
    }catch(err){
        return res.status(500).send(err)
    }

}

const paginateEvents = async(req,res) => {
    try{
        const events = await Event.findAll({ offset: req.query.page, limit: req.query.limit, order: [['createdAt', 'DESC']] })
        return res.status(200).send(events)
    }catch(err){
        return res.status(500).send(err)
    }
}

module.exports = { registerUser, authenticateUser, logoutUser, updatePassword,
    resetPassword, userEvents, createEvents, updateEvent, detailEvent, createInvite,
    acceptInvite,rejectInvite,searchEvents,paginateEvents }
