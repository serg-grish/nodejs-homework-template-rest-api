const express = require('express');
const router = express.Router();

const {Contact} = require("../../model");
const {JoiSchema} = require("../../model/contact");


router.get('/', async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get('/:contactId', async (req, res, next) => {
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

router.post('/', async (req, res, next) => {
  try {
    const { error } = JoiSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'missing required name field' });
    }

    const contacts = await Contact.create(req.body);
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
