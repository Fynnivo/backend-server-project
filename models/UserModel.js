import mongoose from "mongoose";
import { uuid } from "uuidv4";

const User = mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    default: uuid,
  },
  name: {
    type: String,
    required: true,
    maxlength: 100,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter a valid email",
    ],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  customer_id: {
    type: String,
    default: null
  },
  payment_method: {
    type: String,
    default: null,
  },
  subscription_id: {
    type: String,
    default: null
  },
  subscription_status: {
    type: String,
    default: null
  },
  invoice_settings: {
    default_payment_method: {
      type: String,
      default: null,
    },
  },
});

export default mongoose.model("Users", User);
