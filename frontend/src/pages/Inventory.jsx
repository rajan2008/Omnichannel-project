import React, { useEffect, useState } from "react";
import { getProducts } from "../api/productApi.js";
import SearchBar from "../Components/SearchBar.jsx";
import useDebounce from "../Utils/hooks/useDebounce.js";
import Sidebar from "../Components/Sidebar.jsx";
import RoleWrapper from "../Components/RoleWrapper.jsx";
import AddProductModal from "../Components/modal/AddProductModal.jsx";
import BulkUploadModal from "../Components/modal/BulkUploadModal.jsx";
import { useSelector } from "react-redux";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const user = useSelector((state) => state.auth.user);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [openSingle, setOpenSingle] = useState(false);
const [openBulk, setOpenBulk] = useState(false);
  const fetchProducts = async (pageNumber = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsFetchingMore(true);
      } else {
        setLoading(true);
      }

      const data = await getProducts(debouncedSearch.trim(), pageNumber);

      setProducts((prev) =>
        isLoadMore ? [...prev, ...data.products] : data.products,
      );

      setPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [debouncedSearch]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100 &&
        page < totalPages &&
        !isFetchingMore
      ) {
        fetchProducts(page + 1, true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, totalPages, isFetchingMore]);

  useEffect(() => {
    let result = [...products];

    // 🔍 Search
    if (search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // 📂 Category
    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    // 🔽 Sort
    if (sortBy === "price-low")
      result.sort((a, b) => a.basePrice - b.basePrice);
    else if (sortBy === "price-high")
      result.sort((a, b) => b.basePrice - a.basePrice);
    else if (sortBy === "name")
      result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "newest") result.reverse();

    setFilteredProducts(result);
  }, [search, category, sortBy, products]);
return (
  <RoleWrapper allowedRoles={["admin", "manager", "cashier"]}>
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar */}
      <div className="sticky top-0 h-screen">
        <Sidebar
          user={user}
          activeTab="inventory"
          setActiveTab={() => {}}
          isSidebarOpen={true}
          setIsSidebarOpen={() => {}}
          logout={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          onOpenCart={() => {}}
          cartCount={0}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">

        {/* Header / Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-5 space-y-4">

          <SearchBar
            search={search}
            setSearch={setSearch}
            data={products}
            category={category}
            setCategory={setCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          <div className="flex flex-wrap gap-3">
            
            <RoleWrapper allowedRoles={["admin"]}>
              <button
                onClick={() => setOpenBulk(true)}
                className="bg-purple-600 hover:bg-purple-700 transition text-white px-5 py-2 rounded-lg shadow"
              >
                Bulk Upload
              </button>
            </RoleWrapper>

            <RoleWrapper allowedRoles={["admin", "manager"]}>
              <button
                onClick={() => setOpenSingle(true)}
                className="bg-black hover:bg-gray-800 transition text-white px-5 py-2 rounded-lg shadow"
              >
                + Add Product
              </button>
            </RoleWrapper>

          </div>
        </div>

        {/* Loading */}
        {loading && page === 1 && (
          <p className="text-center text-gray-500">Loading...</p>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((item) => (
            <div
              key={item._id}
              className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg text-gray-800">
                {item.name}
              </h3>

              <p className="text-green-600 font-medium mt-2">
                ₹{item.basePrice}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Stock: {item.stock}
              </p>
            </div>
          ))}
        </div>

        {/* Load More */}
        {page < totalPages && (
          <div className="text-center mt-8">
            <button
              onClick={() => fetchProducts(page + 1, true)}
              disabled={isFetchingMore}
              className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {isFetchingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {/* Bottom Loading */}
        {loading && page > 1 && (
          <p className="text-center mt-4 text-gray-500">
            Loading more...
          </p>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <p className="text-center mt-10 text-gray-500">
            No Products Found
          </p>
        )}
      </div>
    </div>
    {/* Modals (ADD HERE 👇) */}
<AddProductModal
  isOpen={openSingle}
  onClose={() => setOpenSingle(false)}
  refreshProducts={() => fetchProducts(1, false)}
/>

<BulkUploadModal
  isOpen={openBulk}
  onClose={() => setOpenBulk(false)}
  refreshProducts={() => fetchProducts(1, false)}
/>
  </RoleWrapper>
  
);
};

export default Inventory;
