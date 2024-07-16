// Function to format UTC date time to local date time string with offset
export const formatLocalDateTime = (utcDateTimeString) => {

    if (!utcDateTimeString) {
        return ''; // Return empty string or any default value
    }
    // Create a Date object from the UTC datetime string
    const utcDate = new Date(utcDateTimeString);

    // Get the timezone offset in milliseconds
    const offsetMs = utcDate.getTimezoneOffset() * 60000;
    
    // Adjust the UTC date time with the offset to get the local date time
    const localDate = new Date(utcDate.getTime() - offsetMs);

    // Format the local date part
    const localDateString = localDate.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Format the local time part
    const localTimeString = localDate.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Format the local date time as a string
    const localDateTimeString = `${localDateString}, ${localTimeString}`;

    return localDateTimeString;
};
