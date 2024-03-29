function error_message(message) {
  return {
    success: false,
    message: message,
  };
}

function success_message(message) {
  return {
    success: true,
    message: message,
  };
}

function return_data(status, data) {
  return {
    success: status,
    data: data,
  };
}

function return_response(res, status, data) {
  return res.status(200).send({
    success: status,
    data: data,
  });
}

function success_response(res, data) {
  return res.status(200).send(data);
}

function error_response(res, data) {
  return res.status(400).send(data);
}

module.exports = {
  error_message,
  success_message,
  success_response,
  error_response,
  return_data,
  return_response,
};
