import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import image1 from '../../assets/images/image1.png';

const API = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

type ForgotPasswordFormData = {
  email: string;
};

type Toast = {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
};

export default function ForgotPassword(): React.ReactElement {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: ''
  });
  const [error, setError] = useState<string>('');
  const [toast, setToast] = useState<Toast>({ message: '', type: 'success', show: false });
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
    } as ForgotPasswordFormData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // API Call to request the password reset link
    const apiUrl = `${API}/api/v1/users/forgot-password`; 

    try {
      const response = await fetch(apiUrl, {
        method: 'POST', // Crucial: Must be POST for submitting data
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      });

      // Check for the specific 405 error
      if (response.status === 405) {
          const errorMessage = 'API Error: Method Not Allowed (405). The server endpoint is not configured for POST requests.';
          setError(errorMessage);
          showToast(errorMessage, 'error');
          return;
      }

      const data = await response.json();

      if (response.ok) {
        // Success: API confirms the link was sent
        const message = data.message || 'Password reset link sent! Check your email inbox.';
        showToast(message, 'success');
        setFormData({ email: '' }); 

        // Redirect after a few seconds
        setTimeout(() => {
            navigate('/'); // Go back to login page
        }, 3000); // Redirect after toast finishes

      } else {
        // Server responded with an error (e.g., 400, 404)
        const errorMessage = data.detail || data.message || 'Failed to send reset link. Please try again.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Forgot Password error:', error);
      setError('Network error. Could not connect to the server.');
      showToast('Network error. Could not connect to the server.', 'error');
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

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">Forgot Password?</h2>
            <p className="text-base text-gray-500">Access your Fitness Marketplace  account</p>
          </div>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded-lg mb-4">
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input 
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address" 
                  required 
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-2 rounded-lg text-base font-semibold hover:bg-teal-700 transform hover:scale-[1.01] transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending reset link...' : 'Send Reset Link'}
            </button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-6 text-sm">
            Remember your Password?{" "}
            <a href="/" className="font-semibold text-teal-600 hover:text-teal-700 transition">
              Back to Login
            </a>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-teal-700 items-center justify-center p-10 relative overflow-hidden">
        <img 
          src={image1} 
          alt="Medical illustration" 
          className="absolute inset-0 w-full h-full object-cover opacity-100"
        />
        
        <div className="absolute inset-0 bg-gray-900/50 dark:bg-gray-900/60"></div>
        
        <div className="relative z-10 text-white text-center max-w-lg">
          <h1 className="text-4xl font-bold mb-4">Fitness Marketplace </h1>
          <p className="text-lg mb-6 opacity-90">Fitness equipment providers</p>
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm opacity-80">Fitness Products</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm opacity-80">Support Available</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm opacity-80">Verified Sellers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}