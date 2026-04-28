import React, { useState, useEffect } from 'react';
// Removed useNavigate as it's no longer needed
import { useToast } from '../../../../app/providers/ToastProvider';
import { Key, User, Shield, RefreshCw } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import LandingPage from '../../../landingpage/pages/LandingPage';
import ApiServices from '../../../../services/ApiServices';

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [captchaCode, setCaptchaCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const generateAndSetCaptcha = () => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setCaptchaCode(code);
    };

    useEffect(() => {
        generateAndSetCaptcha();
    }, []);

    const handleResetCaptcha = () => {
        generateAndSetCaptcha();
        setCaptcha(''); // Clear user input
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (captcha !== captchaCode) {
            showToast('Invalid captcha.', 'error');
            setIsLoading(false);
            handleResetCaptcha();
            return;
        }

        try {
            const response = await ApiServices.blogAdminLogin({ username, password });

            if (response?.data?.status === 'success') {
                showToast(response?.data?.message || 'Login Successful', 'success');

                const userObj = response?.data?.data || {};

                if (userObj) {
                    localStorage.setItem('admin_user', JSON.stringify(userObj)); 
                    
                    // Give a small delay for toast to show before hard redirect
                    setTimeout(() => {
                        window.location.href = '/admin/dashboard';
                    }, 1000);
                }
            } else {
                showToast(response.data.message || 'Invalid credentials.', 'error');
                handleResetCaptcha();
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Something went wrong';
            showToast(errorMsg, 'error');
            handleResetCaptcha();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-100 dark:bg-background-dark overflow-hidden">
            {/* Blurred Background */}
            <div className="absolute inset-0 filter blur-md brightness-75" style={{ transform: 'scale(1.05)' }}>
                <div className="h-full w-full overflow-hidden flex flex-col">
                    {/* We render the public layout structure here */}
                    <Header isSidebarOpen={false} />
                    <main className="flex-1">
                        <LandingPage />
                    </main>
                    <Footer />
                </div>
            </div>

            {/* Login Form Overlay */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                    {/* Left Side Illustration */}
                    <div className="hidden md:flex md:w-[45%] bg-secondary-50 dark:bg-secondary-800/50 items-center justify-center p-8">
                        <div className="relative w-full max-w-sm text-center">
                            <img
                                src="/Logo.svg"
                                alt="App Logo"
                                className="w-40 h-auto mx-auto mb-6"
                            />
                            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Admin Control Panel</h1>
                            <p className="text-secondary-500 dark:text-secondary-400 mt-2">
                                Secure access for administrators.
                            </p>
                        </div>
                    </div>

                    {/* Right Side Form */}
                    <div className="w-full md:w-[55%] p-8 sm:p-12 flex flex-col justify-center">
                        <div>
                            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white">Admin Login</h2>
                            <p className="text-secondary-500 dark:text-secondary-400 mt-2">
                                Please enter your credentials to proceed.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="username"
                                        type="text"
                                        autoComplete="username"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-[#b0cb1f]/50 transition-shadow"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="password"
                                        type="password"
                                        autoComplete="current-password"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-[#b0cb1f]/50 transition-shadow"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Captcha */}
                            <div>
                                <label htmlFor="captcha" className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                                    Captcha
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-grow">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            id="captcha"
                                            type="text"
                                            autoComplete="off"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-[#b0cb1f]/50 transition-shadow"
                                            placeholder="Enter code"
                                            value={captcha}
                                            onChange={(e) => setCaptcha(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="bg-gray-200 dark:bg-secondary-700 rounded-lg p-2 h-[50px] flex items-center justify-center select-none">
                                        <span className="text-2xl font-bold tracking-[.2em] text-gray-700 dark:text-gray-300" style={{ fontFamily: 'monospace' }}>
                                            {captchaCode}
                                        </span>
                                    </div>
                                    <button type="button" onClick={handleResetCaptcha} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-full transition-colors" title="Reset Captcha">
                                        <RefreshCw size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-[#b0cb1f] hover:bg-[#c5de3a] text-gray-900 px-5 py-3.5 rounded-xl font-semibold transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                                            <span>Signing In...</span>
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;