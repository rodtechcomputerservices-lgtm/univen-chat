import React, { useState, useEffect } from "react";
import "./SingleMingle.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

function SingleMingle({ userId, username }) {
  const [connectionProfiles, setConnectionProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [userProfile, setUserProfile] = useState({
    age: "",
    faculty: "",
    bio: "",
    photos: [],
    interests: [],
    campusHotspots: [],
    lookingFor: "Friends",
    music: [],
    hobbies: []
  });
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [matches, setMatches] = useState([]);
  const [compatibility, setCompatibility] = useState({ score: 0, common: {} });
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [newMatch, setNewMatch] = useState(null);
  const [userGender, setUserGender] = useState("");

  useEffect(() => {
    fetchConnectionProfiles();
    fetchMatches(userId);
    fetchUserGender();
  }, [userId]);

  const fetchUserGender = async () => {
    try {
      const response = await fetch(`${API_URL}/api/profile/${username}`);
      const user = await response.json();
      setUserGender(user.gender || "");
    } catch (error) {
      console.error('Error fetching user gender:', error);
    }
  };

  const fetchConnectionProfiles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/connections`);
      const data = await response.json();
      // Filter out current user and filter by opposite gender
      const filtered = data.filter(p => {
        if (p.user.toString() === userId) return false;
        if (userGender === 'Male' && p.user.gender === 'Male') return false;
        if (userGender === 'Female' && p.user.gender === 'Female') return false;
        return true;
      });
      setConnectionProfiles(filtered);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchMatches = async (uid) => {
    try {
      const response = await fetch(`${API_URL}/api/connections/matches/${uid}`);
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const createConnectionProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/connections/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, ...userProfile })
      });
      await response.json();
      alert('Profile created! ✅');
      setShowProfileForm(false);
      fetchConnectionProfiles();
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile');
    }
  };

  const likeProfile = async (likedId) => {
    try {
      const response = await fetch(`${API_URL}/api/connections/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likerId: userId, likedId })
      });
      const data = await response.json();
      if (data.match) {
        setNewMatch(data);
        setShowMatchPopup(true);
        fetchMatches(userId);
      }
      setCurrentProfileIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error liking:', error);
    }
  };

  const passProfile = async (passedId) => {
    try {
      await fetch(`${API_URL}/api/connections/pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passerId: userId, passedId })
      });
      setCurrentProfileIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error passing:', error);
    }
  };

  const calculateCompatibility = async (profileId) => {
    try {
      const response = await fetch(`${API_URL}/api/connections/compatibility/${userId}/${profileId}`);
      const data = await response.json();
      setCompatibility(data);
    } catch (error) {
      console.error('Error calculating compatibility:', error);
    }
  };

  if (showProfileForm) {
    return (
      <div className="single-mingle-container">
        <div className="connections-header">
          <h2>💕 Create Your Profile</h2>
          <button className="btn-secondary" onClick={() => setShowProfileForm(false)}>Cancel</button>
        </div>
        <div className="form-container">
          <input
            type="number"
            placeholder="Age"
            value={userProfile.age}
            onChange={(e) => setUserProfile({...userProfile, age: e.target.value})}
          />
          <input
            type="text"
            placeholder="Faculty"
            value={userProfile.faculty}
            onChange={(e) => setUserProfile({...userProfile, faculty: e.target.value})}
          />
          <textarea
            placeholder="Bio (keep it fun!)"
            value={userProfile.bio}
            onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
          />
          <select
            value={userProfile.lookingFor}
            onChange={(e) => setUserProfile({...userProfile, lookingFor: e.target.value})}
          >
            <option value="Friends">Friends</option>
            <option value="Study Buddy">Study Buddy</option>
            <option value="Partner">Looking for a Partner</option>
            <option value="Business Collab">Business Collab</option>
          </select>
          <input
            type="text"
            placeholder="Interests (comma separated)"
            value={userProfile.interests.join(', ')}
            onChange={(e) => setUserProfile({...userProfile, interests: e.target.value.split(',').map(i => i.trim())})}
          />
          <input
            type="text"
            placeholder="Music (comma separated)"
            value={userProfile.music.join(', ')}
            onChange={(e) => setUserProfile({...userProfile, music: e.target.value.split(',').map(m => m.trim())})}
          />
          <input
            type="text"
            placeholder="Campus Hotspots (e.g., Block 6, Library)"
            value={userProfile.campusHotspots.join(', ')}
            onChange={(e) => setUserProfile({...userProfile, campusHotspots: e.target.value.split(',').map(h => h.trim())})}
          />
          <button className="btn-primary" onClick={createConnectionProfile}>Save Profile</button>
        </div>
      </div>
    );
  }

  return (
    <div className="single-mingle-container">
      <div className="connections-header">
        <h2>💕 Single & Mingle</h2>
        <button className="btn-primary" onClick={() => setShowProfileForm(true)}>
          Create My Profile
        </button>
      </div>

      {matches.length > 0 && (
        <div className="matches-section">
          <h3>💕 Your Matches ({matches.length})</h3>
          <div className="matches-grid">
            {matches.map(match => {
              const otherUser = match.user1.toString() === userId ? match.user2 : match.user1;
              return (
                <div key={match._id} className="match-card">
                  <div className="match-avatar">
                    {otherUser.avatar ? (
                      <img src={otherUser.avatar} alt="" />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <h4>{otherUser.displayName || otherUser.username}</h4>
                  <button className="btn-message">💬 Message</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {connectionProfiles.length > 0 && currentProfileIndex < connectionProfiles.length ? (
        <div className="card-stack">
          {connectionProfiles.slice(currentProfileIndex, currentProfileIndex + 1).map(profile => (
            <div
              key={profile._id}
              className="connection-card"
              onClick={() => calculateCompatibility(profile.user)}
            >
              <div className="card-photo">
                {profile.photos && profile.photos.length > 0 ? (
                  <img src={profile.photos[0]} alt={profile.displayName} />
                ) : (
                  <div className="photo-placeholder">👤</div>
                )}
                <div className="intent-badge">
                  {profile.lookingFor === 'Partner' && '🟢 Looking for a Partner'}
                  {profile.lookingFor === 'Study Buddy' && '🔵 Study Buddy'}
                  {profile.lookingFor === 'Business Collab' && '🟡 Business Collab'}
                  {profile.lookingFor === 'Friends' && '🟣 Friends'}
                </div>
              </div>
              <div className="card-info">
                <h3>{profile.displayName || profile.username}, {profile.age}</h3>
                <p className="card-faculty">📚 {profile.faculty}</p>
                {compatibility.score > 0 && (
                  <div className="vibe-meter">
                    <div className="vibe-label">{compatibility.score}% Match</div>
                    <div className="vibe-progress">
                      <div className="vibe-fill" style={{width: `${compatibility.score}%`}}></div>
                    </div>
                    <p className="vibe-reason">
                      {compatibility.common.interests?.length > 0 && 
                        `Both love ${compatibility.common.interests.slice(0, 2).join(', ')}`}
                      {compatibility.common.music?.length > 0 && 
                        ` • ${compatibility.common.music[0]} music`}
                    </p>
                  </div>
                )}
                <div className="card-bio">
                  <p>{profile.bio}</p>
                </div>
                <div className="interests-grid">
                  {profile.interests?.slice(0, 5).map((interest, i) => (
                    <span key={i} className="interest-chip">✨ {interest}</span>
                  ))}
                </div>
                <div className="campus-hotspots">
                  <h4>📍 Find me at...</h4>
                  {profile.campusHotspots?.map((spot, i) => (
                    <span key={i} className="hotspot-tag">{spot}</span>
                  ))}
                </div>
              </div>
              <div className="card-actions">
                <button className="btn-pass" onClick={() => passProfile(profile.user)}>✕</button>
                <button className="btn-like" onClick={() => likeProfile(profile.user)}>❤️</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-profiles">
          <h3>No more profiles! 🎉</h3>
          <p>Check back later for new connections</p>
        </div>
      )}

      {showMatchPopup && (
        <div className="modal-overlay" onClick={() => setShowMatchPopup(false)}>
          <div className="match-popup" onClick={(e) => e.stopPropagation()}>
            <div className="match-animation">💕</div>
            <h2>It's a Match!</h2>
            <p>You and {newMatch?.liked?.displayName} liked each other!</p>
            <button className="btn-primary" onClick={() => setShowMatchPopup(false)}>
              Keep Swiping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SingleMingle;