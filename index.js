function calculateNumSegments(messageBodyText) {
  var maxCharsInSegment = 160;
  // Display one segment if message body length <  160
  var numSegments = Math.floor(messageBodyText.length / maxCharsInSegment);

  return numSegments;
}
