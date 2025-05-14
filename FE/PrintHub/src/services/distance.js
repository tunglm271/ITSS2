import axios from 'axios';

const MAP_API_URL = process.env.MAP_API_URL;

if (!MAP_API_URL) {
  console.error('Error: REACT_APP_MAP_API_URL is not defined in the environment variables.');
}

async function getDistance(start, end) {
  const body = {
    locations: [
      { lat: start.lat, lon: start.lon },
      { lat: end.lat, lon: end.lon },
    ],
    costing: "auto",
    directions_options: { units: "kilometers" },
  };

  const fetchDistance = async () => {
    try {
      const res = await axios.post(`${MAP_API_URL}/route`, body);
      const { length, time } = res.data.trip.summary;
      return { distance: length, time };
    } catch (error) {
      console.error('Error fetching distance from map server:', error.message);
      return { distance: 'Error fetching distance', time: 'Error fetching time' };
    }
  };

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out after 2 seconds')), 2000)
  );

  try {
    return await Promise.race([fetchDistance(), timeout]);
  } catch (error) {
    if (error.message === 'Request timed out after 2 seconds') {
      console.error('Error: The request timed out.');
    } else {
      console.error('Unexpected error:', error.message);
    }
    return { distance: 'timeout', time: 'timeout' };
  }
}

export default getDistance;