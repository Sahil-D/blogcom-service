const httpStatus = require('http-status');

const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next)
    .then((response) => {
      const result = {
        status: response.status || 'success',
      };

      if (response.data !== undefined) {
        result.data = response.data;
      }
      if (response.error !== undefined) {
        result.error = response.error;
      }
      if (response.code !== undefined) {
        result.code = response.code;
      }
      res.status(response.statusCode || httpStatus.OK).send(result);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = catchAsync;
