const mongoose = require("mongoose");
require("dotenv").config();

// DB schema for post, comments and reports
const instaSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  meta: {
    likes: {
      type: Number,
      default: 0,
    },
  },
  imageURI: {
    type: String,
    required: true,
  },
});
const commentSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
  name: String,
  comment: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});
const reportSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
  reports: {
    type: Number,
    default: 0,
  },
  lastReport: Date,
});

// Models
const Insta = mongoose.model("Insta", instaSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Report = mongoose.model("Report", reportSchema);

module.exports = { Insta, Comment, Report };
