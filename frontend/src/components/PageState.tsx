interface LoadingSkeletonProps {
    cards?: number;
}

interface EmptyStateProps {
    message: string;
}

interface ErrorStateProps {
    message?: string;
}

export const LoadingSkeleton = ({cards = 3}: LoadingSkeletonProps) => {
    return (
        <>
            {Array.from({length: cards}).map((_, index) => (
                <div className="card skeleton-card" key={`skeleton-${index}`}>
                    <div className="skeleton-line w-40"/>
                    <div className="skeleton-line w-100"/>
                    <div className="skeleton-line w-70"/>
                </div>
            ))}
        </>
    )
}

export const EmptyState = ({message}: EmptyStateProps) => {
    return (
        <div className="card">
            <p className="empty-state">{message}</p>
        </div>
    )
}

export const ErrorState = ({message = 'Something went wrong. Please try again.'}: ErrorStateProps) => {
    return (
        <div className="card">
            <p className="empty-state">{message}</p>
        </div>
    )
}

