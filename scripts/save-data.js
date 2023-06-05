const fs = require('fs');
let Parser = require('@json2csv/plainjs').Parser;

async function saveData(data, filepath, format, headers) {
	console.log(`Saving data to ${filepath}`);

	// save file locally
	if (format === 'json') {
		try {
			fs.writeFileSync(`${filepath}.${format}`, JSON.stringify(data));
		} catch (err) {
			console.error(err);
		}
	} else {
		try {
			const parser = new Parser({
				header: headers, // headers? not great if we're appending data over time...
				withBOM: false // this should be true if you want emojiis to work...
			});

			// we want to append scraped data but overwrite summary stat files
			const options = (headers === true) ? { flag: 'w'} : { flag: 'a'};

			// write data
			fs.writeFileSync(`${filepath}.${format}`, parser.parse(data), options);
			
			// we need a new line at the end for future appends
			if (headers === false) {
				fs.writeFileSync(`${filepath}.${format}`, `\r\n`, options);
			}
		} catch (err) {
			console.error(err);
		}
	}
}


module.exports = saveData;