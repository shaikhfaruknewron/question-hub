const Spinner = () => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"
    />
  );
};

export default Spinner;
