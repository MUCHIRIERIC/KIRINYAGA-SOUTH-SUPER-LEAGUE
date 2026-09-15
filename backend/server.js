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
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'KIMBIMBI@254'; // Aligned with frontend

// --- MONGOOSE SCHEMAS & MODELS ---

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

const leagueInfoSchema = new mongoose.Schema({
  about: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true }
}, { timestamps: true });
const LeagueInfo = mongoose.model('LeagueInfo', leagueInfoSchema);

// NEW: Community & Awards Schemas
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true }
});
const Message = mongoose.model('Message', messageSchema);

const teamCommentSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  comment: { type: String, required: true },
  timestamp: { type: String, required: true }
});
const TeamComment = mongoose.model('TeamComment', teamCommentSchema);

const awardSchema = new mongoose.Schema({
  type: { type: String, enum: ['potd', 'potm'], required: true, unique: true },
  name: { type: String, required: true },
  context: { type: String, required: true },
  mediaUrl: { type: String, required: true }
});
const Award = mongoose.model('Award', awardSchema);


// --- AUTHENTICATION MIDDLEWARE ---
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Admin access required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'admin') req.user = decoded;
    else return res.status(403).json({ message: 'Forbidden' });
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};


// --- API ROUTES ---

// 1. ADMIN LOGIN
app.post('/api/admin/login', (req, res) => {
  console.log('Login Payload Received:', req.body);
  const { email, password } = req.body;
  const authorizedEmails = ['muchirimunene031@gmail.com', 'munene398@gmail.com'];
  
  if (authorizedEmails.includes(email?.toLowerCase()) && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ success: true, token, message: 'Authenticated successfully' });
  }
  return res.status(401).json({ success: false, message: 'Access Denied.' });
});

// 2. TEAMS ENDPOINTS
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find({});
    teams.sort((a, b) => {
      const gdA = a.gf - a.ga;
      const gdB = b.gf - b.ga;
      if (b.points !== a.points) return b.points - a.points;
      if (gdB !== gdA) return gdB - gdA;
      return b.gf - a.gf;
    });
    res.json(teams);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/teams', verifyAdmin, async (req, res) => {
  try {
    const team = new Team({ ...req.body, town: req.body.town || 'Kirinyaga' });
    await team.save();
    res.status(201).json(team);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/teams/:id', verifyAdmin, async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(team);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/teams/:id', verifyAdmin, async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. MATCHES ENDPOINTS
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find({})
      .populate('homeTeam', 'name logo town')
      .populate('awayTeam', 'name logo town')
      .sort({ createdAt: -1 });
    res.json(matches);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/matches', verifyAdmin, async (req, res) => {
  try {
    const match = new Match({ ...req.body, gameweek: Number(req.body.gameweek) });
    await match.save();
    const populated = await Match.findById(match._id).populate('homeTeam awayTeam');
    res.status(201).json(populated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/matches/:id', verifyAdmin, async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('homeTeam awayTeam');
    res.json(match);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/matches/:id', verifyAdmin, async (req, res) => {
  try {
    await Match.findByIdAndDelete(req.params.id);
    res.json({ message: 'Match deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/matches/:id/score', verifyAdmin, async (req, res) => {
  try {
    const { homeScore, awayScore } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const homeVal = Number(homeScore);
    const awayVal = Number(awayScore);

    if (match.status === 'Upcoming') {
      const homeTeam = await Team.findById(match.homeTeam);
      const awayTeam = await Team.findById(match.awayTeam);
      if (homeTeam && awayTeam) {
        const homeWin = homeVal > awayVal;
        const draw = homeVal === awayVal;
        const awayWin = awayVal > homeVal;

        homeTeam.played += 1; homeTeam.gf += homeVal; homeTeam.ga += awayVal;
        if (homeWin) { homeTeam.won += 1; homeTeam.points += 3; } else if (draw) { homeTeam.drawn += 1; homeTeam.points += 1; } else { homeTeam.lost += 1; }
        await homeTeam.save();

        awayTeam.played += 1; awayTeam.gf += awayVal; awayTeam.ga += homeVal;
        if (awayWin) { awayTeam.won += 1; awayTeam.points += 3; } else if (draw) { awayTeam.drawn += 1; awayTeam.points += 1; } else { awayTeam.lost += 1; }
        await awayTeam.save();
      }
    }
    match.homeScore = homeVal; match.awayScore = awayVal; match.status = 'Completed';
    await match.save();
    res.json(await Match.findById(match._id).populate('homeTeam awayTeam'));
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 4. COMMUNITY ENDPOINTS (MESSAGES & COMMENTS)
app.get('/api/messages', async (req, res) => {
  try { res.json(await Message.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/messages', async (req, res) => {
  try { res.status(201).json(await Message.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/messages/:id', verifyAdmin, async (req, res) => {
  try { await Message.findByIdAndDelete(req.params.id); res.json({ message: 'Message deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/comments', async (req, res) => {
  try { res.json(await TeamComment.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/comments', async (req, res) => {
  try { res.status(201).json(await TeamComment.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/comments/:id', verifyAdmin, async (req, res) => {
  try { await TeamComment.findByIdAndDelete(req.params.id); res.json({ message: 'Comment deleted' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. AWARDS ENDPOINTS (POTD / POTM)
app.get('/api/awards', async (req, res) => {
  try { res.json(await Award.find()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/awards/:type', verifyAdmin, async (req, res) => {
  try {
    const award = await Award.findOneAndUpdate(
      { type: req.params.type },
      req.body,
      { new: true, upsert: true }
    );
    res.json(award);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 6. INFO ENDPOINTS
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/info', verifyAdmin, async (req, res) => {
  try {
    const info = await LeagueInfo.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(info);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- SERVER START & DB CONNECTION ---
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Database'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

app.listen(PORT, () => console.log(`🚀 Kirinyaga South Super League Backend running on port ${PORT}`));
