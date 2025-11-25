import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

const API_BASE = "http://localhost:3000";

const Books = () => {
  // Redux: Get user skills for default recommendations
  const userSkills = useSelector((state) => state.user.data.skills);
  
  // State
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null); // Controls the Modal

  // --- Fetch Function ---
  const fetchBooks = useCallback(async (query) => {
      if (!query) return;
      
      setLoading(true);
      setError('');
      
      try {
          const res = await fetch(`${API_BASE}/api/books?query=${encodeURIComponent(query)}`);
          if (!res.ok) throw new Error("Server connection failed");
          
          const data = await res.json();
          
          if(data.status === 'ok' && Array.isArray(data.books)) {
              setBooks(data.books);
          } else {
              setBooks([]);
          }
      } catch(e) { 
          console.error(e); 
          setError("Could not load books. Ensure backend is running.");
      } finally {
          setLoading(false);
      }
  }, []);

  // --- Initial Load ---
  useEffect(() => {
    // Load books based on first skill, or default to 'Python' if no skills
    if (books.length === 0) {
        const defaultQuery = userSkills.length > 0 ? userSkills[0].name : 'Python';
        fetchBooks(defaultQuery);
    }
  }, [userSkills, fetchBooks, books.length]);

  // --- Search Handlers ---
  const handleManualSearch = () => {
      if (searchTerm.trim()) fetchBooks(searchTerm);
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter') handleManualSearch();
  };

  // --- Download Handler ---
  const handleDownload = () => {
      if (!selectedBook || !selectedBook.download) return;
      
      // Open download in new tab
      const link = document.createElement('a');
      link.href = selectedBook.download;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="relative">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">📚 Free Books (dBooks)</h2>
      
      {/* --- SEARCH BAR --- */}
      <div className="flex gap-3 mb-6">
          <input 
            type="text" 
            placeholder="Search by topic (e.g. Java, Algorithms)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button 
            onClick={handleManualSearch}
            disabled={loading || !searchTerm.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg shadow-sm transition-colors"
          >
            {loading ? '...' : 'Search'}
          </button>
      </div>

      {/* --- BOOK GRID --- */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
            <p className="text-gray-700">
                {searchTerm ? (
                    <span>Results for: <strong>{searchTerm}</strong></span>
                ) : (
                    <span>Recommended for: <strong>{userSkills.length > 0 ? userSkills[0].name : 'Technology'}</strong></span>
                )}
            </p>
            <button 
                onClick={() => { setSearchTerm(''); fetchBooks('Technology'); }} 
                className="text-sm text-blue-600 hover:underline"
            >
                Reset
            </button>
        </div>
        
        {loading && <div className="text-center py-12 text-gray-500">Loading library...</div>}
        {error && <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded text-center">{error}</div>}

        {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {books.length > 0 ? books.map(book => (
                    <div key={book.id} className="bg-white p-4 border rounded-lg hover:shadow-lg transition-shadow flex flex-col items-center text-center group">
                        <div className="h-48 w-36 mb-3 overflow-hidden rounded shadow-sm relative bg-gray-100">
                            <img 
                                src={book.image} 
                                className="h-full w-full object-contain hover:scale-105 transition-transform duration-300" 
                                alt={book.title} 
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x200?text=No+Image'; }}
                            />
                        </div>
                        <h4 className="font-bold text-sm line-clamp-2 mb-1 text-gray-800" title={book.title}>{book.title}</h4>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-1">{book.authors}</p>
                        
                        <button 
                            onClick={() => setSelectedBook(book)}
                            className="mt-auto bg-blue-50 text-blue-700 px-4 py-2 rounded text-xs font-semibold hover:bg-blue-100 w-full"
                        >
                            View Details
                        </button>
                    </div>
                )) : (
                    <div className="col-span-full text-center py-10 text-gray-500 border-2 border-dashed rounded-lg">
                        No books found.
                    </div>
                )}
            </div>
        )}
      </div>

      {/* --- MODAL POPUP --- */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 truncate pr-4">{selectedBook.title}</h3>
                    <button onClick={() => setSelectedBook(null)} className="text-gray-400 hover:text-red-500 text-2xl leading-none">&times;</button>
                </div>

                <div className="p-6 flex gap-6 overflow-y-auto">
                    <img 
                        src={selectedBook.image} 
                        className="w-32 h-48 object-cover rounded shadow border flex-shrink-0"
                        alt="Cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/150x200?text=No+Image'; }}
                    />
                    <div>
                        <p className="text-sm text-gray-600 font-bold mb-1">{selectedBook.authors}</p>
                        <p className="text-xs text-gray-500 mb-3 italic">{selectedBook.subtitle}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {selectedBook.description}
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={() => setSelectedBook(null)} 
                        className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="px-4 py-2 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
                    >
                        <span>Download PDF</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Books;