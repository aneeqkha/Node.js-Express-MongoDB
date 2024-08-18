const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
const connection = async () => {
  await mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  // .then((con) => {
  //   console.log('connection is establish successfully');
  // });
};
connection();

const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));
const review = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf8'));

const importData = async () => {
  try {
    await Tour.create(tour);
    await User.create(user, { validateBeforeSave: false });
    await Review.create(review);
    console.log('Data successfully loaded');
  } catch (error) {
    console.log(error);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
