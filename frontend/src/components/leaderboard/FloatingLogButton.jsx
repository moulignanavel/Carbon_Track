import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function FloatingLogButton({ onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/activities');
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Log new activity"
      className="
        fixed bottom-6 right-24 z-40
        flex items-center gap-2.5 px-5 py-3.5 rounded-full
        bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400
        text-white font-extrabold text-sm tracking-wide
        shadow-[0_10px_25px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_35px_rgba(16,185,129,0.5)]
        transition-all duration-300 transform hover:scale-105 active:scale-95
        border border-emerald-300/40
      "
    >
      <Plus className="w-5 h-5 stroke-[3]" />
      <span className="hidden sm:inline">Log Activity</span>
    </button>
  );
}
