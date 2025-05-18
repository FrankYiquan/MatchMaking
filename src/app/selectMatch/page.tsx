// app/select-time/page.tsx
import MatchTimeSelector from "../component/matchTimeSelector";
export default function SelectTimePage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200 px-4 bg-gradient-animate">
      <MatchTimeSelector />
    </div>
  );
}
