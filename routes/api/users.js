/* eslint-disable no-unused-vars */
const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const {User} = require("../../model");
const {authenticate, upload} = require("../../middlewares");
const {NotFound, BadRequest} = require("http-errors");
const {sendEmail} = require("../../helpers");

const {SITE_NAME} = process.env;

const router = express.Router();

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");

router.get("/logout", authenticate, async(req, res) => {
    const {_id} = req.user;
    await User.findByIdAndUpdate(_id, {token: null});
    res.status(204).send();
});

router.get("/current", authenticate, async(req, res) => {
    const {name, email} = req.user;
    res.json({
        user: {
            name,
            email
        }
    })
});
router.post("/verify", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new BadRequest("missing required field email");

    const user = await User.findOne({ email });
    if (!user) throw new NotFound("User not found");

    const { verificationToken, verify } = user;
    if (verify) throw new BadRequest("Verification has already been passed");

    const data = {
      to: email,
      subject: "Подтверждение регистрации",
      html: `<a target="_blank" href="${SITE_NAME}/api/users/verify/${verificationToken}">Подтвердить email</a>`,
    };

    await sendEmail(data);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
});

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw new NotFound("User not found");
    }
    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });

    res.json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
});;

router.patch("/avatars", authenticate, upload.single("avatar"), async(req, res)=> {
    const {path: tempUpload, filename} = req.file;
    const [extension] = filename.split(".").reverse();
    const newFleName = `${req.user._id}.${extension}`;
    const fileUpload = path.join(avatarsDir, newFleName);
    
    const avatarURL = path.join("avatars", newFleName);
    await Jimp.read(tempUpload)
      .then((avatar) => {
        return avatar.resize(250, 250).write(tempUpload);
      })
      .catch((err) => {
        throw err;
      });
    await fs.rename(tempUpload, fileUpload);
    await User.findByIdAndUpdate(req.user._id, {avatarURL}, {new: true});
    res.json({avatarURL});
});

module.exports = router;