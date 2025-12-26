export default function Loading({ fullscreen = false }) {
  if (fullscreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }
  return <div className="flex justify-center p-8"><span className="loading loading-spinner text-primary"></span></div>;
}
