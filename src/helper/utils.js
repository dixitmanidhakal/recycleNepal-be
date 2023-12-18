const mongoose = require("mongoose");

const createResponse = (
  res,
  status,
  message,
  responseData,
  responseDataKeyName = "data"
) => {
  const response = {
    status,
    message,
  };

  response[responseDataKeyName] = responseData;

  return res.status(status).json(response);
};

const getObjectId = (id) => {
  return new mongoose.Types.ObjectId(id);
};

module.exports = {
  createResponse,
  getObjectId,
};
