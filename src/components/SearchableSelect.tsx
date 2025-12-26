import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    error?: boolean;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select option...',
    disabled = false,
    label,
    error
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(option => option.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            <div
                className={`
                    w-full px-3 py-2 border rounded-lg flex items-center justify-between cursor-pointer bg-white
                    ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'hover:border-blue-400 focus:ring-2 focus:ring-blue-500'}
                    ${error ? 'border-red-500' : isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'}
                `}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0" />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-100">
                        <input
                            type="text"
                            className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                No results found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`
                                        flex items-center justify-between px-3 py-2 text-sm cursor-pointer
                                        ${option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'}
                                    `}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.value === value && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
