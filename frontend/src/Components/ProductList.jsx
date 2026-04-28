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
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 p-6">

      {/* 🔍 Search + Sort */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        
        <input
          type="text"
          placeholder="🔍 Search products..."
          className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none shadow-sm"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="w-full md:w-1/4 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none shadow-sm"
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="low">Price Low → High</option>
          <option value="high">Price High → Low</option>
        </select>
      </div>

      {/* 🛍 Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedProducts.map((product) => {
          const finalPrice = getFinalPrice(product.basePrice, product.discount);

          return (
            <div
              key={product._id}
              className="group bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden"
            >
              {/* 🖼 Image */}
              <div className="relative overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-52 object-cover group-hover:scale-110 transition duration-300"
                />

                {/* 🔥 Discount Badge */}
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {product.discount}% OFF
                </span>
              </div>

              {/* 📦 Info */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  {product.brand} • {product.category}
                </p>

                {/* 💰 Price */}
                <div className="flex items-center gap-2 mt-3">
                  <p className="text-green-600 font-bold text-xl">
                    ₹{finalPrice}
                  </p>
                  <p className="text-gray-400 line-through text-sm">
                    ₹{product.basePrice}
                  </p>
                </div>

                {/* 📦 Stock */}
                <p className="text-sm mt-1 text-gray-600">
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </p>

                {/* 🛒 Button */}
                <button className="mt-4 w-full bg-black text-white py-2 rounded-xl hover:bg-gray-800 active:scale-95 transition">
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