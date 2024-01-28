export function shortenText(text) {
    if (text.length > 6) {
        // Extract the first three characters
        var firstThree = text.substring(0, 3);
        
        // Extract the last three characters
        var lastThree = text.substring(text.length - 3);
        
        // Concatenate the results with ellipsis
        var result = firstThree + '...' + lastThree;
        
        return result;
    } else {
        // If the string is short, simply return it as is
        return text;
    }
}