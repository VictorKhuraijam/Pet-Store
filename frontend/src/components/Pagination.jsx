

const Pagination = ({ currentPage, totalPages, paginate }) => {
  const pageNumbers = [];

  // Generate page numbers array
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Limit visible page numbers
  const getVisiblePageNumbers = () => {
    if (totalPages <= 7) {
      return pageNumbers;
    }

    if (currentPage <= 4) {
      return [...pageNumbers.slice(0, 5), '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', ...pageNumbers.slice(totalPages - 5)];
    }

    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages
    ];
  };

  return (
    <div className="flex justify-center mt-8 mb-4">
      <nav className="inline-flex">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-l-md border ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>

        {getVisiblePageNumbers().map((number, index) => (
          number === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1 border-t border-b bg-white text-gray-700">
              ...
            </span>
          ) : (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-3 py-1 border-t border-b ${
                currentPage === number
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          )
        ))}

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-r-md border ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
