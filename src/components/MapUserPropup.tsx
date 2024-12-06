import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SignOutButton from "./SignOutButton";
import { User } from "lucide-react";

interface Props {
  isLoggedIn: boolean;
}

const MapUserPopup = ({ isLoggedIn }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={popupRef} className="fixed top-3 right-3 inline-block popup-profile z-[9999]">
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[160px]">
          {isLoggedIn ? (
            <ul className="divide-y divide-gray-200">
              <li>
                <SignOutButton />
              </li>
            </ul>
          ) : (
            <ul className="divide-y divide-gray-200">
              <li>
                <Link
                  to="/sign-in"
                  className="block py-2 px-4 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="block py-2 px-4 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
      <button
        onClick={togglePopup}
        className="flex gap-2 items-center text-3xl px-2 lg:py-2 rounded-sm bg-white shadow-lg hover:text-blue-700"
      >
        <User className="h-6 w-6" />
      </button>
    </div>
  );
};

export default MapUserPopup;
