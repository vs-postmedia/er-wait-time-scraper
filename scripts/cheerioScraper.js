const cheerio = require('cheerio');
// import * as cheerio from 'cheerio';

async function cheerioScraper(html) {
	let data = {};
	const $ = cheerio.load(html);

	// set timestamp info
	const date = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
	data.timestamp = Date.now();
	data.date = date.split(',')[0];
	data.time = date.split(', ')[1];
	

	// do some scraping
	// Skip UPCCs that don't list wait times
	if ($('.CellcW').length > 0) return;
	// facility name
	data.facility_name = $('.CellfcW2 a').text();
	
	// facility type
	data.facility_time = data.facility_name.includes('Hospital') ? 'Hospital' : 'Clinic';

	// wait times
	const times = $('.Cell > p');
	data.wait_time = $(times[0]).text();
	data.stay_length = $(times[1]).text();
	
	// hospital status
	const src_text = $('.CellS img').attr('src');
	data.status = src_text.includes('check') ? 'Normal' : 'Overcrowded';

	data.timestamp = Date.now();

	return data;
}

function getDate() {
	const date = new Date();
}

module.exports = cheerioScraper;