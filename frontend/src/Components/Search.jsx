import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const Search = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  console.log(products);
  
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);


  const fetchProducts = async (isLoadMore = false) => {
    try {
      setLoading(true);

      let url = `/inventory?limit=10`;

      if (search) url += `&search=${search}`;
      if (isLoadMore && cursor) url += `&cursor=${cursor}`;

      const res = await api.get(url);
      console.log(res.data);
      

      if (isLoadMore) {
        setProducts((prev) => [...prev, ...res.data.products]);
      } else {
        setProducts(res.data.products);
      }

      setCursor(res.data.nextCursor);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  useEffect(() => {
    const delay = setTimeout(() => {
      setCursor(null);
      fetchProducts();
    }, 500);

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <div className="p-5">

      <div className="w-full max-w-lg mx-auto mb-6">
        <div className="flex items-center border rounded-lg overflow-hidden shadow-md">
          
          <span className="px-3 text-gray-400">🔍</span>

          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-2 py-3 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="bg-blue-500 text-white px-4 py-3">
            Search
          </button>
        </div>
      </div>

      {loading && <p className="text-center">Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((item) => (
          <div key={item._id} className="border p-4 rounded shadow-sm">
            <h3 className="font-semibold">{item.name}</h3>
            <p>₹{item.basePrice}</p>
            <p>Stock: {item.stock}</p>
          </div>
        ))}
      </div>

      {cursor && !loading && (
        <div className="text-center mt-5">
          <button
            onClick={() => fetchProducts(true)}
            className="bg-black text-white px-6 py-2 rounded"
          >
            Load More
          </button>
        </div>
      )}

      {!loading && products.length === 0 && (
        <p className="text-center mt-5">No Products Found</p>
      )}

    </div>
  );
};

export default Search;