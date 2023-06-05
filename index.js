const fs = require('fs');
const path = require('path');
const axios = require('axios');
const saveData = require('./scripts/save-data');
const summaryStats = require('./scripts/summary-stats');
const cheerioScraper = require('./scripts/ed-wait-times');

// VARS
const data = [];
const urls = [];
const data_dir = 'data';
const filename = 'data';
const url_frag = 'http://edwaittimes.ca/Shared/Images/';
const facilities = require('./data/facility-list'); // list of hospitals & UPCCs



/***  FUNCTIONS  ***/
async function init() {
	// build our url list
	facilities.forEach(d => urls.push(`${url_frag}${d}.html`));

	// download HTML & save
	await downloadHTML(urls);
}

async function downloadHTML(urls) {
	let html, results;
	
	// get first url in the list
	const url = urls.shift();

	// fetch html
	console.log(`Downloading HTML from ${url}...`);
	html = await axios.get(url);

	// scrape html
	results = await cheerioScraper(html.data);
	// some UPCCs don't show wait times. skip those
	if (results !== undefined) data.push(results);

	// if there's more links, let's do it again!
	if (urls.length > 0) {
		// download the html
		downloadHTML(urls);
	} else {
		console.log("Saving data...")
		await saveData(data, path.join(__dirname, `${data_dir}/${filename}`), 'csv', false);
		
		// get summary stats
		saveSummaryStats();
	}
}

async function saveSummaryStats() {
	// get summary stats for charting, etc.
	const stats = await summaryStats('./data/data.csv');
		
	// overall hospital medians
	saveData(stats.hospital_medians, path.join(__dirname, `${data_dir}/hospital-medians`), 'csv', true);
	
	// daily medians for each facility
	saveData(stats.daily_medians, path.join(__dirname, `${data_dir}/daily-medians`), 'csv', true);
}

// kick isht off!!!
init();

