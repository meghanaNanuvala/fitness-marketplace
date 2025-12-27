import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import image2 from '../../assets/images/image2.jpg';

const API = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

type RegisterFormData = {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

type Toast = {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
};

export default function Register(): React.ReactElement {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [toast, setToast] = useState<Toast>({ message: '', type: 'success', show: false });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    setToast({ message, type, show: true });
    setTimeout(() => {
      setToast({ message: '', type: 'success', show: false });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    } as RegisterFormData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.fullName || !formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      showToast('All fields are required', 'error');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      showToast('Passwords do not match', 'error');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      showToast('Password must be at least 8 characters', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Registration successful! Please login.', 'success');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        const errorMessage = data.detail || 'Registration failed';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Registration error:', err);
      setError('Network error. Please try again.');
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {toast.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-semibold shadow-xl animate-pulse z-50 text-lg max-w-xs ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="hidden lg:flex w-1/2 bg-teal-700 items-center justify-center p-10 relative overflow-hidden">
  <img 
    src={image2} 
    alt="Healthcare illustration" 
    className="absolute inset-0 w-full h-full object-cover opacity-100"
  />
  
  <div className="absolute inset-0 bg-gray-900/70"></div>
  
  <div className="relative z-10 text-white text-center">
    <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">Join Fitness Marketplace</h1>
    <p className="text-lg mb-6 opacity-90 drop-shadow-lg">Connect with buyers and sellers of quality fitness equipment</p>
    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
      <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 shadow-lg">
        <div className="text-3xl mb-2">💪</div>
        <p className="font-bold text-sm text-white drop-shadow-md">Quality Equipment</p>
      </div>
      <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 shadow-lg">
        <div className="text-3xl mb-2">⚡</div>
        <p className="font-bold text-sm text-white drop-shadow-md">Fast Deals</p>
      </div>
      <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 shadow-lg">
        <div className="text-3xl mb-2">🔒</div>
        <p className="font-bold text-sm text-white drop-shadow-md">Secure Payments</p>
      </div>
      <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 shadow-lg">
        <div className="text-3xl mb-2">🏋️</div>
        <p className="font-bold text-sm text-white drop-shadow-md">Verified Sellers</p>
      </div>
    </div>
  </div>
</div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">Registration</h2>
            <p className="text-base text-gray-500">Join the Fitness Marketplace  network</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded-lg mb-4">
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input 
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Smith" 
                  required 
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input 
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johnsmith123" 
                  required 
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com" 
                  required 
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password" 
                  required 
                  className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password" 
                  required 
                  className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <input type="checkbox" required className="w-4 h-4 mt-1 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the <a href="#" className="text-teal-600 hover:text-teal-700 font-semibold">Terms of Service</a> and <a href="#" className="text-teal-600 hover:text-teal-700 font-semibold">Privacy Policy</a>
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-2 rounded-lg text-base font-semibold hover:bg-teal-700 transform hover:scale-[1.01] transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Already have an account?{" "}
            <a href="/" className="font-semibold text-teal-600 hover:text-teal-700 transition">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
