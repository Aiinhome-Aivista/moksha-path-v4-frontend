import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";

export interface Option {
    value: string | number;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    className?: string;
    dropdownClassName?: string;
    disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select...",
    className = "",
    dropdownClassName = "",
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                disabled={disabled}
                className={`${className} flex items-center justify-between ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
            </button>

            {isOpen && (
                <div
                    className={`absolute z-[9999] w-full bg-white border border-gray-200 rounded-xl shadow-lg left-0 flex flex-col ${dropdownClassName}`}
                >
                    <div className="p-2 border-b border-gray-100 flex items-center gap-2 sticky top-0 bg-white rounded-t-xl z-10">
                        {/* <Search className="w-4 h-4 text-gray-400 shrink-0" /> */}
                        <input
                            type="text"
                            className="w-full text-xs lg:text-sm outline-none bg-transparent text-gray-700"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange("");
                                setIsOpen(false);
                                setSearchTerm("");
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Reset Selection"
                        >
                            <RotateCcw className="w-4 h-4 shrink-0" />
                        </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    className={`px-3 py-2 text-xs lg:text-sm cursor-pointer transition-colors ${String(opt.value) === String(value)
                                        ? "bg-lime-100 text-gray-900 font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-xs lg:text-sm text-gray-500 text-center">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
