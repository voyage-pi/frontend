import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const KeyWordsContent = () => {
  const [keywords, setKeywords] = useState([]);
  const [currentKeyword, setCurrentKeyword] = useState("");

  useEffect(() => {
    const savedKeywords = JSON.parse(localStorage.getItem("Keywords")) || [];
    if (savedKeywords.length > 0) {
      setKeywords(savedKeywords);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("Keywords", JSON.stringify(keywords));
  }, [keywords]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && currentKeyword.trim()) {
      e.preventDefault();
      if (!keywords.includes(currentKeyword.trim())) {
        setKeywords([...keywords, currentKeyword.trim()]);
        setCurrentKeyword("");
      }
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  return (
    <div className="h-[25rem]">
      <h2 className="text-3xl mb-10 text-center">
        Add <span className="text-primary">keywords</span> for your trip!
      </h2>
      
      <div className="flex flex-col items-center">
        {/* Input Box */}
        <div className="w-full max-w-2xl mb-6">
          <input
            type="text"
            value={currentKeyword}
            onChange={(e) => setCurrentKeyword(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none"
            placeholder="Type a keyword and press Enter..."
          />
        </div>

        {/* Keywords Display */}
        <div className="w-full max-w-2xl">
          {keywords.length === 0 ? (
            <div className="text-center text-gray-500">
              No keywords added yet. Start typing above!
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {keywords.map((keyword, index) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={index}
                    className="relative inline-block cursor-pointer"
                  >
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-full inline-flex items-center justify-center  transition-colors duration-200 group">
                      <div className="relative h-6 overflow-hidden">
                        <span className="inline-block transition-transform duration-200 group-hover:translate-y-[-100%]">
                          {keyword}
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center text-red-500 translate-y-[100%] transition-transform duration-200 group-hover:translate-y-0">
                          <FaTimes />
                        </span>
                      </div>
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="absolute inset-0 w-full h-full"
                        aria-label={`Remove ${keyword}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeyWordsContent;