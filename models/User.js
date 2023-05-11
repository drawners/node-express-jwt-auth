const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please Enter an Email"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please Enter a Valid email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter a Password"],
    minlength: [6, "Minimum password Length is 6 characters"],
  },
});

//fire a function after a doc saved to Db
// userSchema.post("save", function (doc, next) {
//   console.log("new user was created & saved", doc);
//   next();
// });

//fire a function before doc saved to db
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  // console.log("user about to be created and saved", this);
  next();
});

//static method to login user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("Incorrect Password");
  }
  throw Error("Incorrect Email");
};

const User = mongoose.model("user", userSchema);
module.exports = User;
