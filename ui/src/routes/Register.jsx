import { useState } from "react";
import RegisterIllustration from "../assets/register.svg";
import { axiosUser } from "../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    tag: "",
    password: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [registerStatus, setRegisterStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [placeholders, setPlaceholders] = useState({
    username: "John Doe",
    email: "john.doe@example.com",
    tag: "johndoe",
    password: "••••••••",
    confirmPassword: "••••••••"
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "tag") {
      const cleanValue = value.startsWith('@') ? value.substring(1) : value;
      setFormData(prevState => ({
        ...prevState,
        [name]: cleanValue
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
    
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
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
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    try {
      setIsLoading(true);
      setRegisterStatus(null);
      
      const response = await axiosUser.post('/user/register', {
        name: formData.username,
        email: formData.email,
        tag: formData.tag,
        password: formData.password
      });
      
      setRegisterStatus({ type: 'success', message: response.data.message || 'Registration successful!' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Error during registration:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again later.';
      setRegisterStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsLoading(false);
    }
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
          
          {registerStatus && (
            <div className={`mb-4 p-3 rounded-md ${registerStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {registerStatus.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend block text-sm font-medium text-secondary">Username</legend>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                className="input w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={placeholders.username}
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
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                className="input w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={placeholders.email}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend block text-sm font-medium text-secondary">Tag</legend>
              <div className="flex rounded-md">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-gray-50 text-gray-500 text-sm">
                  @
                </span>
                <input
                  type="text"
                  id="tag"
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  required
                  className="input flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={placeholders.tag.replace('@', '')} 
                />
              </div>
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
            
            <fieldset className="fieldset">
              <legend className="fieldset-legend block text-sm font-medium text-secondary">Confirm Password</legend>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                className={`input w-full px-3 py-2 border ${passwordError ? "border-red-500" : "border-slate-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                placeholder={placeholders.confirmPassword}
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-500">{passwordError}</p>
              )}
            </fieldset>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition duration-200 disabled:bg-opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register; 