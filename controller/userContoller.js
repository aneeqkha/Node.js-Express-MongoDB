const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) create error if user pass password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update.Please use /updateMypassword.',
        404,
      ),
    );
  }

  //2) filter out unwanted fields
  const filteredBody = filterObj(req.body, 'name', 'email');
  // const { email, name } = req.body;
  if (filteredBody.email) {
    const existingUser = await User.findOne({ email: filteredBody.email });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return next(
        new AppError(
          'This email is already in use. Please choose a different one.',
          400,
        ),
      );
    }
  }

  // 3) update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    user: updateUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route does not exit',
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
//Do not update password using this.
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
