import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Save, Lock, User as UserIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import "../css/Settings.css";

function Settings() {
    const { user, updateProfile, changePassword } = useAuth();

    // Profile State
    const [name, setName] = useState(user?.name || "");
    const [profileStatus, setProfileStatus] = useState({ type: '', msg: '' });
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passStatus, setPassStatus] = useState({ type: '', msg: '' });
    const [isPassLoading, setIsPassLoading] = useState(false);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsProfileLoading(true);
        setProfileStatus({ type: '', msg: '' });

        const result = await updateProfile(name);
        if (result.success) {
            setProfileStatus({ type: 'success', msg: 'Profile updated successfully!' });
        } else {
            setProfileStatus({ type: 'error', msg: result.error });
        }
        setIsProfileLoading(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPassStatus({ type: 'error', msg: "New passwords don't match" });
            return;
        }

        setIsPassLoading(true);
        setPassStatus({ type: '', msg: '' });

        const result = await changePassword(currentPassword, newPassword);
        if (result.success) {
            setPassStatus({ type: 'success', msg: 'Password changed successfully!' });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } else {
            setPassStatus({ type: 'error', msg: result.error });
        }
        setIsPassLoading(false);
    };

    return (
        <div className="settings-page container">
            <h1 className="page-title">Settings</h1>

            <div className="settings-grid">
                {/* Profile Settings */}
                <div className="settings-card glass-panel">
                    <div className="card-header">
                        <UserIcon className="card-icon" />
                        <h2>Profile Information</h2>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="settings-form">
                        <div className="form-group">
                            <label>Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="settings-input"
                                placeholder="Your Name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={user?.email}
                                disabled
                                className="settings-input disabled"
                            />
                            <span className="input-hint">Email cannot be changed</span>
                        </div>

                        {profileStatus.msg && (
                            <div className={`status-msg ${profileStatus.type}`}>
                                {profileStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                {profileStatus.msg}
                            </div>
                        )}

                        <button type="submit" className="save-btn" disabled={isProfileLoading}>
                            {isProfileLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>

                {/* Password Settings */}
                <div className="settings-card glass-panel">
                    <div className="card-header">
                        <Lock className="card-icon" />
                        <h2>Security</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="settings-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="settings-input"
                                placeholder="••••••"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="settings-input"
                                    placeholder="••••••"
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm New</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="settings-input"
                                    placeholder="••••••"
                                />
                            </div>
                        </div>

                        {passStatus.msg && (
                            <div className={`status-msg ${passStatus.type}`}>
                                {passStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                {passStatus.msg}
                            </div>
                        )}

                        <button type="submit" className="save-btn" disabled={isPassLoading}>
                            {isPassLoading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Settings;
