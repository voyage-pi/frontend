import { useState } from "react";
import RegisterIllustration from "../assets/register.svg";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when either password field changes
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    console.log("Form submitted:", formData);
  };

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex md:w-1/2 bg-primary/5 flex-col justify-center items-center">
          <div className="flex justify-center">
            <img src={RegisterIllustration} alt="Registration Illustration" className="mb-6" />
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-medium text-secondary">Create an Account</h1>
            <p className="text-gray-500 mt-2">Join Voyage and start planning your next adventure</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend block text-sm font-medium text-secondary">Username</legend>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="input w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="John Doe"
              />
            </fieldset>
            
            <fieldset className="fieldset">
              <legend className="fieldset-legend block text-sm font-medium text-secondary">Email Address</legend>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="john.doe@example.com"
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
                required
                className="input w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </fieldset>
            
            <fieldset className="fieldset">
              <legend className="fieldset-legend block text-sm font-medium text-secondary">Confirm Password</legend>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`input w-full px-3 py-2 border ${passwordError ? "border-red-500" : "border-slate-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                placeholder="••••••••"
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-500">{passwordError}</p>
              )}
            </fieldset>
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition duration-200"
            >
              Create Account
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <a href="/login" className="text-primary font-medium hover:underline">
                Sign in
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
              Sign up with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register; 