/**
 * Empty Search Component
 *
 * This component displays a message when no search results are found.
 * It provides visual feedback and guidance to the user when their search
 * query doesn't match any learning modules.
 *
 * @param {Object} props - Component props
 * @param {string} props.query - The search query that yielded no results
 */
import { Search } from "lucide-react"

export function EmptySearch({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Search icon in a circular background */}
      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>

      {/* No results message */}
      <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>

      {/* Helpful suggestion */}
      <p className="text-muted-foreground max-w-md">
        We couldn't find any learning modules matching "{query}". Try using different keywords or browse by category.
      </p>
    </div>
  )
}
