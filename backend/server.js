const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kirinyaga_super_league';
const JWT_SECRET = process.env.JWT_SECRET || 'kirinyaga_super_secret_key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// --- MONGOOSE SCHEMAS & MODELS ---

// 1. Team Schema
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  town: { type: String, required: true },
  logo: { type: String, default: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=300' },
  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  drawn: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },
  gf: { type: Number, default: 0 },
  ga: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

// 2. Match Schema
const matchSchema = new mongoose.Schema({
  gameweek: { type: Number, required: true },
  homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  date: { type: String, required: true },
  venue: { type: String, required: true },
  status: { type: String, enum: ['Upcoming', 'Completed'], default: 'Upcoming' }
}, { timestamps: true });

const Match = mongoose.model('Match', matchSchema);

// 3. League Info Schema
const leagueInfoSchema = new mongoose.Schema({
  about: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true }
}, { timestamps: true });

const LeagueInfo = mongoose.model('LeagueInfo', leagueInfoSchema);


// --- AUTHENTICATION MIDDLEWARE ---
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Admin access required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'admin') {
      req.user = decoded;
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Admin access only' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired authentication token' });
  }
};


// --- API ROUTES ---

// 1. ADMIN LOGIN
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ success: true, token, message: 'Authenticated successfully' });
  }
  return res.status(401).json({ success: false, message: 'Invalid admin password' });
});


// 2. TEAMS ENDPOINTS
// Get all teams (Sorted by Points -> Goal Difference -> Goals For)
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find({});
    // Dynamic Sorting for Standing Table
    teams.sort((a, b) => {
      const gdA = a.gf - a.ga;
      const gdB = b.gf - b.ga;
      if (b.points !== a.points) return b.points - a.points;
      if (gdB !== gdA) return gdB - gdA;
      return b.gf - a.gf;
    });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new team (Admin Protected)
app.post('/api/teams', verifyAdmin, async (req, res) => {
  try {
    const { name, town, logo } = req.body;
    const team = new Team({
      name,
      town: town || 'Kirinyaga',
      logo: logo || undefined
    });
    await team.save();
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// 3. MATCHES & FIXTURES ENDPOINTS
// Get all matches
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find({})
      .populate('homeTeam', 'name logo town')
      .populate('awayTeam', 'name logo town')
      .sort({ createdAt: -1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create match fixture (Admin Protected)
app.post('/api/matches', verifyAdmin, async (req, res) => {
  try {
    const { gameweek, homeTeam, awayTeam, date, venue } = req.body;
    const match = new Match({
      gameweek: Number(gameweek),
      homeTeam,
      awayTeam,
      date,
      venue
    });
    await match.save();
    const populatedMatch = await Match.findById(match._id)
      .populate('homeTeam', 'name logo town')
      .populate('awayTeam', 'name logo town');
    res.status(201).json(populatedMatch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update match score & automatically recalculate team standings (Admin Protected)
app.put('/api/matches/:id/score', verifyAdmin, async (req, res) => {
  try {
    const { homeScore, awayScore } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const homeVal = Number(homeScore);
    const awayVal = Number(awayScore);

    // If match was previously upcoming, update team standings
    if (match.status === 'Upcoming') {
      const homeTeam = await Team.findById(match.homeTeam);
      const awayTeam = await Team.findById(match.awayTeam);

      if (homeTeam && awayTeam) {
        const homeWin = homeVal > awayVal;
        const draw = homeVal === awayVal;
        const awayWin = awayVal > homeVal;

        // Update Home Team Stats
        homeTeam.played += 1;
        homeTeam.gf += homeVal;
        homeTeam.ga += awayVal;
        if (homeWin) { homeTeam.won += 1; homeTeam.points += 3; }
        else if (draw) { homeTeam.drawn += 1; homeTeam.points += 1; }
        else { homeTeam.lost += 1; }
        await homeTeam.save();

        // Update Away Team Stats
        awayTeam.played += 1;
        awayTeam.gf += awayVal;
        awayTeam.ga += homeVal;
        if (awayWin) { awayTeam.won += 1; awayTeam.points += 3; }
        else if (draw) { awayTeam.drawn += 1; awayTeam.points += 1; }
        else { awayTeam.lost += 1; }
        await awayTeam.save();
      }
    }

    match.homeScore = homeVal;
    match.awayScore = awayVal;
    match.status = 'Completed';
    await match.save();

    const updatedMatch = await Match.findById(match._id)
      .populate('homeTeam', 'name logo town')
      .populate('awayTeam', 'name logo town');

    res.json(updatedMatch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// 4. LEAGUE INFO ENDPOINTS
// Get league info
app.get('/api/info', async (req, res) => {
  try {
    let info = await LeagueInfo.findOne();
    if (!info) {
      info = await LeagueInfo.create({
        about: 'The Kirinyaga South Super League is the premier grassroots football championship in Kirinyaga South Sub-County.',
        location: 'Kirinyaga South Sub-County Stadium & Regional Pitches, Central Kenya',
        phone: '+254 712 345 678',
        email: 'info@kirinyagasouthleague.co.ke',
        address: 'P.O. Box 45 - Wang\'uru, Kirinyaga County'
      });
    }
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update league info (Admin Protected)
app.put('/api/info', verifyAdmin, async (req, res) => {
  try {
    const { about, location, phone, email, address } = req.body;
    let info = await LeagueInfo.findOne();
    if (!info) {
      info = new LeagueInfo({ about, location, phone, email, address });
    } else {
      info.about = about || info.about;
      info.location = location || info.location;
      info.phone = phone || info.phone;
      info.email = email || info.email;
      info.address = address || info.address;
    }
    await info.save();
    res.json(info);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// --- INITIAL DATABASE SEEDING FUNCTION ---
const seedInitialData = async () => {
  const count = await Team.countDocuments();
  if (count === 0) {
    console.log('🌱 Database empty! Seeding 14 initial teams for Kirinyaga South Super League...');
    const INITIAL_TEAMS = [
      { name: 'Kerugoya Stars FC', played: 10, won: 7, drawn: 2, lost: 1, gf: 22, ga: 8, points: 23, logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=300', town: 'Kerugoya' },
      { name: 'Sagana United', played: 10, won: 6, drawn: 3, lost: 1, gf: 19, ga: 9, points: 21, logo: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&q=80&w=300', town: 'Sagana' },
      { name: 'Wang\'uru Warriors', played: 10, won: 6, drawn: 2, lost: 2, gf: 18, ga: 10, points: 20, logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=300', town: 'Wang\'uru' },
      { name: 'Mwea Rice Strikers', played: 10, won: 5, drawn: 4, lost: 1, gf: 15, ga: 7, points: 19, logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=300', town: 'Mwea' },
      { name: 'Makutano Heroes', played: 10, won: 5, drawn: 2, lost: 3, gf: 16, ga: 12, points: 17, logo: 'https://images.unsplash.com/photo-1543351611-c82399575a20?auto=format&fit=crop&q=80&w=300', town: 'Makutano' },
      { name: 'Kutus City FC', played: 10, won: 4, drawn: 4, lost: 2, gf: 14, ga: 11, points: 16, logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=300', town: 'Kutus' },
      { name: 'Kandongu Athletic', played: 10, won: 4, drawn: 3, lost: 3, gf: 13, ga: 12, points: 15, logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=300', town: 'Kandongu' },
      { name: 'Mutithi Falcons', played: 10, won: 3, drawn: 4, lost: 3, gf: 11, ga: 11, points: 13, logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=300', town: 'Mutithi' },
      { name: 'Kiamaciri Rangers', played: 10, won: 3, drawn: 3, lost: 4, gf: 10, ga: 14, points: 12, logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=300', town: 'Kiamaciri' },
      { name: 'Thiba River FC', played: 10, won: 2, drawn: 4, lost: 4, gf: 9, ga: 13, points: 10, logo: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&q=80&w=300', town: 'Thiba' },
      { name: 'Tebere Lions', played: 10, won: 2, drawn: 3, lost: 5, gf: 8, ga: 15, points: 9, logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=300', town: 'Tebere' },
      { name: 'Kianyaga Stars', played: 10, won: 2, drawn: 2, lost: 6, gf: 7, ga: 17, points: 8, logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=300', town: 'Kianyaga' },
      { name: 'Kagio Tigers', played: 10, won: 1, drawn: 3, lost: 6, gf: 6, ga: 18, points: 6, logo: 'https://images.unsplash.com/photo-1543351611-c82399575a20?auto=format&fit=crop&q=80&w=300', town: 'Kagio' },
      { name: 'Riakiania United', played: 10, won: 0, drawn: 3, lost: 7, gf: 4, ga: 19, points: 3, logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=300', town: 'Riakiania' }
    ];
    await Team.insertMany(INITIAL_TEAMS);
    console.log('✅ Teams seeded successfully!');
  }
};


// --- SERVER START & DB CONNECTION ---

// Connect to MongoDB with error catching
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Database');
    await seedInitialData();
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// Start server immediately so Render detects the port
app.listen(PORT, () => {
  console.log(`🚀 Kirinyaga South Super League Backend running on port ${PORT}`);
});