import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success(res.data.message || "Login Successful");

      navigate("/home");
    } catch (error) {
      console.log("❌ LOGIN ERROR", error.response?.data);

      toast.error(
        error.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d111b] flex items-center justify-center p-4">

      {/* Main Card */}
      <div className="w-full max-w-[1220px] min-h-[750px] grid grid-cols-1 lg:grid-cols-2 rounded-[28px] overflow-hidden border border-white/10 shadow-2xl">

        {/* =====================================
            LEFT SIDE
        ===================================== */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#263452] via-[#1d2738] to-[#173a3b] p-10 lg:p-14 flex flex-col">

          {/* Background Glow */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-[#172033] rounded-md" />
            </div>

            <h1 className="text-2xl font-bold text-white">
              QuickTalk
            </h1>

          </div>

          {/* Chat Preview */}
          <div className="relative z-10 flex-1 flex flex-col justify-center mt-10">

            {/* Incoming Message */}
            <div className="self-start">

              <div className="bg-[#252d40]/90 border border-white/5 rounded-2xl rounded-bl-md px-5 py-4 max-w-[410px] shadow-lg">

                <p className="text-white text-base lg:text-lg">
                  Hey! How's the new project coming along?
                </p>

                <p className="text-xs text-blue-300/70 mt-2">
                  10:41 PM
                </p>

              </div>

            </div>

            {/* Sent Message */}
            <div className="self-end mt-3">

              <div className="bg-[#4167c2] rounded-2xl rounded-br-md px-5 py-4 max-w-[400px] shadow-lg">

                <p className="text-white text-base lg:text-lg">
                  Building a real-time chat app 🔥
                </p>

                <p className="text-xs text-blue-100/70 mt-2">
                  10:41 PM
                </p>

              </div>

            </div>

            {/* Incoming Message */}
            <div className="self-start mt-3">

              <div className="bg-[#252d40]/90 border border-white/5 rounded-2xl rounded-bl-md px-5 py-4 max-w-[300px] shadow-lg">

                <p className="text-white text-base lg:text-lg">
                  Is the login page done too?
                </p>

                <p className="text-xs text-blue-300/70 mt-2">
                  10:42 PM
                </p>

              </div>

            </div>

            {/* Typing */}
            <div className="flex items-center gap-3 mt-5">

              <div className="w-8 h-8 rounded-full bg-[#536484] relative">
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#263452]" />
              </div>

              <div className="bg-[#252d40] rounded-full px-4 py-2 flex gap-1">

                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />

              </div>

            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2 mt-8 text-emerald-400 text-sm">

              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

              <span>
                LIVE — socket connected
              </span>

            </div>

          </div>

        </div>


        {/* =====================================
            RIGHT SIDE
        ===================================== */}
        <div className="bg-[#171b26] p-8 sm:p-12 lg:p-14 flex items-center">

          <div className="w-full max-w-[490px] mx-auto">

            {/* Heading */}
            <div className="mb-9">

              <h2 className="text-4xl font-bold text-white tracking-tight">
                Welcome back
              </h2>

              <p className="text-[#8f9bb8] mt-2 text-base">
                Sign in to your account to keep the conversations going.
              </p>

            </div>


            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>

                <label className="block text-[#9eabd0] text-sm font-medium mb-2">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-[54px] px-4 rounded-xl bg-[#202533] border border-[#2c3446] text-white placeholder-[#5d6780] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />

              </div>


              {/* Password */}
              <div>

                <label className="block text-[#9eabd0] text-sm font-medium mb-2">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-[54px] px-4 rounded-xl bg-[#202533] border border-[#2c3446] text-white placeholder-[#5d6780] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />

              </div>


              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-sm">

                <label className="flex items-center gap-2 text-[#9aa6c1] cursor-pointer">

                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500"
                  />

                  <span>
                    Remember me
                  </span>

                </label>

                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-300 transition"
                >
                  Forgot password?
                </button>

              </div>


              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[54px] bg-gradient-to-r from-[#5688ed] to-[#4777d9] hover:from-[#6192f4] hover:to-[#5182e5] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>

            </form>


            {/* Divider */}
            <div className="flex items-center gap-4 my-8">

              <div className="flex-1 h-px bg-[#2b3140]" />

              <span className="text-sm text-[#7e89a3]">
                or continue with
              </span>

              <div className="flex-1 h-px bg-[#2b3140]" />

            </div>


            {/* Social Buttons */}
            <div>
  <button
    type="button"
    className="w-full h-12 rounded-xl bg-[#1e2330] border border-[#2b3140] text-white hover:bg-[#252b3a] transition"
  >
    Continue with Google
  </button>
</div>


            {/* Signup */}
            <p className="text-center text-[#8994ae] mt-8">

              New here?{" "}

              <Link
                to="/signup"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition"
              >
                Create an account
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;