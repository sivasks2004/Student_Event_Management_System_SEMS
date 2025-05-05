const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Event = require('./models/Event'); // Assuming Event model is defined in models/Event.js

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sems', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Fetch events with filters
app.get('/view-events', async (req, res) => {
  const { email, year, symposiumName, college, interOrIntraEvent, position, fromDate, toDate } = req.query;

  let query = {};
  if (email) query.email = email;
  if (year) query.year = year;
  if (symposiumName) query.symposiumName = { $regex: symposiumName, $options: 'i' };
  if (college) query.college = { $regex: college, $options: 'i' };
  if (interOrIntraEvent) query.interOrIntraEvent = interOrIntraEvent;
  if (position) query.positionSecured = position;
  if (fromDate) query.eventDate = { ...query.eventDate, $gte: new Date(fromDate) };
  if (toDate) query.eventDate = { ...query.eventDate, $lte: new Date(toDate) };

  try {
    const events = await Event.find(query).sort({ eventDate: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});