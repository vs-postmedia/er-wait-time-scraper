// LIBS
const T = require('@tidyjs/tidy');
const csv = require('csvtojson');


// FUNCTIONS
async function init(filepath) {
    // load raw data
    const data = await csv().fromFile(filepath);

    // convert HH:SS strings into minutes so we can do our maths...
    const mutated = T.tidy(
        data,
        T.mutate({
            wait_time_mins: d => parseInt(d.wait_time.split(':')[0]) * 60 + parseInt(d.wait_time.split(':')[1]),
            stay_length_mins: d => parseInt(d.stay_length.split(':')[0]) * 60 + parseInt(d.stay_length.split(':')[1])
        })
    );

    // overall median times...
    const hospital_medians = T.tidy(
        mutated,
        T.groupBy('facility_name', [
            T.summarize({ 
                med_wait_time: T.median('wait_time_mins'),
                med_stay_length: T.median('stay_length_mins')
            })
        ])
    );

    // daily median times...
    const daily_medians = T.tidy(
        mutated,
        T.groupBy(['facility_name', 'date'], [
            T.summarize({ 
                med_wait_time: T.median('wait_time_mins'),
                med_stay_length: T.median('stay_length_mins')
            })
        ])
    );

    
    return {
        daily_medians: daily_medians,
        hospital_medians: hospital_medians
    };
}

module.exports = init;

