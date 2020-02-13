function calculateLength() {
  var messageBody = document.getElementById("message");

  updateMessageLength(5);
  // listener to update the length text
}

function updateMessageLength(length) {
  // update the dom element
  var messageLengthText = document.getElementById("message-length");

  messageLengthText.appendChild = length;
}
