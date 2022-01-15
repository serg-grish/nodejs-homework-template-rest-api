const express = require('express');
const router = express.Router();

const {authenticate} = require("../../middlewares");
const {Contact} = require("../../model");
const {JoiSchema} = require("../../model/contact");


router.get('/', authenticate, async (req, res, next) => {
  try {
    const {page = 1, limit = 10} = req.query;
    const {_id} = req.user;
    const skip = (page - 1) * limit;
    const contacts = await Contact.find({owner: _id}, "-createdAt -updatedAt", {skip, limit: +limit});
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get('/:contactId', authenticate, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contacts = await Contact.findById(contactId);
    if (!contacts) {
      return res.status(404).json({ message: 'Not found', code: 404 });
    }
    res.json(contacts);
  } catch (error) {
    if (error.message.includes('Cast of Object failed')) {
      error.status = 404;
    }
    next(error);
  }
});

router.post("/", authenticate, async(req, res, next)=> {
  // console.log(req.user);
  try {
    const {error} = JoiSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'missing required name field' });
    }
    const {_id} = req.user;
    const contacts = await Contact.create({...req.body, owner: _id});
    res.status(201).json({ contacts });
  } catch (error) {
    if (error.message.includes('validation failed')) {
      error.status = 400;
    }
    next(error);
  }
});

router.delete('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contacts = await Contact.findByIdAndRemove(contactId);
    if (!contacts) {
      return res.status(404).json({ message: 'Not found', code: 404 });
    }
    res.json(contacts);
  } catch (error) {
    if (error.message.includes('Cast of Object failed')) {
      error.status = 404;
    }
    next(error);
  }
});

router.put('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  const { error } = JoiSchema.validate(req.body);
  try {
    if (error) {
      return res.status(400).json({ message: 'missing fields' });
    }
    const updateContacts = await Contact.findByIdAndUpdate(
      contactId,
      req.body, {
        new: true,
      });
    if (!updateContacts) {
      return res.status(404).json({ message: 'Not found', code: 404 });
    }
    res.json(updateContacts);
  } catch (error) {
    if (error.message.includes('Cast to Object failed')) {
      error.status = 404;
    }
    next(error);
  }
});


router.patch('/:id/favorite', async (req, res, next) => {
  const { id } = req.params;
  const { favorite } = req.body;
  const { error } = JoiSchema.validate(req.body);
  try {
    if (error) {
      return res.status(400).json({ message: 'missing field favorite' });
    }
    const updateContacts = await Contact.findByIdAndUpdate(
      id,
      { favorite },
      {
        new: true,
      },
    );
    if (!updateContacts) {
      return res.status(404).json({ message: 'Not found', code: 404 });
    }
    res.json(updateContacts);
  } catch (error) {
    if (error.message.includes('Cast to Object failed')) {
      error.status = 404;
    }

    next(error);
  }
});

module.exports = router;
