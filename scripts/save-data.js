const fs = require('fs');
let Parser = require('@json2csv/plainjs').Parser;

async function saveData(data, filepath, format, data_dir) {
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
				header: false, // headers? not great if we're appending data over time...
				withBOM: false // this should be true if you want emojiis to work...
			});

			fs.writeFileSync(`${filepath}.${format}`, parser.parse(data), { flag: 'a'});
			// we need a new line at the end for future appends
			fs.writeFileSync(`${filepath}.${format}`, `\r\n`, { flag: 'a'});
		} catch (err) {
			console.error(err);
		}
	}
}


module.exports = saveData;