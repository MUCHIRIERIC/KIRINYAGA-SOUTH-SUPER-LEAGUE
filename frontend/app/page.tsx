'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Calendar,
  Shield,
  MapPin,
  Phone,
  Mail,
  Plus,
  Edit3,
  Lock,
  Unlock,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Info,
  X,
  Menu,
  CheckCircle2,
  AlertCircle,
  Flame,
  Search,
  Check,
  User,
  Medal
} from 'lucide-react';

// --- INITIAL DATA ---
interface Team {
  id: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
  logo: string;
  town: string;
}

interface Match {
  id: string;
  gameweek: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  venue: string;
  status: 'Upcoming' | 'Completed';
}

const INITIAL_TEAMS: Team[] = [
  { id: '1', name: 'Kerugoya Stars FC', played: 10, won: 7, drawn: 2, lost: 1, gf: 22, ga: 8, points: 23, logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=300', town: 'Kerugoya' },
  { id: '2', name: 'Sagana United', played: 10, won: 6, drawn: 3, lost: 1, gf: 19, ga: 9, points: 21, logo: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&q=80&w=300', town: 'Sagana' },
  { id: '3', name: 'Wang\'uru Warriors', played: 10, won: 6, drawn: 2, lost: 2, gf: 18, ga: 10, points: 20, logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=300', town: 'Wang\'uru' },
  { id: '4', name: 'Mwea Rice Strikers', played: 10, won: 5, drawn: 4, lost: 1, gf: 15, ga: 7, points: 19, logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=300', town: 'Mwea' },
  { id: '5', name: 'Makutano Heroes', played: 10, won: 5, drawn: 2, lost: 3, gf: 16, ga: 12, points: 17, logo: 'https://images.unsplash.com/photo-1543351611-c82399575a20?auto=format&fit=crop&q=80&w=300', town: 'Makutano' },
  { id: '6', name: 'Kutus City FC', played: 10, won: 4, drawn: 4, lost: 2, gf: 14, ga: 11, points: 16, logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=300', town: 'Kutus' },
  { id: '7', name: 'Kandongu Athletic', played: 10, won: 4, drawn: 3, lost: 3, gf: 13, ga: 12, points: 15, logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=300', town: 'Kandongu' },
  { id: '8', name: 'Mutithi Falcons', played: 10, won: 3, drawn: 4, lost: 3, gf: 11, ga: 11, points: 13, logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=300', town: 'Mutithi' },
  { id: '9', name: 'Kiamaciri Rangers', played: 10, won: 3, drawn: 3, lost: 4, gf: 10, ga: 14, points: 12, logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=300', town: 'Kiamaciri' },
  { id: '10', name: 'Thiba River FC', played: 10, won: 2, drawn: 4, lost: 4, gf: 9, ga: 13, points: 10, logo: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&q=80&w=300', town: 'Thiba' },
  { id: '11', name: 'Tebere Lions', played: 10, won: 2, drawn: 3, lost: 5, gf: 8, ga: 15, points: 9, logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=300', town: 'Tebere' },
  { id: '12', name: 'Kianyaga Stars', played: 10, won: 2, drawn: 2, lost: 6, gf: 7, ga: 17, points: 8, logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=300', town: 'Kianyaga' },
  { id: '13', name: 'Kagio Tigers', played: 10, won: 1, drawn: 3, lost: 6, gf: 6, ga: 18, points: 6, logo: 'https://images.unsplash.com/photo-1543351611-c82399575a20?auto=format&fit=crop&q=80&w=300', town: 'Kagio' },
  { id: '14', name: 'Riakiania United', played: 10, won: 0, drawn: 3, lost: 7, gf: 4, ga: 19, points: 3, logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=300', town: 'Riakiania' }
];

const INITIAL_MATCHES: Match[] = [
  { id: 'm1', gameweek: 11, homeTeamId: '1', awayTeamId: '2', homeScore: null, awayScore: null, date: '2026-09-12 15:00', venue: 'Kerugoya Stadium', status: 'Upcoming' },
  { id: 'm2', gameweek: 11, homeTeamId: '3', awayTeamId: '4', homeScore: null, awayScore: null, date: '2026-09-12 16:30', venue: 'Wang\'uru Grounds', status: 'Upcoming' },
  { id: 'm3', gameweek: 11, homeTeamId: '5', awayTeamId: '6', homeScore: null, awayScore: null, date: '2026-09-13 14:00', venue: 'Makutano Complex', status: 'Upcoming' },
  { id: 'm4', gameweek: 10, homeTeamId: '1', awayTeamId: '14', homeScore: 3, awayScore: 0, date: '2026-09-05 15:00', venue: 'Kerugoya Stadium', status: 'Completed' },
  { id: 'm5', gameweek: 10, homeTeamId: '2', awayTeamId: '13', homeScore: 2, awayScore: 1, date: '2026-09-05 16:00', venue: 'Sagana Stadium', status: 'Completed' },
  { id: 'm6', gameweek: 10, homeTeamId: '3', awayTeamId: '12', homeScore: 4, awayScore: 1, date: '2026-09-06 15:00', venue: 'Wang\'uru Grounds', status: 'Completed' }
];

export default function KirinyagaSouthSuperLeague() {
  // --- STATE ---
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('table');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Dynamic slideshow index
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // League Info state
  const [leagueInfo, setLeagueInfo] = useState({
    about: 'The Kirinyaga South Super League is the premier grassroots football championship in Kirinyaga South Sub-County. Aimed at nurturing local talent, promoting community health, and fostering unity among local youth through competitive sports.',
    location: 'Kirinyaga South Sub-County Stadium & Regional Pitches, Central Kenya',
    phone: '+254 712 345 678',
    email: 'info@kirinyagasouthleague.co.ke',
    address: 'P.O. Box 45 - Wang\'uru, Kirinyaga County'
  });

  // Modal forms state
  const [showAddTeamModal, setShowAddTeamModal] = useState<boolean>(false);
  const [newTeam, setNewTeam] = useState({ name: '', town: '', logo: '' });

  const [showAddFixtureModal, setShowAddFixtureModal] = useState<boolean>(false);
  const [newFixture, setNewFixture] = useState({ homeTeamId: '', awayTeamId: '', date: '', venue: '', gameweek: 11 });

  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [matchScore, setMatchScore] = useState({ home: 0, away: 0 });

  const [editingInfo, setEditingInfo] = useState<boolean>(false);
  const [tempInfo, setTempInfo] = useState(leagueInfo);

  // --- AUTOMATIC SLIDESHOW EFFECT (Every 5 seconds) ---
  useEffect(() => {
    if (teams.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prevIndex) => (prevIndex + 1) % teams.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [teams.length]);

  // --- RE-CALCULATE STANDINGS dynamically from teams state sorted by Points -> GD -> GF ---
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const gdA = a.gf - a.ga;
      const gdB = b.gf - b.ga;
      if (b.points !== a.points) return b.points - a.points;
      if (gdB !== gdA) return gdB - gdA;
      return b.gf - a.gf;
    });
  }, [teams]);

  // --- HANDLERS ---
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123' || adminPassword === 'superleague') {
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('Invalid passcode. Try "admin123"');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name) return;
    const teamObj: Team = {
      id: Date.now().toString(),
      name: newTeam.name,
      town: newTeam.town || 'Kirinyaga',
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      points: 0,
      logo: newTeam.logo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=300'
    };
    setTeams([...teams, teamObj]);
    setNewTeam({ name: '', town: '', logo: '' });
    setShowAddTeamModal(false);
  };

  const handleAddFixture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFixture.homeTeamId || !newFixture.awayTeamId) return;
    const fixObj: Match = {
      id: 'm_' + Date.now(),
      gameweek: Number(newFixture.gameweek),
      homeTeamId: newFixture.homeTeamId,
      awayTeamId: newFixture.awayTeamId,
      homeScore: null,
      awayScore: null,
      date: newFixture.date || '2026-09-20 15:00',
      venue: newFixture.venue || 'Sub-County Stadium',
      status: 'Upcoming'
    };
    setMatches([fixObj, ...matches]);
    setShowAddFixtureModal(false);
  };

  const handleUpdateScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;

    const homeVal = Number(matchScore.home);
    const awayVal = Number(matchScore.away);

    // Update match status
    const updatedMatches = matches.map((m) => {
      if (m.id === editingMatch.id) {
        return {
          ...m,
          homeScore: homeVal,
          awayScore: awayVal,
          status: 'Completed' as const
        };
      }
      return m;
    });
    setMatches(updatedMatches);

    // Recalculate standings for affected teams if this match was previously upcoming
    if (editingMatch.status === 'Upcoming') {
      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === editingMatch.homeTeamId) {
            const isWin = homeVal > awayVal;
            const isDraw = homeVal === awayVal;
            return {
              ...team,
              played: team.played + 1,
              won: team.won + (isWin ? 1 : 0),
              drawn: team.drawn + (isDraw ? 1 : 0),
              lost: team.lost + (!isWin && !isDraw ? 1 : 0),
              gf: team.gf + homeVal,
              ga: team.ga + awayVal,
              points: team.points + (isWin ? 3 : isDraw ? 1 : 0)
            };
          }
          if (team.id === editingMatch.awayTeamId) {
            const isWin = awayVal > homeVal;
            const isDraw = homeVal === awayVal;
            return {
              ...team,
              played: team.played + 1,
              won: team.won + (isWin ? 1 : 0),
              drawn: team.drawn + (isDraw ? 1 : 0),
              lost: team.lost + (!isWin && !isDraw ? 1 : 0),
              gf: team.gf + awayVal,
              ga: team.ga + homeVal,
              points: team.points + (isWin ? 3 : isDraw ? 1 : 0)
            };
          }
          return team;
        })
      );
    }

    setEditingMatch(null);
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setLeagueInfo(tempInfo);
    setEditingInfo(false);
  };

  const currentSlideTeam = teams[currentSlide] || teams[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-black">
      {/* BACKGROUND GRAPHICS & FOOTBALL EFFECTS */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* --- TOP HEADER NAVIGATION --- */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-emerald-900/40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo / Brand Name */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveSection('table')}>
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-0.5 shadow-lg shadow-emerald-900/30">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 bg-clip-text text-transparent uppercase">
                  KIRINYAGA SOUTH
                </h1>
                <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">SUPER LEAGUE</p>
              </div>
            </div>

            {/* Header Fast Access Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setActiveSection('table')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${
                  activeSection === 'table' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Table Standings</span>
              </button>

              <button
                onClick={() => setActiveSection('matches')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${
                  activeSection === 'matches' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Matches</span>
              </button>

              <button
                onClick={() => setActiveSection('fixtures')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${
                  activeSection === 'fixtures' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Fixtures</span>
              </button>
            </nav>

            {/* Admin Controls & Login */}
            <div className="hidden lg:flex items-center space-x-3">
              {isAdmin ? (
                <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>ADMIN ACCESS ACTIVE</span>
                  <button
                    onClick={handleLogout}
                    className="ml-2 bg-rose-600/80 hover:bg-rose-600 text-white px-2.5 py-1 rounded-full text-xs transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Login</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger toggle */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
            <button
              onClick={() => { setActiveSection('table'); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-lg font-semibold text-slate-200 hover:bg-slate-800 flex items-center space-x-3"
            >
              <Trophy className="w-5 h-5 text-emerald-400" />
              <span>Table Standings</span>
            </button>
            <button
              onClick={() => { setActiveSection('matches'); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-lg font-semibold text-slate-200 hover:bg-slate-800 flex items-center space-x-3"
            >
              <Flame className="w-5 h-5 text-amber-400" />
              <span>Matches</span>
            </button>
            <button
              onClick={() => { setActiveSection('fixtures'); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-lg font-semibold text-slate-200 hover:bg-slate-800 flex items-center space-x-3"
            >
              <Calendar className="w-5 h-5 text-teal-400" />
              <span>Fixtures</span>
            </button>
            <button
              onClick={() => { setActiveSection('stats'); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-lg font-semibold text-slate-200 hover:bg-slate-800 flex items-center space-x-3"
            >
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>League Stats</span>
            </button>
            <button
              onClick={() => { setActiveSection('about'); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-lg font-semibold text-slate-200 hover:bg-slate-800 flex items-center space-x-3"
            >
              <Info className="w-5 h-5 text-blue-400" />
              <span>About League</span>
            </button>
            <button
              onClick={() => { setActiveSection('location'); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-lg font-semibold text-slate-200 hover:bg-slate-800 flex items-center space-x-3"
            >
              <MapPin className="w-5 h-5 text-rose-400" />
              <span>Location</span>
            </button>
            <button
              onClick={() => { setActiveSection('contacts'); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-lg font-semibold text-slate-200 hover:bg-slate-800 flex items-center space-x-3"
            >
              <Phone className="w-5 h-5 text-emerald-400" />
              <span>Contacts</span>
            </button>

            <div className="pt-4 border-t border-slate-800">
              {isAdmin ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-rose-600 text-white rounded-lg font-bold text-center text-sm"
                >
                  Logout Admin
                </button>
              ) : (
                <button
                  onClick={() => { setShowAdminModal(true); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-center text-sm flex items-center justify-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Admin Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* --- DYNAMIC SLIDESHOW HERO SECTION (Autoplay 5s) --- */}
      <section className="relative w-full h-[320px] sm:h-[400px] overflow-hidden bg-slate-900 border-b border-emerald-950">
        {/* Slide Image Backdrop */}
        {teams.map((t, idx) => (
          <div
            key={t.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={t.logo}
              alt={t.name}
              className="w-full h-full object-cover object-center filter brightness-[0.35] scale-105 transform transition-transform duration-[5000ms]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          </div>
        ))}

        {/* Hero Overlay Content */}
        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8">
          <div className="flex items-center space-x-3 mb-2">
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Official League Team Showcase</span>
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Auto-updating ({currentSlide + 1} / {teams.length})
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
                {currentSlideTeam?.name}
              </h2>
              <p className="text-emerald-400 font-medium text-sm sm:text-base mt-1 flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Base Location: {currentSlideTeam?.town}, Kirinyaga</span>
                <span className="text-slate-500">•</span>
                <span>Points: {currentSlideTeam?.points} PTS</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev === 0 ? teams.length - 1 : prev - 1))}
                className="p-2.5 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % teams.length)}
                className="p-2.5 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex space-x-1.5 mt-4">
            {teams.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentSlide ? 'w-8 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- MAIN BODY (LAYOUT WITH LEFT SIDEBAR NAVIGATION) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT SIDEBAR NAVIGATION PANE --- */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-xl backdrop-blur-sm sticky top-24">
              <div className="px-3 py-2 border-b border-slate-800 mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation Menu</span>
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSection('table')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeSection === 'table'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Table</span>
                  </div>
                  <span className="text-xs bg-slate-950/50 px-2 py-0.5 rounded text-emerald-300 font-mono">{teams.length} Teams</span>
                </button>

                <button
                  onClick={() => setActiveSection('matches')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeSection === 'matches'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Matches</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('stats')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeSection === 'stats'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <span>Stats</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('about')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeSection === 'about'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span>About</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('location')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeSection === 'location'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>Location</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('contacts')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeSection === 'contacts'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Contacts</span>
                  </div>
                </button>
              </nav>

              {/* Admin Panel Quick Widget */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                {isAdmin ? (
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Admin Quick Actions</span>
                    </p>
                    <button
                      onClick={() => setShowAddTeamModal(true)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register New Team</span>
                    </button>
                    <button
                      onClick={() => setShowAddFixtureModal(true)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Fixture</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                    <p className="text-xs text-slate-400">Are you a League Official?</p>
                    <button
                      onClick={() => setShowAdminModal(true)}
                      className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                    >
                      Log in to update table & fixtures
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* --- MAIN CONTENT AREA --- */}
          <main className="lg:col-span-9 space-y-8">

            {/* --- SECTION 1: LEAGUE TABLE STANDINGS --- */}
            {(activeSection === 'table' || activeSection === 'fixtures') && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-6 h-6 text-amber-400" />
                      <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">
                        Official League Standings
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Kirinyaga South Super League 2026/2027 Season • Total {teams.length} Registered Teams
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setShowAddTeamModal(true)}
                      className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Team</span>
                    </button>
                  )}
                </div>

                {/* Table Legend */}
                <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                      <span className="text-slate-300 font-medium">Top 4 (Leaders / Promotion)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
                      <span className="text-slate-300 font-medium">Bottom 2 (Relegation Zone)</span>
                    </div>
                  </div>
                  <span className="text-slate-500 italic">P = Played, W = Won, D = Drawn, L = Lost, GD = Goal Diff, PTS = Points</span>
                </div>

                {/* Main Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4 text-center">POS</th>
                        <th className="py-3.5 px-4">TEAM</th>
                        <th className="py-3.5 px-3 text-center">P</th>
                        <th className="py-3.5 px-3 text-center">W</th>
                        <th className="py-3.5 px-3 text-center">D</th>
                        <th className="py-3.5 px-3 text-center">L</th>
                        <th className="py-3.5 px-3 text-center">GF</th>
                        <th className="py-3.5 px-3 text-center">GA</th>
                        <th className="py-3.5 px-3 text-center">GD</th>
                        <th className="py-3.5 px-4 text-center font-bold text-amber-400">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {sortedTeams.map((team, idx) => {
                        const rank = idx + 1;
                        const isLeader = rank <= 4;
                        const isRelegation = rank > sortedTeams.length - 2;

                        return (
                          <tr
                            key={team.id}
                            className={`transition hover:bg-slate-800/40 ${
                              isLeader
                                ? 'bg-emerald-950/20'
                                : isRelegation
                                ? 'bg-rose-950/20'
                                : ''
                            }`}
                          >
                            {/* Position Number */}
                            <td className="py-3 px-4 text-center font-bold">
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                                  isLeader
                                    ? 'bg-emerald-600 text-white font-extrabold shadow-md'
                                    : isRelegation
                                    ? 'bg-rose-600 text-white font-extrabold shadow-md'
                                    : 'text-slate-400 bg-slate-800'
                                }`}
                              >
                                {rank}
                              </span>
                            </td>

                            {/* Team Details */}
                            <td className="py-3 px-4 font-semibold text-white">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={team.logo}
                                  alt={team.name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-700"
                                />
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold">{team.name}</span>
                                    {isLeader && (
                                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 font-bold uppercase">
                                        Leader
                                      </span>
                                    )}
                                    {isRelegation && (
                                      <span className="bg-rose-500/20 text-rose-400 text-[10px] px-2 py-0.5 rounded border border-rose-500/30 font-bold uppercase">
                                        Relegation
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-500 font-normal">{team.town}</span>
                                </div>
                              </div>
                            </td>

                            {/* Stats Columns */}
                            <td className="py-3 px-3 text-center">{team.played}</td>
                            <td className="py-3 px-3 text-center text-emerald-400 font-medium">{team.won}</td>
                            <td className="py-3 px-3 text-center text-slate-400">{team.drawn}</td>
                            <td className="py-3 px-3 text-center text-rose-400">{team.lost}</td>
                            <td className="py-3 px-3 text-center text-slate-400">{team.gf}</td>
                            <td className="py-3 px-3 text-center text-slate-400">{team.ga}</td>
                            <td className={`py-3 px-3 text-center font-semibold ${team.gf - team.ga > 0 ? 'text-emerald-400' : team.gf - team.ga < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                              {team.gf - team.ga > 0 ? `+${team.gf - team.ga}` : team.gf - team.ga}
                            </td>
                            <td className="py-3 px-4 text-center font-black text-amber-400 text-base bg-amber-500/5">
                              {team.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- SECTION 2: MATCHES & FIXTURES --- */}
            {(activeSection === 'matches' || activeSection === 'fixtures') && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                      <Flame className="w-5 h-5 text-amber-400" />
                      <span>Fixtures & Match Results</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Upcoming matches and recent matchday scores across Kirinyaga South.
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setShowAddFixtureModal(true)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Fixture</span>
                    </button>
                  )}
                </div>

                {/* Matches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map((match) => {
                    const homeTeam = teams.find((t) => t.id === match.homeTeamId);
                    const awayTeam = teams.find((t) => t.id === match.awayTeamId);

                    return (
                      <div
                        key={match.id}
                        className="bg-slate-950 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition space-y-3 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">
                            Gameweek {match.gameweek}
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{match.date}</span>
                          </span>
                        </div>

                        {/* Match Display */}
                        <div className="flex items-center justify-between py-2">
                          {/* Home */}
                          <div className="flex-1 text-center font-bold text-sm text-slate-100 space-y-1">
                            <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                              <img src={homeTeam?.logo} alt="" className="w-full h-full object-cover" />
                            </div>
                            <p className="truncate">{homeTeam?.name || 'Home Team'}</p>
                          </div>

                          {/* Score or VS */}
                          <div className="px-4 text-center">
                            {match.status === 'Completed' ? (
                              <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-lg font-black text-amber-400 tracking-wider">
                                {match.homeScore} - {match.awayScore}
                              </div>
                            ) : (
                              <div className="bg-slate-800/80 px-3 py-1 rounded text-xs font-black text-slate-400 uppercase tracking-widest">
                                VS
                              </div>
                            )}
                            <span className="text-[10px] text-slate-500 block mt-1">
                              {match.status}
                            </span>
                          </div>

                          {/* Away */}
                          <div className="flex-1 text-center font-bold text-sm text-slate-100 space-y-1">
                            <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                              <img src={awayTeam?.logo} alt="" className="w-full h-full object-cover" />
                            </div>
                            <p className="truncate">{awayTeam?.name || 'Away Team'}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
                          <span className="truncate flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>Venue: {match.venue}</span>
                          </span>

                          {isAdmin && (
                            <button
                              onClick={() => {
                                setEditingMatch(match);
                                setMatchScore({ home: match.homeScore || 0, away: match.awayScore || 0 });
                              }}
                              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 text-xs"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{match.status === 'Completed' ? 'Edit Score' : 'Update Result'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- SECTION 3: STATS --- */}
            {activeSection === 'stats' && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    <span>League Analytics & Stats</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Current season summary metrics across Kirinyaga South Super League.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center">
                    <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-2xl font-black text-white">{sortedTeams[0]?.name}</p>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Current League Leader</p>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center">
                    <Flame className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                    <p className="text-2xl font-black text-white">
                      {teams.reduce((acc, t) => acc + t.gf, 0)} Goals
                    </p>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Total Goals Scored</p>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center">
                    <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-2xl font-black text-white">{teams.length} Teams</p>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Registered Clubs</p>
                  </div>
                </div>
              </div>
            )}

            {/* --- SECTION 4: ABOUT LEAGUE --- */}
            {activeSection === 'about' && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <Info className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-extrabold text-white">About The League</h3>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setEditingInfo(true)}
                      className="text-xs font-bold text-emerald-400 hover:underline flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                    </button>
                  )}
                </div>

                <p className="text-slate-300 leading-relaxed text-sm">{leagueInfo.about}</p>
              </div>
            )}

            {/* --- SECTION 5: LOCATION --- */}
            {activeSection === 'location' && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-6 h-6 text-rose-400" />
                    <h3 className="text-xl font-extrabold text-white">League Headquarters & Stadiums</h3>
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                  <p className="text-slate-200 text-sm font-semibold">{leagueInfo.location}</p>
                  <p className="text-xs text-slate-400">
                    Matches are hosted across municipal stadiums in Kerugoya, Sagana, Wang'uru, Mwea, Makutano, and Kutus.
                  </p>
                </div>
              </div>
            )}

            {/* --- SECTION 6: CONTACTS --- */}
            {activeSection === 'contacts' && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-xl font-extrabold text-white">Contact Management</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Official Hotline</p>
                      <p className="text-sm font-semibold text-slate-200">{leagueInfo.phone}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Email Address</p>
                      <p className="text-sm font-semibold text-slate-200">{leagueInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 border-t border-slate-800 mt-16 pt-12 pb-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800/80">
          {/* About Column */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm text-white uppercase">Kirinyaga South Super League</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {leagueInfo.about}
            </p>
          </div>

          {/* Location Column */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Location & Venues</span>
            </h4>
            <p className="text-slate-400">{leagueInfo.location}</p>
            <p className="text-slate-500">{leagueInfo.address}</p>
          </div>

          {/* Contacts Column */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase flex items-center space-x-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>League Secretariat Contacts</span>
            </h4>
            <p className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{leagueInfo.phone}</span>
            </p>
            <p className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{leagueInfo.email}</span>
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Kirinyaga South Super League. All Rights Reserved.</p>
          <div className="flex items-center space-x-4 text-slate-500">
            <span className="hover:text-slate-300 cursor-pointer">Terms & Conditions</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </footer>

      {/* --- MODALS (ADMIN LOGIN, ADD TEAM, ADD FIXTURE, UPDATE SCORE) --- */}

      {/* 1. ADMIN LOGIN MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Admin Authentication</h3>
                <p className="text-xs text-slate-400">Enter passcode to manage league data</p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Passcode</label>
                <input
                  type="password"
                  placeholder="Enter admin passcode (e.g. admin123)"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                {adminError && <p className="text-rose-500 text-xs mt-1">{adminError}</p>}
              </div>

              <div className="bg-slate-950 p-3 rounded-lg text-xs text-slate-400 border border-slate-800">
                <p className="font-semibold text-amber-400 mb-0.5">Demo Passcode:</p>
                <code className="text-slate-200">admin123</code>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl transition shadow-lg shadow-emerald-900/30"
              >
                Authenticate & Unlock
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADD TEAM MODAL */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddTeamModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Register New Team</span>
            </h3>

            <form onSubmit={handleAddTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wang'uru Heroes FC"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Home Town / Sub-County</label>
                <input
                  type="text"
                  placeholder="e.g. Sagana"
                  value={newTeam.town}
                  onChange={(e) => setNewTeam({ ...newTeam, town: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Logo Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newTeam.logo}
                  onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl transition"
              >
                Register Team
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT MATCH RESULT MODAL */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingMatch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Update Match Result</h3>

            <form onSubmit={handleUpdateScore} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 truncate mb-1">
                    {teams.find((t) => t.id === editingMatch.homeTeamId)?.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={matchScore.home}
                    onChange={(e) => setMatchScore({ ...matchScore, home: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-xl font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 truncate mb-1">
                    {teams.find((t) => t.id === editingMatch.awayTeamId)?.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={matchScore.away}
                    onChange={(e) => setMatchScore({ ...matchScore, away: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-xl font-bold text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl transition"
              >
                Save Score & Update Standings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. CREATE FIXTURE MODAL */}
      {showAddFixtureModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddFixtureModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Add New Fixture</h3>

            <form onSubmit={handleAddFixture} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Home Team</label>
                  <select
                    required
                    value={newFixture.homeTeamId}
                    onChange={(e) => setNewFixture({ ...newFixture, homeTeamId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="">Select Home</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Away Team</label>
                  <select
                    required
                    value={newFixture.awayTeamId}
                    onChange={(e) => setNewFixture({ ...newFixture, awayTeamId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="">Select Away</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Gameweek</label>
                <input
                  type="number"
                  value={newFixture.gameweek}
                  onChange={(e) => setNewFixture({ ...newFixture, gameweek: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Date & Time</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-09-20 15:00"
                  value={newFixture.date}
                  onChange={(e) => setNewFixture({ ...newFixture, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Kerugoya Stadium"
                  value={newFixture.venue}
                  onChange={(e) => setNewFixture({ ...newFixture, venue: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl transition"
              >
                Schedule Match Fixture
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}