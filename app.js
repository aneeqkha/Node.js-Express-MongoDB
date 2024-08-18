const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1)Global midalware

//Serving static file
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//Set security http header
app.use(helmet());

// Development loggin
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit request for samr api
const limiter = rateLimit({
  max: 100,
  windowms: 60 * 60 * 1000,
  message: 'to many request from this api please try again in an hour.',
});
app.use('/api', limiter);

//Body parser, adding data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitaization against NOSQL query injection
app.use(mongoSanitize());

//Data sanitaization against XSS
app.use(xss());

// Prevent parameter solution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'price',
      'difficulty',
      'maxGroupSize',
    ],
  }),
);

app.use((req, res, next) => {
  req.setTimeout = new Date().toISOString();
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can,t find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
