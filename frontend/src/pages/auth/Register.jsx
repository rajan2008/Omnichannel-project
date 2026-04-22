import IMAGE from '../../assets/image.jpg';

const colors = {
  primary: "#060606",
  background: "#E0E0E0",
  disabled: "#D9D9D9",
};

const Register = () => {
  const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone :""
});

const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};
  return (
    <div className="w-full h-screen flex">
      
      {/* LEFT SIDE */}
      <div className="relative w-1/2 h-full">
        <img
          src={IMAGE}
          alt="register visual"
          className="w-full h-full object-cover"
        />

        <div className="absolute top-[20%] left-[10%] text-white">
          <h1 className="text-4xl font-bold my-4">
            Join the Community
          </h1>
          <p className="text-xl">
            Create your account and start your journey today
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-1/2 h-full bg-[#f5f5f5] flex flex-col justify-between p-20">
        
        <h1 className="text-xl font-semibold text-[#060606]">
          Interactive Brand
        </h1>

        <div className="w-full flex flex-col">
          
          <div className="mb-6">
            <h3 className="text-3xl font-semibold mb-2">Register</h3>
            <p className="text-base">
              Please fill in the details to create an account.
            </p>
          </div>

          <div className="w-full flex flex-col">
            <input
              type="text"
              name='name'
               onChange={handleChange}
              placeholder="Full Name"
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none"
            />

            <input
              type="email"
              placeholder="Email"
              name="email" 
              onChange={handleChange}
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              name="password" 
              onChange={handleChange}
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword" 
              onChange={handleChange}
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none"
            />

            <input
              type="Number"
              placeholder="Enter your number"
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none"
            />
          </div>

          {/* Terms */}
          <div className="w-full flex items-center mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" />
              I agree to the Terms & Conditions
            </label>
          </div>

          {/* Button */}
          <button className="w-full bg-black text-white py-3 mt-6 rounded-md hover:bg-gray-800 transition">
            Register
          </button>

        </div>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <span className="text-blue-500 cursor-pointer">
            Login
          </span>
        </p>

      </div>
    </div>
  );
};

export default Register;