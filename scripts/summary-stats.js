// LIBS
const T = require('@tidyjs/tidy');
const csv = require('csvtojson');


// FUNCTIONS
async function init(filepath) {
    // load raw data
    let data = await csv()
        .fromFile(filepath);

    // get today's date
    const today = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }).split(',')[0];
       
    // filter data
    data = data
        // sometimes facility name comes back undefined
        .filter(d => d.facility_name !== undefined)
        // we don't really care about urgent care centres
        // .filter(d => d.facility_type === 'Hospital');
        // we don't want data from current day, since it's incomplete
        .filter(d => d.date !== today);

    // convert HH:SS strings into minutes so we can do our maths...
    const mutated = T.tidy(
        data,
        T.mutate({
            'Hospital': d => d.facility_name.replace(' Hospital', ''),
            wait_time_mins: d => parseInt(d.wait_time.split(':')[0]) * 60 + parseInt(d.wait_time.split(':')[1]),
            stay_length_mins: d => parseInt(d.stay_length.split(':')[0]) * 60 + parseInt(d.stay_length.split(':')[1])
        })
    );

    // overall median times...
    let hospital_medians = T.tidy(
        mutated,
        T.groupBy('Hospital', [
            T.summarize({ 
                med_wait_time: T.median('wait_time_mins'),
                med_stay_length: T.median('stay_length_mins')
            })
        ]),
        // median times as HH:MM string
        // T.mutate({
        //     'Wait time': d => getDateString(d.med_wait_time),
        //     'Time until discharge': d => getDateString(d.med_stay_length)
        // }),
        // Fix bc childrens
        T.mutate({
            'Hospital': d => (d['Hospital'] === "BC Children's") ? 'B.C. Children’s' : d['Hospital']
        })
    );

    // daily median times...
    const daily_waits = T.tidy(
        mutated,
        T.groupBy(['Hospital', 'date'], [
            T.summarize({ 
                med_wait_time: T.median('wait_time_mins')
            })
        ])
    );

    // format daily wait times for flourish line chart
    const daily_median_waits = T.tidy(
        daily_waits,
        T.pivotWider({
            namesFrom: 'Hospital',
            valuesFrom: 'med_wait_time'
        })
    );

    // daily median stay length...
    const daily_stays = T.tidy(
        mutated,
        T.groupBy(['Hospital', 'date'], [
            T.summarize({ 
                daily_median_stays: T.median('stay_length_mins')
            })
        ])
    );

    // format daily stay lengths for flourish line chart
    const daily_median_stays = T.tidy(
        daily_stays,
        T.pivotWider({
            namesFrom: 'Hospital',
            valuesFrom: 'daily_median_stays'
        })
    );
    
    return {
        daily_median_waits: daily_median_waits,
        daily_median_stays: daily_median_stays,
        hospital_medians: hospital_medians
    };
}

function getDateString(x) {
    let dateString;

    if (x !== undefined) {
        dateString = new Date(x * 60 * 1000).toISOString().substring(11,5);
    }
    return dateString;
}

module.exports = init;

