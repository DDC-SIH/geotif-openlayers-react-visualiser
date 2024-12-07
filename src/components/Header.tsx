import { Link } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import PopupMenu from "./PopupMenu";

const Header = () => {
  const { isLoggedIn } = useAppContext();

  return (
    <>
      <header className="pb-6 bg-zinc-900 lg:pb-0">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 ">
          <nav className="flex items-center justify-between h-16 lg:h-20 bg-zinc-900 ">
            <div className="flex-shrink-0">
              <Link to="/" title="" className="flex items-center">
                <img
                  className="h-12 w-auto mr-2"
                  src="/isro.png"
                  alt="Vistaar"
                />
                <span className="ml-2 text-xl md:text-xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-blue-200">
                Vistaar
                </span>
              </Link>
            </div>


            <div className="flex items-center">
              {!isLoggedIn ? (
                <div className="flex items-center space-x-6 ">
                  <Link
                    className="text-base font-medium text-white transition duration-200 hover:text-orange-600 hidden lg:block "
                    to="/register"
                  >
                    Sign up
                  </Link>
                  <Link
                    className="text-base font-medium text-white transition duration-200 landscape:hover:text-orange-600 portrait:bg-blue-600 portrait:text-white rounded portrait:px-4 portrait:py-2 "
                    to="/sign-in"
                  >
                    Sign in
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-6">
                  <PopupMenu isLoggedIn={isLoggedIn} />
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
