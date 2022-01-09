const {Schema, model} = require("mongoose");

const contactSchema = Schema({
  name: {
    type: String,
    required: [true, 'Set name for contact'],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
  }
});

const Contact = model("contact", contactSchema);

const Joi = require("joi");
const JoiSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: true } })
    .required(),
  phone: Joi.string().required(),
  favorite: Joi.bool,
});

module.exports = {
  Contact,
  JoiSchema,
};
