
type LoaderProps = {
  message?: string;
};

export function CustomLoader({ message = "Loading" }: LoaderProps) {
return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          {/* Inner pulsing dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-1">
          {message}
        </h3>
        <p className="text-sm text-gray-500">Please wait a moment...</p>
      </div>
    </div>
  );
} 