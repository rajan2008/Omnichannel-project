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
    images: ["https://via.placeholder.com/200"]
  },
  {
    _id: "2",
    name: "Adidas Hoodie",
    brand: "Adidas",
    category: "Clothing",
    basePrice: 2500,
    discount: 15,
    stock: 30,
    images: ["https://via.placeholder.com/200"]
  },
  {
    _id: "3",
    name: "Apple iPhone 14",
    brand: "Apple",
    category: "Electronics",
    basePrice: 75000,
    discount: 5,
    stock: 15,
    images: ["https://via.placeholder.com/200"]
  }
];

const ProductList = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  // 💰 Discount price calculation
  const getFinalPrice = (price, discount) => {
    return Math.round(price - (price * discount) / 100);
  };

  // 🔍 Filter
  const filteredProducts = productsData.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // 🔃 Sort
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
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* 🔍 Search + Sort */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search product..."
          className="p-3 rounded-lg border w-full md:w-1/2"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-3 rounded-lg border w-full md:w-1/4"
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="low">Price Low → High</option>
          <option value="high">Price High → Low</option>
        </select>
      </div>

      {/* 🛍 Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((product) => {
          const finalPrice = getFinalPrice(product.basePrice, product.discount);

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition"
            >
              {/* 🖼 Image */}
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              {/* 📦 Info */}
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-gray-500 text-sm">
                {product.brand} • {product.category}
              </p>

              {/* 💰 Price */}
              <p className="text-green-600 font-bold text-xl mt-2">
                ₹{finalPrice}
              </p>

              {/* 📦 Stock */}
              <p className="text-gray-600 text-sm mt-1">
                Stock: {product.stock}
              </p>

              {/* 🛒 Button */}
              <button className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">
                Add to Cart
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;