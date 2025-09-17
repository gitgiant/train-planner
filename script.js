document.addEventListener('DOMContentLoaded', () => {
    const southboundTrains = [
        { departure: '5:23a', arrival: '5:50a' },
        { departure: '6:03a', arrival: '6:30a' },
        { departure: '6:43a', arrival: '7:10a' },
        { departure: '7:23a', arrival: '7:50a' },
        { departure: '7:43a', arrival: '8:10a' },
        { departure: '9:43a', arrival: '10:10a' },
        { departure: '11:43a', arrival: '12:10p' },
        { departure: '1:43p', arrival: '2:10p' },
        { departure: '2:43p', arrival: '3:10p' },
        { departure: '3:43p', arrival: '4:10p' },
        { departure: '4:23p', arrival: '4:50p' },
        { departure: '4:43p', arrival: '5:10p' },
        { departure: '5:23p', arrival: '5:50p' },
        { departure: '6:23p', arrival: '6:50p' },
        { departure: '7:43p', arrival: '8:10p' },
        { departure: '9:23p', arrival: '9:50p' },
    ];

    const northboundTrains = [
        { departure: '7:09a', arrival: '7:37a' },
        { departure: '8:09a', arrival: '8:37a' },
        { departure: '8:49a', arrival: '9:17a' },
        { departure: '9:09a', arrival: '9:37a' },
        { departure: '9:49a', arrival: '10:17a' },
        { departure: '11:49a', arrival: '12:17p' },
        { departure: '1:49p', arrival: '2:17p' },
        { departure: '4:09p', arrival: '4:37p' },
        { departure: '4:49p', arrival: '5:17p' },
        { departure: '5:49p', arrival: '6:17p' },
        { departure: '6:09p', arrival: '6:37p' },
        { departure: '6:49p', arrival: '7:17p' },
        { departure: '7:09p', arrival: '7:37p' },
        { departure: '8:09p', arrival: '8:37p' },
        { departure: '9:49p', arrival: '10:17p' },
        { departure: '12:09a', arrival: '12:37a' },
    ];

    const southboundSelect = document.getElementById('southbound-trains');
    const northboundSelect = document.getElementById('northbound-trains');

    function populateTrains(selectElement, trains) {
        trains.forEach(train => {
            const option = document.createElement('option');
            option.value = JSON.stringify(train);
            option.textContent = train.departure;
            selectElement.appendChild(option);
        });
    }

    populateTrains(southboundSelect, southboundTrains);
    populateTrains(northboundSelect, northboundTrains);

    function parseTime(timeStr) {
        // First, try to parse times like "12:10 PM" (from formatTime)
        let match = timeStr.match(/(\d+):(\d+)\s(AM|PM)/i);

        // If that fails, try to parse the initial format like "12:10p"
        if (!match) {
            match = timeStr.match(/(\d+):(\d+)([ap])/i);
        }

        if (!match) return null;

        let [, hours, minutes, modifier] = match;
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        modifier = modifier.toLowerCase();

        if (modifier.startsWith('p') && hours < 12) {
            hours += 12;
        }
        if (modifier.startsWith('a') && hours === 12) { // Midnight case
            hours = 0;
        }

        const date = new Date(2000, 0, 1, hours, minutes, 0, 0);
        return date;
    }

    function formatTime(date) {
        if (!date) return '--:--';
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    function addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes * 60000);
    }

    function updateSouthboundTimes() {
        const selectedSouthbound = southboundSelect.value ? JSON.parse(southboundSelect.value) : null;

        if (selectedSouthbound) {
            const southboundDeparture = parseTime(selectedSouthbound.departure);
            const southboundArrival = parseTime(selectedSouthbound.arrival);
            const shuttleArrival = addMinutes(southboundArrival, 15);
            const departureHomeTime = addMinutes(southboundDeparture, -20);

            document.getElementById('southbound-arrival').textContent = formatTime(southboundArrival);
            document.getElementById('shuttle-arrival').textContent = formatTime(shuttleArrival);
            document.getElementById('departure-home-time').textContent = formatTime(departureHomeTime);
            document.getElementById('office-arrival-time').textContent = formatTime(shuttleArrival);
        } else {
            document.getElementById('southbound-arrival').textContent = '--:--';
            document.getElementById('shuttle-arrival').textContent = '--:--';
            document.getElementById('departure-home-time').textContent = '--:--';
            document.getElementById('office-arrival-time').textContent = '--:--';
        }
    }

    function filterNorthboundTrains() {
        const selectedSouthbound = southboundSelect.value ? JSON.parse(southboundSelect.value) : null;
        let southboundArrivalTime = null;
        if (selectedSouthbound) {
            southboundArrivalTime = parseTime(selectedSouthbound.arrival);
        }

        for (let i = 1; i < northboundSelect.options.length; i++) {
            const option = northboundSelect.options[i];
            if (southboundArrivalTime) {
                const northboundTrain = JSON.parse(option.value);
                const northboundDepartureTime = parseTime(northboundTrain.departure);
                option.disabled = northboundDepartureTime < southboundArrivalTime;
            } else {
                option.disabled = false;
            }
        }

        if (northboundSelect.options[northboundSelect.selectedIndex].disabled) {
            northboundSelect.selectedIndex = 0;
        }
    }

    function updateNorthboundAndSummaryTimes() {
        const selectedNorthbound = northboundSelect.value ? JSON.parse(northboundSelect.value) : null;
        const officeArrivalTimeText = document.getElementById('office-arrival-time').textContent;

        if (selectedNorthbound) {
            const northboundDeparture = parseTime(selectedNorthbound.departure);
            const northboundArrival = parseTime(selectedNorthbound.arrival);
            const timeHome = addMinutes(northboundArrival, 15);
            const requestShuttleTime = addMinutes(northboundDeparture, -20);

            document.getElementById('northbound-arrival').textContent = formatTime(northboundArrival);
            document.getElementById('time-home').textContent = formatTime(timeHome);
            document.getElementById('request-shuttle-time').textContent = formatTime(requestShuttleTime);
            document.getElementById('request-shuttle-time-summary').textContent = formatTime(requestShuttleTime);

            if (officeArrivalTimeText !== '--:--') {
                const officeArrivalDate = parseTime(officeArrivalTimeText);
                let timeInOfficeMilliseconds = requestShuttleTime - officeArrivalDate;

                // Handle overnight case
                if (requestShuttleTime < officeArrivalDate) {
                    timeInOfficeMilliseconds += 24 * 60 * 60 * 1000; // Add a day
                }

                if (timeInOfficeMilliseconds > 0) {
                    const timeInOfficeHours = Math.floor(timeInOfficeMilliseconds / 3600000);
                    const timeInOfficeMinutes = Math.round((timeInOfficeMilliseconds % 3600000) / 60000);
                    document.getElementById('time-in-office').textContent = `${timeInOfficeHours} hours ${timeInOfficeMinutes} minutes`;
                } else {
                     document.getElementById('time-in-office').textContent = 'Invalid Selection';
                }
            } else {
                document.getElementById('time-in-office').textContent = '--:--';
            }

        } else {
            document.getElementById('northbound-arrival').textContent = '--:--';
            document.getElementById('time-home').textContent = '--:--';
            document.getElementById('request-shuttle-time').textContent = '--:--';
            document.getElementById('request-shuttle-time-summary').textContent = '--:--';
            document.getElementById('time-in-office').textContent = '--:--';
        }
    }

    southboundSelect.addEventListener('change', () => {
        updateSouthboundTimes();
        filterNorthboundTrains();
        updateNorthboundAndSummaryTimes();
    });

    northboundSelect.addEventListener('change', updateNorthboundAndSummaryTimes);

    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
        document.getElementById('datetime').textContent = now.toLocaleDateString('en-US', options);
        updateNextTrains();
    }

    function updateNextTrains() {
        const now = new Date();
        const nowTime = now.getHours() * 60 + now.getMinutes();

        const findNextTrain = (trains) => {
            for (const train of trains) {
                const trainTime = parseTime(train.departure);
                const trainMinutes = trainTime.getHours() * 60 + trainTime.getMinutes();
                if (trainMinutes > nowTime) {
                    return train.departure;
                }
            }
            return trains[0].departure; // If no more trains today, show the first one for the next day
        };

        const nextSouthbound = findNextTrain(southboundTrains);
        const nextNorthbound = findNextTrain(northboundTrains);

        document.getElementById('next-trains').textContent = 
            `Next Southbound: ${nextSouthbound} | Next Northbound: ${nextNorthbound}`;
    }

    setInterval(updateDateTime, 1000);
    updateDateTime(); // Initial call
});