import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50],
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const [jumpValue, setJumpValue] = useState<string>(String(currentPage));

  useEffect(() => {
    setJumpValue(String(currentPage));
  }, [currentPage]);

  const handleJumpSubmit = () => {
    let pageNum = parseInt(jumpValue, 10);
    if (isNaN(pageNum)) {
      setJumpValue(String(currentPage));
      return;
    }
    if (pageNum < 1) pageNum = 1;
    if (pageNum > totalPages) pageNum = totalPages;
    onPageChange(pageNum);
    setJumpValue(String(pageNum));
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 text-xs text-slate-600 ${className}`}>
      {/* 1. Page numbers & prev/next buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 border border-slate-200/80 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="上一页"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {getPageNumbers().map((p, idx) => {
          if (typeof p === 'number') {
            const isActive = p === currentPage;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 flex items-center justify-center rounded font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-2xs cursor-default'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
                }`}
              >
                {p}
              </button>
            );
          }
          return (
            <span key={idx} className="w-5 text-center text-slate-400 select-none">
              ...
            </span>
          );
        })}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 border border-slate-200/80 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="下一页"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Quick Jump */}
      <div className="flex items-center gap-1 ml-0.5">
        <span>前往</span>
        <input
          type="text"
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onBlur={handleJumpSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleJumpSubmit();
          }}
          className="w-11 h-7 rounded border border-slate-200 text-center text-xs text-slate-700 font-mono bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
        />
        <span>页</span>
      </div>

      {/* 3. Page size select */}
      {onPageSizeChange && (
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="h-7 px-2 rounded border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}条/页
            </option>
          ))}
        </select>
      )}

      {/* 4. Total count */}
      <div className="text-slate-600">
        共 <span className="font-mono">{totalCount}</span> 条
      </div>
    </div>
  );
};

export default Pagination;
