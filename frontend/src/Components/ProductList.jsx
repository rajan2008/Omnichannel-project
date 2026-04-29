import { useState } from "react";

const productsData = [
  {
    _id: "1",
    name: "Nike Air Max",
    brand: "Nike",
    category: "Footwear",
    basePrice: 5000,
    discount: 10,
    stock: 50,
    images: ["https://via.placeholder.com/300"]
  },
  {
    _id: "2",
    name: "Adidas Hoodie",
    brand: "Adidas",
    category: "Clothing",
    basePrice: 2500,
    discount: 15,
    stock: 30,
    images: ["https://via.placeholder.com/300"]
  },
  {
    _id: "3",
    name: "Apple iPhone 14",
    brand: "Apple",
    category: "Electronics",
    basePrice: 75000,
    discount: 5,
    stock: 15,
    images: ["https://via.placeholder.com/300"]
  }
];

const ProductList = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const getFinalPrice = (price, discount) => {
    return Math.round(price - (price * discount) / 100);
  };

  const filteredProducts = productsData.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "low") {
      return getFinalPrice(a.basePrice, a.discount) - getFinalPrice(b.basePrice, b.discount);
    }
    if (sort === "high") {
      return getFinalPrice(b.basePrice, b.discount) - getFinalPrice(a.basePrice, a.discount);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 md:px-12 py-10">

      {/* 🔷 Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Explore Products
        </h1>

        <p className="text-gray-500 text-sm">
          Discover premium collections ✨
        </p>
      </div>

      {/* 🔍 Search + Sort */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">

        <input
          type="text"
          placeholder="Search products..."
          className="w-full md:w-1/2 px-5 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-black outline-none shadow-md"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="w-full md:w-1/4 px-5 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-black outline-none shadow-md"
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
        </select>
      </div>

      {/* 🛍 Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {sortedProducts.map((product) => {
          const finalPrice = getFinalPrice(product.basePrice, product.discount);

          return (
            <div
              key={product._id}
              className="group relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-md hover:shadow-2xl transition duration-500 border border-gray-200 overflow-hidden"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-tr from-black/5 to-transparent"></div>

              {/* 🖼 Image */}
              <div className="relative overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-56 object-cover group-hover:scale-110 transition duration-500"
                />

                {/* 🔥 Discount Badge */}
                <span className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1 rounded-full shadow-lg">
                  {product.discount}% OFF
                </span>
              </div>

              {/* 📦 Info */}
              <div className="p-6 relative z-10">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-black transition">
                  {product.name}
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  {product.brand} • {product.category}
                </p>

                {/* 💰 Price */}
                <div className="flex items-center gap-3 mt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{finalPrice}
                  </p>
                  <p className="text-gray-400 line-through text-sm">
                    ₹{product.basePrice}
                  </p>
                </div>

                {/* 📦 Stock */}
                <p
                  className={`text-sm mt-2 font-medium ${
                    product.stock > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </p>

                {/* 🛒 Button */}
                <button className="mt-6 w-full bg-black text-white py-3 rounded-2xl font-medium tracking-wide hover:bg-gray-900 active:scale-95 transition duration-300">
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;