import { useState } from "react";
import LoginIllustration from "../assets/login.svg";
import { axiosUser } from "../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loginStatus, setLoginStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [placeholders, setPlaceholders] = useState({
    email: "voyage@gmail.com",
    password: "••••••••",
  });

  const { setUser, setIsAuthenticated, loadUserData } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
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

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setLoginStatus(null);

      const response = await axiosUser.post("/user/login", {
        email: formData.email,
        password: formData.password,
      });

       ;
      setLoginStatus({ type: "success", message: "Login successful!" });

      // Load user data after successful login
      try {
        await loadUserData();

        // Navigate to home page after successfully loading user data
        setTimeout(() => {
          navigate("/");
        }, 500);
      } catch (userError) {
         ;
        setLoginStatus({
          type: "error",
          message:
            "Login successful but failed to load user data. Please refresh the page.",
        });
      }
    } catch (error) {
       ;
      const errorMessage =
        error.response?.data?.message ||
        "Invalid credentials. Please try again.";
      setLoginStatus({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex md:w-1/2 bg-primary/5 flex-col justify-center items-center">
        <div className="flex justify-center">
          <img
            src={LoginIllustration}
            alt="Login Illustration"
            className="mb-6"
          />
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-medium text-secondary">
              Welcome Back
            </h1>
            <p className="text-gray-500 mt-2">
              Sign in to continue your journey with Voyage
            </p>
          </div>

          {loginStatus && (
            <div
              className={`mb-4 p-3 rounded-md ${
                loginStatus.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {loginStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend block text-sm font-medium text-secondary">
                Email
              </legend>
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
              <legend className="fieldset-legend block text-sm font-medium text-secondary">
                Password
              </legend>
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
              <a
                href="/forgot-password"
                className="text-primary hover:underline"
              >
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
              <Link
                to="/register"
                className="text-primary font-medium hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div className="h-px bg-slate-200 flex-grow"></div>
            <span className="px-4 text-sm text-slate-500">or</span>
            <div className="h-px bg-slate-200 flex-grow"></div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-slate-300 rounded-md hover:bg-slate-50 transition duration-200"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
