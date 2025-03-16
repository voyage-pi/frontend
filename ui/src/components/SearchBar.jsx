import { FaSistrix } from "react-icons/fa6";

function SearchBar({ 
  searchTerm, 
  setSearchTerm, 
  onCreateNew, 
  createButtonText,
  placeholder
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="relative w-full max-w-full mr-2">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <FaSistrix className="z-50 opacity-50 text-2xl" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          className="input bg-white w-full pl-11 pr-4 rounded-full text-lg shadow-sm focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <button 
        className="btn btn-primary normal-case rounded-full flex items-center gap-2 px-6"
        onClick={onCreateNew}
      >
        <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center -ml-5">
          <span className="text-primary text-3xl font-light">+</span>
        </div>
        <span className="text-primary-content text-lg font-bold ml-2">{createButtonText}</span>
      </button>
    </div>
  );
}

export default SearchBar;