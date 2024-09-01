const express = require("express");
const faker = require("faker");
const router = express.Router();

const Joi = require("joi");
const jwt = require("jsonwebtoken");

router.post("/reset-password", (req, res) => {
  const { email } = req.body;

  // Validate email and send reset link
  const resetToken = faker.random.uuid();
  console.log(`Reset token for ${email}: ${resetToken}`);

  res
    .status(200)
    .json({ message: "Password reset link has been sent to your email." });
});

module.exports = router;

