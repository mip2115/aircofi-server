class CustomError extends Error {}

class UserNotActiveError extends Error {}

// just do miles from zipcode
class NoLocationError extends Error {}

class UserNotVisible extends Error {}

class UserNotVerified extends Error {}

class UserNotFoundError extends Error {}

module.exports = {
  CustomError,
  UserNotActiveError,
  NoLocationError,
  UserNotVisible,
  UserNotVerified,
  UserNotFoundError
};
