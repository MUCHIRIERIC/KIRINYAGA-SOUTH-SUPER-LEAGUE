'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy, Calendar, Shield, MapPin, Phone, Mail, Plus, Edit3, Lock, Unlock,
  ChevronRight, ChevronLeft, BarChart3, Info, X, Menu, Flame, MessageSquare,
  Users, Star, Trash2, Video, UserCheck, Send, Image, Smile, Eye, EyeOff
} from 'lucide-react';

const BACKEND_URL = 'https://kirinyaga-south-super-league-6.onrender.com';

// --- INTERFACES ---
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
  _id?: string;
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
  _id?: string;
}

interface MessageReply {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface UserMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  replies?: MessageReply[];
}

interface TeamComment {
  id: string;
  teamName: string;
  comment: string;
  timestamp: string;
}

interface ExecutiveOfficial {
  role: 'Chairman' | 'Treasurer' | 'Secretary' | 'Match Comm';
  name: string;
  phone: string;
  email: string;
}

interface TeamOfficial {
  teamId: string;
  officialName: string;
  role: string;
  phone: string;
}

interface HeroMedia {
  id: string;
  url: string;
  title: string;
}

// --- HELPER COMPONENT FOR MEDIA (IMAGE/VIDEO) ---
const MediaRenderer = ({ url, className }: { url: string; className: string }) => {
  if (!url) return <div className={`bg-slate-800 ${className}`}></div>;
  const isVideo = url.match(/\.(mp4|webm|ogg)$/i) || url.includes('video');
  
  if (isVideo) {
    return (
      <video src={url} autoPlay loop muted playsInline className={`object-cover ${className}`} />
    );
  }
  return <img src={url} alt="media" className={`object-cover ${className}`} />;
};

export default function KirinyagaSouthSuperLeague() {
  // --- STATE ---
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  // Authentication
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string>('');
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');
  
  // Password Management
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showUniversalPassword, setShowUniversalPassword] = useState<boolean>(false);
  
  // Navigation
  const [activeSection, setActiveSection] = useState<string>('table');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Landing Page Media Tool
  const [heroMediaList, setHeroMediaList] = useState<HeroMedia[]>([]);
  const [showHeroMediaModal, setShowHeroMediaModal] = useState<boolean>(false);
  const [newHeroMediaUrl, setNewHeroMediaUrl] = useState<string>('');
  const [newHeroMediaTitle, setNewHeroMediaTitle] = useState<string>('');

  // Officials State
  const [executiveOfficials] = useState<ExecutiveOfficial[]>([
    { role: 'Chairman', name: 'John Kariuki', phone: '+254 712 000 111', email: 'chairman@kirinyagaleague.co.ke' },
    { role: 'Treasurer', name: 'Mary Wanjiku', phone: '+254 722 000 222', email: 'treasurer@kirinyagaleague.co.ke' },
    { role: 'Secretary', name: 'David Njuguna', phone: '+254 733 000 333', email: 'secretary@kirinyagaleague.co.ke' },
    { role: 'Match Comm', name: 'Peter Mwangi', phone: '+254 744 000 444', email: 'matchcomm@kirinyagaleague.co.ke' }
  ]);
  
  const [teamOfficials, setTeamOfficials] = useState<{ [teamId: string]: TeamOfficial }>({});
  const [editingOfficialTeamId, setEditingOfficialTeamId] = useState<string | null>(null);
  const [officialForm, setOfficialForm] = useState({ officialName: '', role: 'Team Representative', phone: '' });

  // Community Features
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [newMessage, setNewMessage] = useState({ sender: '', text: '' });
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyForm, setReplyForm] = useState({ sender: '', text: '' });
  
  const [teamComments, setTeamComments] = useState<TeamComment[]>([]);
  const [newComment, setNewComment] = useState({ teamName: '', comment: '' });
  const [matchReactions, setMatchReactions] = useState<{ [key: string]: { [emoji: string]: number } }>({});

  // Player Highlights
  const [potd, setPotd] = useState({ name: 'Outstanding Player', team: 'TBD', mediaUrl: '' });
  const [potm, setPotm] = useState({ name: 'MVP', match: 'TBD', mediaUrl: '' });
  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false);
  const [editingPlayerType, setEditingPlayerType] = useState<'potd' | 'potm'>('potd');
  const [playerForm, setPlayerForm] = useState({ name: '', context: '', mediaUrl: '' });

  // League Info 
  const [leagueInfo, setLeagueInfo] = useState({
    about: 'The Kirinyaga South Super League is the premier grassroots football championship in Kirinyaga South Sub-County.',
    location: 'Kirinyaga South Sub-County Stadium & Regional Pitches, Central Kenya',
    phone: '+254 712 345 678',
    email: 'info@kirinyagasouthleague.co.ke',
    address: "P.O. Box 45 - Wang'uru, Kirinyaga County"
  });

  // Modals
  const [showTeamModal, setShowTeamModal] = useState<boolean>(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamForm, setTeamForm] = useState({ name: '', town: '', logo: '', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 });

  const [showFixtureModal, setShowFixtureModal] = useState<boolean>(false);
  const [editingFixture, setEditingFixture] = useState<Match | null>(null);
  const [fixtureForm, setFixtureForm] = useState({ homeTeamId: '', awayTeamId: '', date: '', venue: '', gameweek: 11 });

  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [matchScore, setMatchScore] = useState({ home: 0, away: 0 });

  const [editingInfo, setEditingInfo] = useState<boolean>(false);
  const [tempInfo, setTempInfo] = useState(leagueInfo);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        const [teamsRes, matchesRes, infoRes, mediaRes, playersRes, msgsRes, commentsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/teams`).catch(() => null),
          fetch(`${BACKEND_URL}/api/matches`).catch(() => null),
          fetch(`${BACKEND_URL}/api/info`).catch(() => null),
          fetch(`${BACKEND_URL}/api/heroMedia`).catch(() => null),
          fetch(`${BACKEND_URL}/api/players`).catch(() => null),
          fetch(`${BACKEND_URL}/api/messages`).catch(() => null),
          fetch(`${BACKEND_URL}/api/comments`).catch(() => null)
        ]);

        if (teamsRes && teamsRes.ok) {
          const data = await teamsRes.json();
          if (data.length) setTeams(data.map((t: any) => ({ ...t, id: t._id || t.id })));
        }
        
        if (matchesRes && matchesRes.ok) {
          const data = await matchesRes.json();
          if (data.length) {
            const formattedMatches = data.map((m: any) => ({
              ...m,
              id: m._id || m.id,
              homeTeamId: m.homeTeam?._id || m.homeTeam || m.homeTeamId,
              awayTeamId: m.awayTeam?._id || m.awayTeam || m.awayTeamId
            }));
            setMatches(formattedMatches);
          }
        }

        if (infoRes && infoRes.ok) {
          const data = await infoRes.json();
          if (data && data.about) setLeagueInfo(data);
        }

        if (mediaRes && mediaRes.ok) {
          const data = await mediaRes.json();
          if (data.length) setHeroMediaList(data);
        }

        if (playersRes && playersRes.ok) {
          const data = await playersRes.json();
          if (data.potd) setPotd(data.potd);
          if (data.potm) setPotm(data.potm);
        }

        if (msgsRes && msgsRes.ok) {
          const data = await msgsRes.json();
          if (data.length) setMessages(data);
        }

        if (commentsRes && commentsRes.ok) {
          const data = await commentsRes.json();
          if (data.length) setTeamComments(data);
        }
      } catch (error) {
        console.error("Error fetching backend data:", error);
      }
    };
    fetchLeagueData();
  }, []);

  // Slideshow
  const combinedHeroMedia = useMemo(() => {
    const teamMedia = teams.map(t => ({ id: t.id, url: t.logo, title: `${t.name} (${t.town})` }));
    return [...heroMediaList, ...teamMedia];
  }, [teams, heroMediaList]);

  useEffect(() => {
    if (combinedHeroMedia.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prevIndex) => (prevIndex + 1) % combinedHeroMedia.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [combinedHeroMedia.length]);

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
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        data = { message: 'Network or authentication error.' };
      }
      
      if (response.ok && (data.success || data.token)) {
        setIsAdmin(true);
        if (data.token) setAdminToken(data.token);
        setShowAdminModal(false);
        setAdminEmail('');
        setAdminPassword('');
      } else {
        setAdminError(data.message || 'Access Denied. Unauthorized email or incorrect password.');
      }
    } catch (error) {
      setAdminError('Server connection error. Please try again later.');
    }
  };

  const handleAddHeroMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeroMediaUrl) return;
    const item: HeroMedia = {
      id: 'hm_' + Date.now(),
      url: newHeroMediaUrl,
      title: newHeroMediaTitle || 'Kirinyaga League Media'
    };
    
    setHeroMediaList([item, ...heroMediaList]);
    
    fetch(`${BACKEND_URL}/api/heroMedia`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}` 
      },
      body: JSON.stringify(item)
    }).catch(console.error);

    setNewHeroMediaUrl('');
    setNewHeroMediaTitle('');
    setShowHeroMediaModal(false);
  };

  const openTeamModal = (team: Team | null = null) => {
    if (team) {
      setEditingTeam(team);
      setTeamForm(team);
    } else {
      setEditingTeam(null);
      setTeamForm({ name: '', town: '', logo: '', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 });
    }
    setShowTeamModal(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name) return;
    
    const isEdit = !!editingTeam;
    const tempId = isEdit ? editingTeam.id : Date.now().toString();
    const formattedTeam = { ...teamForm, id: tempId };

    if (isEdit) {
      setTeams(teams.map(t => t.id === tempId ? formattedTeam : t));
    } else {
      setTeams([...teams, formattedTeam]);
    }
    setShowTeamModal(false);

    const url = isEdit ? `${BACKEND_URL}/api/teams/${tempId}` : `${BACKEND_URL}/api/teams`;
    fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(formattedTeam)
    }).catch(console.error);
  };

  const handleDeleteTeam = (id: string) => {
    if (!isAdmin) return;
    if (confirm("Are you sure you want to remove this team?")) {
      setTeams(teams.filter(t => t.id !== id));
      fetch(`${BACKEND_URL}/api/teams/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }).catch(console.error);
    }
  };

  const openFixtureModal = (fixture: Match | null = null) => {
    if (fixture) {
      setEditingFixture(fixture);
      setFixtureForm({
        homeTeamId: fixture.homeTeamId,
        awayTeamId: fixture.awayTeamId,
        date: fixture.date,
        venue: fixture.venue,
        gameweek: fixture.gameweek
      });
    } else {
      setEditingFixture(null);
      setFixtureForm({ homeTeamId: '', awayTeamId: '', date: '', venue: '', gameweek: 11 });
    }
    setShowFixtureModal(true);
  };

  const handleSaveFixture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixtureForm.homeTeamId || !fixtureForm.awayTeamId) return;

    const isEdit = !!editingFixture;
    const tempId = isEdit ? editingFixture.id : 'm_' + Date.now();
    const fixObj: Match = {
      id: tempId,
      ...fixtureForm,
      homeScore: isEdit ? editingFixture.homeScore : null,
      awayScore: isEdit ? editingFixture.awayScore : null,
      status: isEdit ? editingFixture.status : 'Upcoming'
    };

    if (isEdit) {
      setMatches(matches.map(m => m.id === tempId ? fixObj : m));
    } else {
      setMatches([fixObj, ...matches]);
    }
    setShowFixtureModal(false);

    const url = isEdit ? `${BACKEND_URL}/api/matches/${tempId}` : `${BACKEND_URL}/api/matches`;
    fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(fixObj)
    }).catch(console.error);
  };

  const handleDeleteFixture = (id: string) => {
    if (!isAdmin) return;
    if (confirm("Remove this match fixture?")) {
      setMatches(matches.filter(m => m.id !== id));
      fetch(`${BACKEND_URL}/api/matches/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }).catch(console.error);
    }
  };

  const handleUpdateScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;

    const homeVal = Number(matchScore.home);
    const awayVal = Number(matchScore.away);
    const updatedMatch = { ...editingMatch, homeScore: homeVal, awayScore: awayVal, status: 'Completed' as const };
    
    setMatches(matches.map(m => m.id === editingMatch.id ? updatedMatch : m));

    fetch(`${BACKEND_URL}/api/matches/${editingMatch.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(updatedMatch)
    }).catch(console.error);

    if (editingMatch.status === 'Upcoming') {
      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          let updatedTeam = team;
          if (team.id === editingMatch.homeTeamId) {
            const isWin = homeVal > awayVal;
            const isDraw = homeVal === awayVal;
            updatedTeam = {
              ...team,
              played: team.played + 1,
              won: team.won + (isWin ? 1 : 0),
              drawn: team.drawn + (isDraw ? 1 : 0),
              lost: team.lost + (!isWin && !isDraw ? 1 : 0),
              gf: team.gf + homeVal,
              ga: team.ga + awayVal,
              points: team.points + (isWin ? 3 : isDraw ? 1 : 0)
            };
          } else if (team.id === editingMatch.awayTeamId) {
            const isWin = awayVal > homeVal;
            const isDraw = homeVal === awayVal;
            updatedTeam = {
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
          
          if (updatedTeam !== team) {
             fetch(`${BACKEND_URL}/api/teams/${updatedTeam.id}`, {
               method: 'PUT',
               headers: { 
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${adminToken}`
               },
               body: JSON.stringify(updatedTeam)
             }).catch(console.error);
          }
          return updatedTeam;
        })
      );
    }
    setEditingMatch(null);
  };

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: playerForm.name, [editingPlayerType === 'potd' ? 'team' : 'match']: playerForm.context, mediaUrl: playerForm.mediaUrl };
    
    if (editingPlayerType === 'potd') setPotd(payload as any);
    else setPotm(payload as any);
    
    fetch(`${BACKEND_URL}/api/players/${editingPlayerType}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    }).catch(console.error);

    setShowEditPlayerModal(false);
  };

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.text || !newMessage.sender) return;
    const msg = { id: Date.now().toString(), ...newMessage, replies: [], timestamp: new Date().toLocaleString() };
    setMessages([msg, ...messages]);
    
    fetch(`${BACKEND_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    }).catch(console.error);

    setNewMessage({ sender: '', text: '' });
  };

  const handlePostReply = (e: React.FormEvent, messageId: string) => {
    e.preventDefault();
    if (!replyForm.sender || !replyForm.text) return;
    const replyObj: MessageReply = {
      id: 'rep_' + Date.now(),
      sender: replyForm.sender,
      text: replyForm.text,
      timestamp: new Date().toLocaleString()
    };
    
    setMessages(messages.map(m => {
      if (m.id === messageId) {
        const updatedMsg = { ...m, replies: [...(m.replies || []), replyObj] };
        fetch(`${BACKEND_URL}/api/messages/${messageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMsg)
        }).catch(console.error);
        return updatedMsg;
      }
      return m;
    }));
    
    setReplyForm({ sender: '', text: '' });
    setActiveReplyId(null);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.comment || !newComment.teamName) return;
    const commentObj = { id: Date.now().toString(), ...newComment, timestamp: new Date().toLocaleString() };
    setTeamComments([commentObj, ...teamComments]);
    
    fetch(`${BACKEND_URL}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentObj)
    }).catch(console.error);

    setNewComment({ teamName: '', comment: '' });
  };

  const handleEmojiReaction = (matchId: string, emoji: string) => {
    setMatchReactions((prev) => {
      const matchObj = prev[matchId] || {};
      const count = matchObj[emoji] || 0;
      return { ...prev, [matchId]: { ...matchObj, [emoji]: count + 1 } };
    });
  };

  const handleSaveTeamOfficial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOfficialTeamId || !officialForm.officialName) return;
    const updatedOfficial = {
      teamId: editingOfficialTeamId,
      officialName: officialForm.officialName,
      role: officialForm.role || 'Team Representative',
      phone: officialForm.phone || 'N/A'
    };
    
    setTeamOfficials({ ...teamOfficials, [editingOfficialTeamId]: updatedOfficial });

    fetch(`${BACKEND_URL}/api/officials/${editingOfficialTeamId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(updatedOfficial)
    }).catch(console.error);

    setEditingOfficialTeamId(null);
    setOfficialForm({ officialName: '', role: 'Team Representative', phone: '' });
  };

  const deleteMessage = (id: string) => {
    if (!isAdmin) return;
    setMessages(messages.filter(m => m.id !== id));
    fetch(`${BACKEND_URL}/api/messages/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).catch(console.error);
  };

  const deleteReply = (messageId: string, replyId: string) => {
    if (!isAdmin) return;
    setMessages(messages.map(m => {
      if (m.id === messageId) {
        const updatedMsg = { ...m, replies: (m.replies || []).filter(r => r.id !== replyId) };
        fetch(`${BACKEND_URL}/api/messages/${messageId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(updatedMsg)
        }).catch(console.error);
        return updatedMsg;
      }
      return m;
    }));
  };

  const deleteComment = (id: string) => {
    if (!isAdmin) return;
    setTeamComments(teamComments.filter(c => c.id !== id));
    fetch(`${BACKEND_URL}/api/comments/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).catch(console.error);
  };

  const currentMedia = combinedHeroMedia[currentSlide] || combinedHeroMedia[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-black">
      {/* BACKGROUND GRAPHICS */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.07] z-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] mix-blend-screen"></div>

      {/* --- TOP HEADER NAVIGATION --- */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-emerald-900/40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <button onClick={() => setActiveSection('table')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${activeSection === 'table' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-300 hover:bg-slate-800'}`}>
                <Trophy className="w-4 h-4" /><span>Standings</span>
              </button>
              <button onClick={() => setActiveSection('matches')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${activeSection === 'matches' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-300 hover:bg-slate-800'}`}>
                <Flame className="w-4 h-4 text-amber-400" /><span>Matches</span>
              </button>
              <button onClick={() => setActiveSection('messages')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${activeSection === 'messages' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-800'}`}>
                <MessageSquare className="w-4 h-4 text-blue-400" /><span>Messages</span>
              </button>
              <button onClick={() => setActiveSection('officials')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${activeSection === 'officials' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-300 hover:bg-slate-800'}`}>
                <UserCheck className="w-4 h-4 text-purple-400" /><span>Officials</span>
              </button>
            </nav>

            <div className="hidden lg:flex items-center space-x-3">
              {isAdmin ? (
                <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>ADMIN ACCESS ACTIVE</span>
                  <button onClick={() => setIsAdmin(false)} className="ml-2 bg-rose-600/80 hover:bg-rose-600 text-white px-2.5 py-1 rounded-full text-xs transition-all">Logout</button>
                </div>
              ) : (
                <button onClick={() => setShowAdminModal(true)} className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Login</span>
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 focus:outline-none">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
            {['table', 'matches', 'messages', 'officials', 'stats', 'comments', 'about', 'location', 'contacts'].map((section) => (
              <button
                key={section}
                onClick={() => { setActiveSection(section); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg font-semibold text-slate-200 hover:bg-slate-800 capitalize flex items-center space-x-3"
              >
                <span>{section}</span>
              </button>
            ))}
            <div className="pt-4 border-t border-slate-800">
              {isAdmin ? (
                <button onClick={() => setIsAdmin(false)} className="w-full py-2.5 bg-rose-600 text-white rounded-lg font-bold text-center text-sm">Logout</button>
              ) : (
                <button onClick={() => { setShowAdminModal(true); setMobileMenuOpen(false); }} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-center text-sm flex items-center justify-center space-x-2">
                  <Lock className="w-4 h-4" /><span>Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* --- HERO SLIDESHOW / LANDING PAGE MEDIA TOOL --- */}
      <section className="relative w-full h-[320px] sm:h-[420px] overflow-hidden bg-slate-900 border-b border-emerald-950">
        {combinedHeroMedia.map((m, idx) => (
          <div key={m.id + idx} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <MediaRenderer url={m.url} className="w-full h-full filter brightness-[0.35] scale-105 transform transition-transform duration-[5000ms]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          </div>
        ))}

        {isAdmin && (
          <div className="absolute top-6 right-6 z-20">
            <button 
              onClick={() => setShowHeroMediaModal(true)} 
              className="bg-emerald-600/90 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 backdrop-blur-sm border border-emerald-400/50 shadow-xl transition-all"
            >
              <Video className="w-4 h-4" />
              <span>Add / Edit Media</span>
            </button>
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 flex flex-col justify-end pb-8">
          <div className="flex justify-between items-end gap-4">
            <div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white">{currentMedia?.title || 'Kirinyaga South Super League'}</h2>
              <p className="text-emerald-400 mt-1 flex items-center space-x-2">
                <MapPin className="w-4 h-4" /><span>Central Kenya Grassroots Football</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN LAYOUT --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-xl backdrop-blur-sm sticky top-24">
              <div className="px-3 py-2 border-b border-slate-800 mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Menu</span>
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'table', icon: Trophy, label: 'Table Standings' },
                  { id: 'matches', icon: Flame, label: 'Matches & Fixtures' },
                  { id: 'messages', icon: MessageSquare, label: 'Public Messages' },
                  { id: 'officials', icon: UserCheck, label: 'League Officials' },
                  { id: 'stats', icon: BarChart3, label: 'Stats & Players' },
                  { id: 'comments', icon: Users, label: 'Team Comments' },
                  { id: 'about', icon: Info, label: 'About' },
                  { id: 'location', icon: MapPin, label: 'Location' },
                  { id: 'contacts', icon: Phone, label: 'Contacts' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${activeSection === item.id ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800/80'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-4 h-4" /><span>{item.label}</span>
                    </div>
                  </button>
                ))}
              </nav>

              {isAdmin && (
                <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                  <p className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                    <Unlock className="w-3.5 h-3.5" /><span>Admin Actions</span>
                  </p>
                  <button onClick={() => openTeamModal()} className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs py-2 px-3 rounded-xl font-bold flex justify-center items-center space-x-2">
                    <Plus className="w-4 h-4" /><span>Add New Team</span>
                  </button>
                  <button onClick={() => openFixtureModal()} className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs py-2 px-3 rounded-xl font-bold flex justify-center items-center space-x-2">
                    <Plus className="w-4 h-4" /><span>Add Match Fixture</span>
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="lg:col-span-9 space-y-8">
            
            {/* STANDINGS TABLE */}
            {activeSection === 'table' && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <h3 className="text-xl font-extrabold text-white uppercase">League Standings</h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4 text-center">POS</th>
                        <th className="py-3 px-4">TEAM</th>
                        <th className="py-3 px-3 text-center">P</th>
                        <th className="py-3 px-3 text-center">W</th>
                        <th className="py-3 px-3 text-center">D</th>
                        <th className="py-3 px-3 text-center">L</th>
                        <th className="py-3 px-3 text-center">GD</th>
                        <th className="py-3 px-4 text-center text-amber-400">PTS</th>
                        {isAdmin && <th className="py-3 px-4 text-center text-rose-400">ADMIN</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {sortedTeams.map((team, idx) => (
                        <tr key={team.id} className="transition hover:bg-slate-800/40">
                          <td className="py-3 px-4 text-center font-bold">{idx + 1}</td>
                          <td className="py-3 px-4 font-semibold text-white flex items-center space-x-3">
                            <MediaRenderer url={team.logo} className="w-8 h-8 rounded-full border border-slate-700" />
                            <div>
                              <p>{team.name}</p>
                              <p className="text-xs text-slate-500 font-normal">{team.town}</p>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">{team.played}</td>
                          <td className="py-3 px-3 text-center text-emerald-400">{team.won}</td>
                          <td className="py-3 px-3 text-center text-slate-400">{team.drawn}</td>
                          <td className="py-3 px-3 text-center text-rose-400">{team.lost}</td>
                          <td className="py-3 px-3 text-center font-semibold">{team.gf - team.ga}</td>
                          <td className="py-3 px-4 text-center font-black text-amber-400 text-base">{team.points}</td>
                          {isAdmin && (
                            <td className="py-3 px-4 text-center flex justify-center space-x-2">
                              <button onClick={() => openTeamModal(team)} className="text-emerald-400 hover:text-emerald-300 p-1"><Edit3 className="w-4 h-4"/></button>
                              <button onClick={() => handleDeleteTeam(team.id)} className="text-rose-400 hover:text-rose-300 p-1"><Trash2 className="w-4 h-4"/></button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MATCHES WITH EMOJI REACTIONS */}
            {activeSection === 'matches' && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6">
                <h3 className="text-xl font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-4 mb-4">
                  <Flame className="w-5 h-5 text-amber-400" /><span>Matches & Fixtures</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map((match) => {
                    const homeTeam = teams.find((t) => t.id === match.homeTeamId);
                    const awayTeam = teams.find((t) => t.id === match.awayTeamId);
                    const reactions = matchReactions[match.id] || {};

                    return (
                      <div key={match.id} className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3 relative">
                        {isAdmin && (
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <button onClick={() => openFixtureModal(match)} className="text-amber-400 p-1"><Edit3 className="w-3.5 h-3.5"/></button>
                            <button onClick={() => handleDeleteFixture(match.id)} className="text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5"/></button>
                          </div>
                        )}
                        <div className="text-xs text-slate-400 font-semibold bg-emerald-950/60 inline-block px-2 py-1 rounded text-emerald-400">
                          GW {match.gameweek} • {match.date}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-center flex-1">
                            <MediaRenderer url={homeTeam?.logo || ''} className="w-10 h-10 mx-auto rounded-full" />
                            <p className="text-sm font-bold mt-1">{homeTeam?.name || 'TBD'}</p>
                          </div>
                          <div className="px-4 text-center">
                            {match.status === 'Completed' ? (
                              <div className="bg-slate-900 border border-slate-700 px-3 py-1 rounded text-lg font-black text-amber-400">{match.homeScore} - {match.awayScore}</div>
                            ) : (
                              <div className="text-slate-500 font-bold">VS</div>
                            )}
                          </div>
                          <div className="text-center flex-1">
                            <MediaRenderer url={awayTeam?.logo || ''} className="w-10 h-10 mx-auto rounded-full" />
                            <p className="text-sm font-bold mt-1">{awayTeam?.name || 'TBD'}</p>
                          </div>
                        </div>

                        {/* REACTION EMOJIS */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">React:</span>
                          <div className="flex space-x-1.5">
                            {['🔥', '⚽', '👏', '❤️', '😮'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleEmojiReaction(match.id, emoji)}
                                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-2 py-1 text-xs transition-transform active:scale-125 flex items-center space-x-1"
                              >
                                <span>{emoji}</span>
                                {reactions[emoji] ? (
                                  <span className="text-[10px] font-bold text-amber-400 ml-0.5">{reactions[emoji]}</span>
                                ) : null}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 pt-2 border-t border-slate-800 flex justify-between items-center">
                          <span>{match.venue}</span>
                          {isAdmin && (
                            <button onClick={() => { setEditingMatch(match); setMatchScore({ home: match.homeScore || 0, away: match.awayScore || 0 }); }} className="text-emerald-400 font-bold">
                              Update Score
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PUBLIC MESSAGES & REPLIES */}
            {activeSection === 'messages' && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-6">
                <h3 className="text-xl font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-4">
                  <MessageSquare className="w-5 h-5 text-blue-400" /><span>Public Messages & Discussion Board</span>
                </h3>
                
                <form onSubmit={handlePostMessage} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ask a question or post a message</h4>
                  <input type="text" placeholder="Your Name" required value={newMessage.sender} onChange={e => setNewMessage({...newMessage, sender: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                  <textarea placeholder="Write a message about matches, league inquiries, or general updates..." required value={newMessage.text} onChange={e => setNewMessage({...newMessage, text: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white h-24" />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg text-sm w-full flex justify-center items-center space-x-2">
                    <Send className="w-4 h-4" /><span>Post Public Message</span>
                  </button>
                </form>

                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No messages yet. Be the first to ask!</p>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3 relative">
                        {isAdmin && (
                          <button onClick={() => deleteMessage(msg.id)} className="absolute top-3 right-3 text-rose-500 hover:text-rose-400 p-1" title="Delete Message (Admin Only)">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        )}
                        
                        <div>
                          <p className="font-bold text-emerald-400 text-sm">{msg.sender} <span className="text-slate-500 text-xs font-normal ml-2">{msg.timestamp}</span></p>
                          <p className="text-slate-200 text-sm mt-1">{msg.text}</p>
                        </div>

                        {msg.replies && msg.replies.length > 0 && (
                          <div className="pl-4 border-l-2 border-emerald-600/40 space-y-2 mt-3 bg-slate-900/60 p-3 rounded-lg">
                            <p className="text-[11px] font-bold text-slate-400 uppercase">Public Replies ({msg.replies.length})</p>
                            {msg.replies.map((rep) => (
                              <div key={rep.id} className="bg-slate-950 p-2.5 rounded border border-slate-800 relative">
                                {isAdmin && (
                                  <button onClick={() => deleteReply(msg.id, rep.id)} className="absolute top-2 right-2 text-rose-500 p-1" title="Delete Reply (Admin Only)">
                                    <Trash2 className="w-3.5 h-3.5"/>
                                  </button>
                                )}
                                <p className="text-xs font-bold text-amber-400">{rep.sender} <span className="text-slate-500 text-[10px] font-normal ml-1">{rep.timestamp}</span></p>
                                <p className="text-xs text-slate-300 mt-0.5">{rep.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-2">
                          {activeReplyId === msg.id ? (
                            <form onSubmit={(e) => handlePostReply(e, msg.id)} className="space-y-2 bg-slate-900 p-3 rounded-lg border border-slate-800">
                              <input type="text" placeholder="Your Name" required value={replyForm.sender} onChange={e => setReplyForm({...replyForm, sender: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                              <textarea placeholder="Write a reply..." required value={replyForm.text} onChange={e => setReplyForm({...replyForm, text: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white h-16" />
                              <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setActiveReplyId(null)} className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs">Cancel</button>
                                <button type="submit" className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs">Post Reply</button>
                              </div>
                            </form>
                          ) : (
                            <button onClick={() => { setActiveReplyId(msg.id); setReplyForm({ sender: '', text: '' }); }} className="text-xs text-blue-400 font-bold hover:underline flex items-center space-x-1">
                              <MessageSquare className="w-3 h-3" /><span>Reply Publicly</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* LEAGUE OFFICIALS & TEAM REPRESENTATIVES */}
            {activeSection === 'officials' && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-8">
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-4 mb-4">
                    <UserCheck className="w-5 h-5 text-purple-400" /><span>Executive League Officials</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {executiveOfficials.map((off) => (
                      <div key={off.role} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded">{off.role}</span>
                        <p className="text-lg font-bold text-white mt-2">{off.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{off.phone}</p>
                        <p className="text-[11px] text-emerald-400 mt-0.5">{off.email}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
                    <Shield className="w-5 h-5 text-emerald-400" /><span>Team Officials Table (1 Representative Per Team)</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-xs text-slate-400 uppercase border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">TEAM</th>
                          <th className="py-3 px-4">OFFICIAL REPRESENTATIVE</th>
                          <th className="py-3 px-4">ROLE</th>
                          <th className="py-3 px-4">CONTACT</th>
                          {isAdmin && <th className="py-3 px-4 text-center">ACTION</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {teams.map((team) => {
                          const official = teamOfficials[team.id];
                          return (
                            <tr key={team.id} className="hover:bg-slate-800/40">
                              <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                                <MediaRenderer url={team.logo} className="w-6 h-6 rounded-full" />
                                <span>{team.name}</span>
                              </td>
                              <td className="py-3 px-4 text-emerald-400 font-semibold">
                                {official ? official.officialName : <span className="text-slate-500 italic">Not Assigned</span>}
                              </td>
                              <td className="py-3 px-4 text-slate-300">{official?.role || 'Team Representative'}</td>
                              <td className="py-3 px-4 text-slate-400">{official?.phone || 'N/A'}</td>
                              {isAdmin && (
                                <td className="py-3 px-4 text-center">
                                  <button onClick={() => { setEditingOfficialTeamId(team.id); setOfficialForm(official || { officialName: '', role: 'Team Representative', phone: '' }); }} className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2.5 py-1 rounded font-bold">
                                    Edit Official
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* STATS & PLAYERS */}
            {activeSection === 'stats' && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-6">
                <h3 className="text-xl font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-4">
                  <Star className="w-5 h-5 text-amber-400" /><span>Awards & Highlights</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Player of the Day */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center relative overflow-hidden group">
                    <h4 className="text-emerald-400 font-black uppercase tracking-wider mb-3">Player of the Day</h4>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-3 border border-slate-800 bg-slate-900 flex justify-center items-center">
                       <MediaRenderer url={potd.mediaUrl} className="w-full h-full object-contain" />
                    </div>
                    <p className="text-xl font-bold text-white">{potd.name}</p>
                    <p className="text-sm text-slate-400">{potd.team}</p>
                    {isAdmin && (
                      <button onClick={() => { setEditingPlayerType('potd'); setPlayerForm({ name: potd.name, context: potd.team, mediaUrl: potd.mediaUrl }); setShowEditPlayerModal(true); }} className="absolute top-2 right-2 bg-slate-800 p-2 rounded-lg text-emerald-400">
                        <Edit3 className="w-4 h-4"/>
                      </button>
                    )}
                  </div>
                  {/* Player of the Match */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center relative overflow-hidden group">
                    <h4 className="text-amber-400 font-black uppercase tracking-wider mb-3">Player of the Match</h4>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-3 border border-slate-800 bg-slate-900 flex justify-center items-center">
                       <MediaRenderer url={potm.mediaUrl} className="w-full h-full object-contain" />
                    </div>
                    <p className="text-xl font-bold text-white">{potm.name}</p>
                    <p className="text-sm text-slate-400">{potm.match}</p>
                    {isAdmin && (
                      <button onClick={() => { setEditingPlayerType('potm'); setPlayerForm({ name: potm.name, context: potm.match, mediaUrl: potm.mediaUrl }); setShowEditPlayerModal(true); }} className="absolute top-2 right-2 bg-slate-800 p-2 rounded-lg text-amber-400">
                        <Edit3 className="w-4 h-4"/>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TEAM COMMENTS */}
            {activeSection === 'comments' && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6">
                <h3 className="text-xl font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-4 mb-4">
                  <Users className="w-5 h-5 text-rose-400" /><span>Team Performance Comments</span>
                </h3>
                <form onSubmit={handlePostComment} className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 space-y-3">
                  <select required value={newComment.teamName} onChange={e => setNewComment({...newComment, teamName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white">
                    <option value="">Select a team to comment on...</option>
                    {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                  <textarea placeholder="Share your thoughts on their recent performance..." required value={newComment.comment} onChange={e => setNewComment({...newComment, comment: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white h-24" />
                  <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-lg text-sm w-full">Post Comment</button>
                </form>
                <div className="space-y-3">
                  {teamComments.length === 0 ? <p className="text-slate-500 text-sm italic">No comments yet. Support your favorite team!</p> : teamComments.map(c => (
                    <div key={c.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 relative">
                      {isAdmin && <button onClick={() => deleteComment(c.id)} className="absolute top-3 right-3 text-rose-500 p-1" title="Delete Comment (Admin Only)"><Trash2 className="w-4 h-4"/></button>}
                      <p className="font-bold text-amber-400 text-sm mb-1">Regarding: {c.teamName} <span className="text-slate-500 text-xs font-normal ml-2">{c.timestamp}</span></p>
                      <p className="text-slate-300 text-sm">{c.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABOUT, LOCATION, CONTACTS */}
            {(activeSection === 'about' || activeSection === 'location' || activeSection === 'contacts') && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 relative">
                {isAdmin && !editingInfo && (
                  <button onClick={() => setEditingInfo(true)} className="absolute top-6 right-6 text-emerald-400 text-sm font-bold flex items-center space-x-1"><Edit3 className="w-4 h-4"/><span>Edit Details</span></button>
                )}
                <h3 className="text-xl font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-4 mb-4 capitalize">
                  <Info className="w-5 h-5 text-blue-400" /><span>League {activeSection}</span>
                </h3>
                
                {editingInfo ? (
                  <form onSubmit={(e) => { 
                      e.preventDefault(); 
                      setLeagueInfo(tempInfo); 
                      setEditingInfo(false); 
                      fetch(`${BACKEND_URL}/api/info`, {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${adminToken}`
                        },
                        body: JSON.stringify(tempInfo)
                      }).catch(console.error);
                  }} className="space-y-4">
                    {Object.keys(tempInfo).map((key) => (
                      <div key={key}>
                        <label className="block text-xs uppercase text-slate-400 mb-1">{key}</label>
                        <textarea value={(tempInfo as any)[key]} onChange={(e) => setTempInfo({...tempInfo, [key]: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white" />
                      </div>
                    ))}
                    <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl">Save Information</button>
                  </form>
                ) : (
                  <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                    {activeSection === 'about' && <p>{leagueInfo.about}</p>}
                    {activeSection === 'location' && (
                      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                        <p className="font-bold text-emerald-400 mb-2">Venues & Regions</p>
                        <p>{leagueInfo.location}</p>
                        <p className="mt-2 text-slate-400">{leagueInfo.address}</p>
                      </div>
                    )}
                    {activeSection === 'contacts' && (
                      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                        <p className="flex items-center space-x-3"><Phone className="w-5 h-5 text-emerald-400"/><span>{leagueInfo.phone}</span></p>
                        <p className="flex items-center space-x-3"><Mail className="w-5 h-5 text-teal-400"/><span>{leagueInfo.email}</span></p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* --- LANDING PAGE MEDIA TOOL MODAL --- */}
      {showHeroMediaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowHeroMediaModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-white flex items-center mb-4"><Video className="w-5 h-5 text-emerald-400 mr-2"/> Add Hero Media to Landing Page</h3>
            <form onSubmit={handleAddHeroMedia} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Image or Video URL</label>
                <input type="url" required placeholder="https://... (.jpg, .png, or .mp4 URL)" value={newHeroMediaUrl} onChange={(e) => setNewHeroMediaUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title / Caption</label>
                <input type="text" placeholder="e.g. Gameweek Highlights" value={newHeroMediaTitle} onChange={(e) => setNewHeroMediaTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white" />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl">Add to Landing Showcase</button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT TEAM OFFICIAL MODAL --- */}
      {editingOfficialTeamId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setEditingOfficialTeamId(null)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-white mb-4">Edit Team Official</h3>
            <form onSubmit={handleSaveTeamOfficial} className="space-y-4">
              <input type="text" placeholder="Official Representative Name" required value={officialForm.officialName} onChange={e => setOfficialForm({...officialForm, officialName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white" />
              <input type="text" placeholder="Role (e.g. Manager / Official)" value={officialForm.role} onChange={e => setOfficialForm({...officialForm, role: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white" />
              <input type="text" placeholder="Phone Number" value={officialForm.phone} onChange={e => setOfficialForm({...officialForm, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white" />
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl mt-4">Save Team Representative</button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADMIN LOGIN MODAL --- */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => { 
                setShowAdminModal(false); 
                setShowUniversalPassword(false);
                setAdminError(''); 
              }} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white flex items-center mb-4">
              <Lock className="w-5 h-5 text-amber-400 mr-2"/> Authorized Login
            </h3>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Passcode</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={adminPassword} 
                    onChange={(e) => setAdminPassword(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white pr-10" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Trigger */}
              <div className="flex justify-start">
                <button 
                  type="button" 
                  onClick={() => setShowUniversalPassword(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

             {/* Universal Password Reveal */}
              {showUniversalPassword && (
                <div className="bg-slate-950 border border-amber-500/30 p-3 rounded-xl text-center shadow-inner">
                  <p className="text-xs text-slate-400 mb-1">Use the universal passcode:</p>
                  <p className="text-sm font-black text-amber-400 tracking-widest">KIMBIMBI254</p> 
                </div>
              )}

              {adminError && <p className="text-rose-500 text-xs font-bold">{adminError}</p>}
              
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors mt-2">
                Unlock System
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TEAM MODAL (ADD / EDIT) --- */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowTeamModal(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-white mb-4">{editingTeam ? 'Edit Team Details' : 'Register New Team'}</h3>
            <form onSubmit={handleSaveTeam} className="space-y-4">
              <input type="text" placeholder="Team Name" required value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white" />
              <input type="text" placeholder="Location/Town" required value={teamForm.town} onChange={e => setTeamForm({...teamForm, town: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white" />
              <div>
                <label className="block text-xs text-slate-400 mb-1 flex items-center"><Video className="w-3 h-3 mr-1"/> Media URL (Image or .mp4)</label>
                <input type="url" placeholder="https://... image or video" value={teamForm.logo} onChange={e => setTeamForm({...teamForm, logo: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white" />
              </div>
              
              {editingTeam && (
                <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-4 mt-2">
                  <div className="col-span-3 text-xs text-amber-400 font-bold mb-1">Manual Override Stats</div>
                  {['played', 'won', 'drawn', 'lost', 'gf', 'ga', 'points'].map((stat) => (
                    <div key={stat}>
                      <label className="block text-[10px] uppercase text-slate-500">{stat}</label>
                      <input type="number" value={(teamForm as any)[stat]} onChange={e => setTeamForm({...teamForm, [stat]: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-sm text-white" />
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl mt-4">Save Team</button>
            </form>
          </div>
        </div>
      )}

      {/* --- FIXTURE MODAL (ADD / EDIT) --- */}
      {showFixtureModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowFixtureModal(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-white mb-4">{editingFixture ? 'Edit Fixture Details' : 'Add New Fixture'}</h3>
            <form onSubmit={handleSaveFixture} className="space-y-4">
              <select required value={fixtureForm.homeTeamId} onChange={e => setFixtureForm({...fixtureForm, homeTeamId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white">
                <option value="">Select Home Team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select required value={fixtureForm.awayTeamId} onChange={e => setFixtureForm({...fixtureForm, awayTeamId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white">
                <option value="">Select Away Team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input type="number" placeholder="Gameweek" value={fixtureForm.gameweek} onChange={e => setFixtureForm({...fixtureForm, gameweek: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white" />
              <input type="text" placeholder="Date (e.g. 2026-09-20 15:00)" value={fixtureForm.date} onChange={e => setFixtureForm({...fixtureForm, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white" />
              <input type="text" placeholder="Venue" value={fixtureForm.venue} onChange={e => setFixtureForm({...fixtureForm, venue: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white" />
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl mt-4">Save Fixture</button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MATCH SCORE MODAL --- */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 relative text-center">
            <button onClick={() => setEditingMatch(null)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-white mb-4">Update Final Score</h3>
            <form onSubmit={handleUpdateScore} className="space-y-4">
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1 truncate">{teams.find(t=>t.id===editingMatch.homeTeamId)?.name}</label>
                  <input type="number" min="0" value={matchScore.home} onChange={e=>setMatchScore({...matchScore, home: parseInt(e.target.value)||0})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xl text-center font-bold text-white"/>
                </div>
                <span className="font-bold text-slate-600">VS</span>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1 truncate">{teams.find(t=>t.id===editingMatch.awayTeamId)?.name}</label>
                  <input type="number" min="0" value={matchScore.away} onChange={e=>setMatchScore({...matchScore, away: parseInt(e.target.value)||0})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xl text-center font-bold text-white"/>
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl">Confirm Result</button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PLAYER OF THE DAY / MATCH MODAL --- */}
      {showEditPlayerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowEditPlayerModal(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-white mb-4 capitalize">Update {editingPlayerType === 'potd' ? 'Player of the Day' : 'Player of the Match'}</h3>
            <form onSubmit={handleSavePlayer} className="space-y-4">
              <input type="text" placeholder="Player Name" required value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white" />
              <input type="text" placeholder={editingPlayerType === 'potd' ? "Team Name" : "Match Played"} required value={playerForm.context} onChange={e => setPlayerForm({...playerForm, context: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white" />
              <div>
                <label className="block text-xs text-slate-400 mb-1 flex items-center"><Video className="w-3 h-3 mr-1"/> Media URL (Image or .mp4)</label>
                <input type="url" placeholder="https://..." value={playerForm.mediaUrl} onChange={e => setPlayerForm({...playerForm, mediaUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white" />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl mt-4">Save Player Highlight</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
