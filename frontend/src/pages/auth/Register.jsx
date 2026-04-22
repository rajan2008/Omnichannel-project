import { useState } from "react";
import IMAGE from "../../assets/image.jpg";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.phone) {
      alert("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!form.agree) {
      alert("Please accept terms & conditions");
      return;
    }

    console.log("Form Data:", form);

    // 👉 API CALL HERE
    // axios.post("/register", form)
  };

  return (
    <div className="w-full h-screen flex bg-[#E0E0E0]">

      {/* LEFT SIDE (Same as Login UI) */}
      <div className="w-1/2 h-full">
        <img
          src={IMAGE}
          alt="register"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="w-1/2 h-full bg-[#f5f5f5] flex flex-col justify-center px-20">

        <div className="mb-8">
          <h1 className="text-xl font-semibold">LEDGR</h1>
          <p className="text-sm text-gray-600">Retail Operating System</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">

          <h2 className="text-3xl font-semibold mb-2">Sign Up</h2>
          <p className="text-gray-600 mb-6">
            Create your account to get started
          </p>

          {/* INPUTS */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full py-2 mb-4 bg-transparent border-b border-black outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full py-2 mb-4 bg-transparent border-b border-black outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full py-2 mb-4 bg-transparent border-b border-black outline-none"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="w-full py-2 mb-4 bg-transparent border-b border-black outline-none"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            className="w-full py-2 mb-4 bg-transparent border-b border-black outline-none"
          />

          {/* TERMS */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="agree"
                onChange={handleChange}
              />
              I agree to Terms & Conditions
            </label>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition"
          >
            Register
          </button>

          {/* LOGIN LINK */}
          <p className="text-center mt-6 text-sm">
            Already have an account?{" "}
            <span className="text-blue-500 cursor-pointer">
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;