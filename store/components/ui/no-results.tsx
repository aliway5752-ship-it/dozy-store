import Link from "next/link";

const NoResults = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-neutral-500 py-12">
            <p className="mb-4">No results found.</p>
            <Link
                href="/"
                className="inline-block bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
                Continue Shopping
            </Link>
        </div>
     );
}
 
export default NoResults;