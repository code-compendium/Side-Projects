export default function LoadingSpinner({ size = 24 }) {
  return (
    <span
      className="loading-spinner"
      style={{
        width: size,
        height: size,
        borderWidth: Math.max(2, size / 8),
      }}
      aria-label="Loading"
    />
  );
}
