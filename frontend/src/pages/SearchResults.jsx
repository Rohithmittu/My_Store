import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import ProductCard from "../components/ProductCard";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("query");
  const { fetchProductBySearch, products, loading } = useProductStore();

  useEffect(() => {
    if (searchQuery) {
      fetchProductBySearch(searchQuery);
    }
  }, [searchQuery, fetchProductBySearch]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4 text-violet-400">
        Search Results for: "{searchQuery}"
      </h2>

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-white">No products found for "{searchQuery}".</p>
      )}
    </div>
  );
};
export default SearchResults;
