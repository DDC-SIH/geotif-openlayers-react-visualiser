import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SignOutButton from "./SignOutButton";
import { User } from "lucide-react";
import { Button } from "./ui/button";

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
    <div ref={popupRef} className="relative">
      {isOpen && (
        <div className="absolute left-full bottom-0  bg-neutral-800  border border-neutral-900  min-w-[160px]">
          {isLoggedIn ? (
            <ul className="divide-y divide-neutral-900 text-white">
              <li>
                <SignOutButton />
              </li>
            </ul>
          ) : (
            <ul className="divide-y divide-neutral-900 text-white">
              <li>
                <Link
                  to="/sign-in"
                  className="block py-2 px-4 hover:bg-neutral-900 text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="block py-2 px-4 hover:bg-neutral-900 text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
      <Button
      size="icon"
      variant={"ghost"}
        onClick={togglePopup}
        className="rounded-none p-8  hover:bg-neutral-800"
      >
        <User className="h-8 w-8 text-white " />
      </Button>
    </div>
  );
};

export default MapUserPopup;
