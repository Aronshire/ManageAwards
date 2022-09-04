/**@param {Number} length - The length of the random string. 
 * @returns {String} - A random string
 */
module.exports = global.randomId = (length) => {
	var result = "";
	var characters = "123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength)
		);
	}
	return result;
}