const express = require("express");
const Upload = require("../models/Upload.model");
const router = express.Router();
const User = require("../models/User.model");
// const Upload = require("../models/Upload.model");
// const Comment = require("../models/Comment.model");
const uploadCloud = require("../config/cloudinary.config");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.get("/profile/:id", isAuthenticated, (req, res) => {
  const { id } = req.params;
  Upload.find()
    .populate([
      {
        path: "comments",
        model: "Comment",
        populate: {
          path: "owner",
          model: "User",
        },
      },
      { path: "likes", model: "User" },
    ])
    .then((response) => response.filter((item) => item.owner.toString() === id))
    .then((response) => res.status(200).json(response))
    .catch((err) => console.log(err));
});

router.post("/profile", uploadCloud.single("image"), (req, res, next) => {
  console.log("Editing Profile");
  const { userId, location, info, email, username } = req.body;
  const image = req.file ? req.file.path : req.body.image;
  const RegexTest = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  
  if (!RegexTest.test(email)) {
    res.status(400).json({ message: "Enter a valid email." });
    return;
  }

  User.updateOne(
    { _id: userId },
    {
      $set: {
        location: location,
        info: info,
        email: email,
        username: username,
        image: image,
      },
    }
  )
    .then((response) => {
      return User.findById(userId);
    })
    .then((response) => res.status(200).json(response))
    .catch((err) => console.log(err))
    // .then(async () => {
    //   let transporter = nodemailer.createTransport({
    //     service: "gmail",
    //     host: "smtp.gmail.com",
    //     port: 465,
    //     secure: true,
    //     auth: {
    //       user: "shharea.contact@gmail.com",
    //       pass: process.env.pass,
    //     },
    //   });
    //   let details = {
    //     from: "shharea.contact@gmail.com",
    //     to: email,
    //     subject: "Your SHH-AREA update",
    //     html: process.env.update_email,
    //   };
    //   transporter.sendMail(details, (err) => {
    //     if (err) {
    //       console.log("There was an error sending email", err);
    //     } else {
    //       console.log("Email has been sent");
    //     }
    //   });
    // })
    // .catch((error) => console.log(error));
});

router.get("/:id/details", isAuthenticated, (req, res) => {
  console.log("We can See User Details");
  const { id } = req.params;
  User.findById(id)
    .then((response) => res.status(200).json(response))
    .catch((err) => console.log(err));
});

// router.post("/:id/friends", (req, res) => {
//   console.log("processing friendship");

//   const { userId } = req.body;
//   const { id } = req.params;
//   let counter = 0;
//   console.log("counter ", counter);
//   User.findById(id)
//   .then((response) => {
//     response.friends.forEach((friend) => {
//       friend._id.toString() === userId ? counter++ : counter;
//     });

//     if (counter > 0) {
//       return res.status(400).json("message: already liked");
//     } else {
//       User.updateOne({ _id: id }, { $push: { friends: [userId] } })
//         .then((response) => res.status(200).json(response))
//         .catch((err) => console.log(err));
//     }
//   });
// });

module.exports = router;