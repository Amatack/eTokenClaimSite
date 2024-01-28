function addDot(number, position) {
    // Convert the number to a string to work with characters
    let numberString = number.toString();
  
    // Get the length of the number
    let length = numberString.length;
  
    // Calculate the position from the right
    let positionFromRight = length - position;
  
    // Check if the position is valid
    if (positionFromRight > 0 && positionFromRight < length) {
      // Insert the dot at the appropriate position
      let result = numberString.slice(0, positionFromRight) + "." + numberString.slice(positionFromRight);
  
      return result;
    } else {
      // The provided position is not valid
      console.error("The provided position is not valid");
      return number;
    }
  }

module.exports.addDot = addDot;