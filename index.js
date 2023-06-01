const fs = require('fs');
const path = require('path');
const axios = require('axios');
const saveData = require('./scripts/save-data');
const cheerioScraper = require('./scripts/cheerioScraper');
const facilities = require('./data/facility-list');

// VARS
const data = [];
const urls = [];
const data_dir = 'data';
// const tmp_data_dir = 'tmp-data';
const filename = 'data'; // temp file for data
const url_frag = 'http://edwaittimes.ca/Shared/Images/';



async function init() {
	// build our url list
	facilities.forEach(d => urls.push(`${url_frag}${d}.html`));

	// download HTML & save
	downloadHTML(urls);
}

async function downloadHTML(urls) {
	let html; let results;
	// get first url in the list
	const url = urls.shift();

	console.log(`Downloading HTML from ${url}...`);
	// fetch html
	html = await axios.get(url);

	// scrape html
	results = await cheerioScraper(html.data);
	// some UPCCs don't show wait times. skip those
	if (results !== undefined) data.push(results);

	// if there's more links, let's do it again!
	if (urls.length > 0) {
		console.log('Downloading next url...');
		
		// download the html
		downloadHTML(urls);
	} else {
		console.log("Saving data...")
		saveData(data, path.join(__dirname, `${data_dir}/${filename}`), 'csv');
	}
}

// kick isht off!!!
init(); // set 'useCheerio' to false to run puppeteer

