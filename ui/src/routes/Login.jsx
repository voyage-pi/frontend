import { useState } from "react";
import LoginIllustration from "../assets/login.svg";
import { axiosUser } from "../utils/axiosInstance";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loginStatus, setLoginStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [placeholders, setPlaceholders] = useState({
    email: "john.doe@example.com",
    password: "••••••••"
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    e.target.placeholder = "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value) {
      e.target.placeholder = placeholders[name];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setLoginStatus(null);
      
      const response = await axiosUser.post('/login', {
        email: formData.email,
        password: formData.password
      });
      
      setLoginStatus({ type: 'success', message: 'Login successful!' });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      setTimeout(() => {
        window.location.href = '/trips';
      }, 1000);
    } catch (error) {
      console.error('Error during login:', error);
      const errorMessage = error.response?.data?.message || 'Invalid credentials. Please try again.';
      setLoginStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex md:w-1/2 bg-primary/5 flex-col justify-center items-center">
          <div className="flex justify-center">
            <img src={LoginIllustration} alt="Login Illustration" className="mb-6" />
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-medium text-secondary">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to continue your journey with Voyage</p>
          </div>
          
          {loginStatus && (
            <div className={`mb-4 p-3 rounded-md ${loginStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {loginStatus.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend block text-sm font-medium text-secondary">Email Address</legend>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                className="input w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={placeholders.email}
              />
            </fieldset>
            
            <fieldset className="fieldset">
              <legend className="fieldset-legend block text-sm font-medium text-secondary">Password</legend>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                className="input w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={placeholders.password}
              />
            </fieldset>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-gray-600">
                  Remember me
                </label>
              </div>
              <a href="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition duration-200 disabled:bg-opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <a href="/register" className="text-primary font-medium hover:underline">
                Create account
              </a>
            </p>
          </div>
          
          <div className="mt-6 flex items-center justify-center">
            <div className="h-px bg-slate-200 flex-grow"></div>
            <span className="px-4 text-sm text-slate-500">or</span>
            <div className="h-px bg-slate-200 flex-grow"></div>
          </div>
          
          <div className="mt-6">
            <button
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-slate-300 rounded-md hover:bg-slate-50 transition duration-200"
            >
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 