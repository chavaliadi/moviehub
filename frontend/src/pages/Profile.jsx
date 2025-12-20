import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMovieContext } from "../contexts/MovieContext";
import { User, Heart, Settings as SettingsIcon, Calendar } from "lucide-react";
import "../css/Profile.css";

function Profile() {
    const { user } = useAuth();
    const { favourites } = useMovieContext();
    const navigate = useNavigate();

    if (!user) return null;

    const memberSince = new Date(user.created_at || Date.now()).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="profile-page container">
            <div className="profile-header glass-panel">
                <div className="profile-cover">
                    <div className="profile-avatar-wrapper">
                        <img
                            src={user.profile_picture}
                            alt={user.name}
                            className="profile-avatar-large"
                        />
                    </div>
                </div>

                <div className="profile-info">
                    <h1 className="profile-name">{user.name}</h1>
                    <p className="profile-email">{user.email}</p>

                    <div className="profile-badges">
                        <span className="badge">
                            <Calendar size={14} />
                            Member since {memberSince}
                        </span>
                    </div>

                    <button
                        className="edit-profile-btn glass-panel"
                        onClick={() => navigate('/settings')}
                    >
                        <SettingsIcon size={16} />
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="profile-stats-grid">
                <div className="stat-card glass-panel">
                    <div className="stat-icon-wrapper heart">
                        <Heart size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Favorites</h3>
                        <p className="stat-number">{favourites.length}</p>
                    </div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon-wrapper user">
                        <User size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Account Type</h3>
                        <p className="stat-value">Free Member</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
