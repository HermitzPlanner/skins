export function getCharObject(char, charData) {

    for (const key in charData) {
        if (charData[key].appellation === char) {
            extraProperties(charData[key])
            return charData[key]; // Return the matching object
        }
    }
    console.error(char)
    return null; // Return null if no match is found
}