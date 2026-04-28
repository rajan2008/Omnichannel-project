import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance.js";

const Search = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (pageNumber = 1, isLoadMore = false) => {
    try {
      setLoading(true);

      let url = `/inventory?page=${pageNumber}&limit=10`;
      if (search.trim()) url += `&search=${search.trim()}`;

      const res = await api.get(url);

      if (isLoadMore) {
        setProducts((prev) => [...prev, ...res.data.products]);
      } else {
        setProducts(res.data.products);
      }

      setPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts(1);
  }, []);

  // Search debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchProducts(1, false);
    }, 1000);

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <div className="p-5">

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search products..."
          className="border px-3 py-2 w-full max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && page === 1 && <p>Loading...</p>}

      {/* Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((item) => (
          <div key={item._id} className="border p-4 rounded shadow-sm">
            <h3 className="font-semibold">{item.name}</h3>
            <p>₹{item.basePrice}</p>
            <p>Stock: {item.stock}</p>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {page < totalPages && !loading && (
        <div className="text-center mt-6">
          <button
            onClick={() => fetchProducts(page + 1, true)}
            className="bg-black text-white px-6 py-2 rounded"
          >
            Load More
          </button>
        </div>
      )}

      {/* Bottom Loader */}
      {loading && page > 1 && (
        <p className="text-center mt-4">Loading more...</p>
      )}

      {/* No Data */}
      {!loading && products.length === 0 && (
        <p className="text-center mt-5">No Products Found</p>
      )}
    </div>
  );
};

export default Search;