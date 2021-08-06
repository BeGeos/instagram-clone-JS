const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");

const path = require("path");
const fs = require("fs");

// Upload folder for insta pics
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 1000000,
  },
});

const { Insta, Comment, Report } = require("./models");

app = express();

// DB setup and connection
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("Connected to DB!")
);

// Middlewares
app.use(morgan("common"));
app.use(express.json());
// app.use("/photos", express.static(__dirname + "/uploads"));
app.use(cors());

function uploadFile(req, res, next) {
  let file = upload.single("insta");

  file(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400);
      res.json({ error: err });
    } else if (err) {
      res.status(err.status);
      res.json({ error: err });
    } else {
      next();
    }
  });
}

const port = process.env.PORT || 3000;

// Helper functions
function isValidInstaForm(form) {
  return form.name && form.description;
}

function isValidComment(comment) {
  return comment.name && comment.comment;
}

// Routes for insta Model
app.get("/api/insta", async (req, res) => {
  // TODO query parameter for skip argument. Load 3 by 3 when scrolling on frontend
  let step = parseInt(req.query.skip);
  let limit = parseInt(req.query.limit);
  try {
    let data = await Insta.find({})
      .skip(step)
      .sort({ createdOn: "desc" })
      .limit(limit)
      .exec();
    res.status(200);
    let total = await Insta.countDocuments({}).exec();
    if (step > total) {
      res.json({ data, meta: [] });
    } else {
      res.json({
        data,
        meta: {
          count: data.length,
          total,
          remaining: total - step - 1 || total,
        },
      });
    }
  } catch (err) {
    res.json({ error: err });
  }
});

app.post("/api/create-insta", uploadFile, (req, res) => {
  if (isValidInstaForm(req.body) && req.file) {
    let author = req.body.name;
    let description = req.body.description;
    let imageURI = req.file.filename;

    Insta.create(
      {
        author,
        description,
        imageURI,
      },
      (err, insta) => {
        if (err) {
          res.json({ error: err });
        } else {
          Report.create(
            {
              postId: insta._id,
              lastReport: new Date().toString(),
            },
            (err) => {
              if (err) {
                console.log(err);
                return;
              }
            }
          );
          res.json({ insta });
        }
      }
    );
    // res.json("received");
  } else {
    res.status(422);
    res.json({ error: "Bad request" });
  }
  // res.json("received");
});

app.get("/api/photos/:filename", (req, res) => {
  let filename = req.params.filename;

  let filePath = path.join(__dirname, `/uploads/${filename}`);

  fs.readFile(filePath, (err, file) => {
    if (err) {
      res.json({ error: "No file found" });
    } else {
      res.set("Content-Type", "image/png");
      res.set("X-Content-Type-Options", "nosniff");
      res.send(file);
    }
  });
});

// Add likes to post
app.put("/api/likes/:id", (req, res) => {
  let _id = req.params.id;
  Insta.findById(_id, (err, insta) => {
    if (err) {
      res.json({ error: err });
    } else {
      insta.meta.likes += 1;
      insta.save((err) => {
        if (err) {
          res.json({ error: err });
        } else {
          res.status(200);
          res.json({ insta });
        }
      });
    }
  });
});

app.delete("/api/delete-all", async (req, res) => {
  let deletion = await Insta.deleteMany({});
  // console.log(deletion);
  res.json({ deleted: deletion.deletedCount });
});

// Routes for comment Model
app.get("/api/comment/:postId", (req, res) => {
  let _postId = req.params.postId;
  Comment.find({ postId: _postId }, (err, comments) => {
    if (err) {
      res.json({ error: err });
    } else {
      res.json({ comments });
    }
  });
});

app.post("/api/comment/:postId", (req, res) => {
  let postId = req.params.postId;
  Insta.exists({ _id: postId }, (err, value) => {
    // console.log(value);
    if (err) {
      res.status(404);
      res.json({ error: err });
    } else if (value && isValidComment(req.body)) {
      let name = req.body.name;
      let comment = req.body.comment;

      Comment.create(
        {
          name,
          comment,
          postId,
        },
        (err, comment) => {
          if (err) {
            res.json({ error: err });
          } else {
            res.json({ comment });
          }
        }
      );
    } else {
      res.json({ error: "Arguments required" });
    }
  });
});

// Report Routes
app.put("/api/report/:postId", (req, res) => {
  let _postId = req.params.postId;
  Report.find({ postId: _postId }, (err, report) => {
    if (err) {
      res.json({ error: err });
    } else {
      // console.log(report);
      report[0].reports += 1;
      report[0].lastReport = new Date().toString();
      report[0].save((err) => {
        if (err) {
          res.json({ error: err });
        } else {
          res.json({ report });
        }
      });
    }
  });
});

app.get("/api/report/:postId", (req, res) => {
  // Report.find({}, (err, reports) => {
  //   if (err) {
  //     res.json({ error: err });
  //   } else {
  //     res.json({ reports });
  //   }
  // });
  let _postId = req.params.postId;
  Report.find({ postId: _postId }, (err, report) => {
    if (err) {
      res.json({ error: err });
    } else {
      res.json({ report });
    }
  });
});

// TODO validation frontend and backend for input and request

app.listen(port, () => console.log(`Listening on port ${port}`));
