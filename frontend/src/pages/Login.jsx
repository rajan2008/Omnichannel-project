import IMAGE from '../assets/image.jpg';

const colors = {
  primary: "#060606",
  background: "#E0E0E0",
  disabled: "#D9D9D9",
};

const Login = () => {
  return (
    <div className="w-full h-screen flex">
      
      {/* LEFT SIDE */}
      <div className="relative w-1/2 h-full">
        <img
          src={IMAGE}
          alt="login visual"
          className="w-full h-full object-cover"
        />

        <div className="absolute top-[20%] left-[10%] text-white">
          <h1 className="text-4xl font-bold my-4">
            Turn Ideas into Reality
          </h1>
          <p className="text-xl">
            Start for free and get attractive offers from the community
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
            <h3 className="text-3xl font-semibold mb-2">Login</h3>
            <p className="text-base">
              Welcome Back! Please enter your details.
            </p>
          </div>

          <div className="w-full flex flex-col">
            <input
              type="email"
              placeholder="Email"
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none"
            />
          </div>

          {/* Checkbox + Forgot */}
          <div className="w-full flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" />
              Remember me
            </label>

            <p className="text-sm cursor-pointer text-blue-500">
              Forgot Password?
            </p>
          </div>

          {/* Button */}
          <button className="w-full bg-black text-white py-3 mt-6 rounded-md hover:bg-gray-800 transition">
            Login
          </button>

        </div>

        <p className="text-sm text-center">
          Don’t have an account?{" "}
          <span className="text-blue-500 cursor-pointer">
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
};

export default Login;