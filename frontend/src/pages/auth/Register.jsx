import { useState } from "react";
import login from "../assets/image.jpg";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    country: "",
    pinCode: "",
    otp: "",
    gender: "",
    place: "",
  });

  const inputStyle =
    "w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOtp = () => {
    alert("OTP sent to mobile number");
  };

  const handleRegister = () => {
    console.log(formData);
    alert("User Registered Successfully");
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 overflow-hidden">
      
      {/* Background */}
      <div className="absolute w-100 h-100 bg-black rounded-full -top-25 -left-25 blur-sm opacity-60"></div>
      <div className="absolute w-125 h-125 bg-black rounded-full -bottom-37.5 -right-37.5 blur-sm opacity-20"></div>
      <div className="absolute w-75 h-75 bg-black rounded-full top-[40%] left-[60%] blur-2xl opacity-20"></div>

      {/* MAIN BOX */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden backdrop-blur-md bg-white/30 shadow-xl">
        
        {/* LEFT IMAGE */}
        <div className="hidden md:block md:w-1/2 relative">
          <img src={login} alt="visual" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-4xl font-bold tracking-widest mb-3">
                INFINITY
              </h1>
              <p className="text-sm p-4 text-gray-200">
                Manage your POS system efficiently with one powerful platform.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto max-h-screen">
          
          <p className="text-center text-gray-500">WELCOME TO</p>
          <h1 className="text-3xl font-bold text-center mb-4">INFINITY</h1>

          <p className="text-sm text-center text-gray-500 mb-4">
            Create your account to manage sales, inventory & customers.
          </p>

          <div className="flex flex-col">

            <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className={inputStyle} />

            <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className={inputStyle} />

            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputStyle} />

            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className={inputStyle} />

            <input type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} className={inputStyle} />

            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className={inputStyle} />

            <input type="text" name="place" placeholder="Place" value={formData.place} onChange={handleChange} className={inputStyle} />

            <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className={inputStyle} />

            <input type="text" name="pinCode" placeholder="Pin Code" value={formData.pinCode} onChange={handleChange} className={inputStyle} />

            {/* Gender */}
            <select name="gender" value={formData.gender} onChange={handleChange} className={inputStyle}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            {/* OTP */}
            <div className="flex gap-2">
              <input type="text" name="otp" placeholder="Enter OTP" value={formData.otp} onChange={handleChange} className={`${inputStyle} flex-1`} />
              <button type="button" onClick={handleSendOtp} className="bg-black text-white px-3 rounded-md">
                Send OTP
              </button>
            </div>

          </div>

          <button
            onClick={handleRegister}
            className="w-full bg-black text-white py-3 mt-6 rounded-md hover:bg-gray-800 transition"
          >
            Register
          </button>

          <p className="text-sm text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <span className="text-black cursor-pointer">Login</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;