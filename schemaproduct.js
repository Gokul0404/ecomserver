const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
    },
    type: {
      type: String,
    },
    price: {
      type: Number,
    },
    stocks: {
      type: Number,
    },
    img: {
      type: Array,
    },
    offer: {
      type:Array
    },
    allRatings: {
      type: Array,
    },
    reviews: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("productCollection", productSchema);
