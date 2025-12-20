import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
    const { loginWithPassword, register } = useAuth();
    const navigate = useNavigate();

    // UI State
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Fun Validation
        if (!email && !password) {
            setError('Ghost user? We need an email and password to verify your existence!');
            setIsLoading(false);
            return;
        }

        if (!email) {
            setError('Who goes there? We need an email to know it’s you!');
            setIsLoading(false);
            return;
        }

        if (!password) {
            setError('Secret code missing! We can\'t let you in without the magic word.');
            setIsLoading(false);
            return;
        }

        if (!isLogin && !name) {
            setError('Don\'t be shy! Tell us your name.');
            setIsLoading(false);
            return;
        }

        let result;
        if (isLogin) {
            result = await loginWithPassword(email, password);
        } else {
            result = await register(email, password, name);
        }

        setIsLoading(false);

        if (result && result.success) {
            navigate('/');
        } else {
            setError(result?.error || 'Authentication failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                <p className="login-subtitle">
                    {isLogin
                        ? 'Sign in to access your movie collection'
                        : 'Join specific for personalized recommendations'}
                </p>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="input-group">
                            <User size={20} className="input-icon" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="auth-input"
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <Mail size={20} className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={20} className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                        />
                    </div>

                    <button className="auth-submit-btn" type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="spinner-sm" /> : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="auth-toggle">
                    <p>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            className="toggle-btn"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
