import { GlobeDemo } from "@/components/GlobeDemo";
import { Button } from "@/components/ui/button";
import { useAppContext } from "../../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { Fingerprint, MessageCircleQuestionIcon } from "lucide-react";
import MiniMap from "@/components/MiniMap";

function Home() {
  const navigate = useNavigate();
  const { isLoggedIn, isAuthorized } = useAppContext();
  return (
    <div className="grid grid-cols-1 gap-6 my-6">
      <div className=" grid-cols-2 grid gap-8">
      <div className="mt-20">
      <p className="text-sm text-neutral-500 font-bold mb-1">
          Effortlessly Optimize, Visualize, and Download Geospatial Files
          </p>
          <p className=" mb-2 text-2xl font-bold">
            Leverage the power of cloud-optimized tools for seamless processing
            and real-time data visualization
          </p>
            <p className="text-gray-700 mb-6">
            Handling large geospatial datasets has never been easier. Our
            platform empowers users to optimize, visualize, and download GeoTIFF
            and HDF5 files with unmatched efficiency. Whether you're a
            meteorologist, researcher, or data analyst, our tools are tailored
            to help you extract insights, manipulate data, and make informed
            decisions — all in real-time.
            </p>
            <div className="flex gap-4">
              {isLoggedIn ? (
                <Button onClick={() => navigate(isAuthorized?"/preview":"/authorize-yourself")} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              ) : (
                <Button onClick={() => navigate("/sign-in")} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Login
                </Button>
              )}
              <Button
                onClick={() => navigate("#")}
                variant={"outline"}
                className="border-blue-600 text-blue-600 hover:bg-blue-100"
              >
                View Demo
              </Button>
            </div>
          </div>
        <MiniMap altText="BES,SAC/ISRO,Ahmedabad,INDIA. 04-SEP-2024 10:42:29" geotiffUrl="https://somehowgetsplotted.s3.ap-south-1.amazonaws.com/somehowgetsplotted/IMG_VIS_optimized.tif" zoomOut zoomedToTheBounding mapHeight="400px" />
      </div>


      <div className="flex flex-col justify-center items-center w-full">
        <h1 className="text-4xl font-bold mt-8 mb-6">
          Powerful Features at Your <span className="bg-clip-text text-transparent bg-gradient-to-l to-orange-400 from-blue-500">Fingertips
            </span>{" "}
          <Fingerprint className="inline size-7 text-blue-500" />
        </h1>
        <div className="grid grid-cols-3 gap-4 mt-4">
        {[
              { title: "Real-Time Visualization", desc: "Instantly preview TIFF and HDF5 files with high-resolution interactive maps." },
              { title: "Cloud-Optimized Processing", desc: "Stream and manipulate large files without downloading the entire dataset." },
              { title: "Selective Downloads", desc: "Download specific regions or data layers to save bandwidth and time." },
              { title: "Custom Manipulations", desc: "Perform band arithmetic, adjust colors, and create custom visualizations on-the-fly." },
              { title: "User-Friendly Interface", desc: "Navigate and process your data seamlessly with our intuitive tools." },
              { title: "Secure File Management", desc: "Your data is encrypted and stored securely in the cloud." },
            ].map((feature, index) => (
          <div className="p-4 rounded-2xl border text-center flex flex-col justify-center  items-center bg-neutral-50 hover:bg-zinc-100 transition-all duration-100 hover:scale-[1.01]">
            <p className="my-2 rounded-full border border-neutral-300 w-12 h-12 font-bold text-center items-center flex justify-center text-2xl">
              {index+1}
            </p>
            <p className="font-bold text-2xl">{feature.title}</p>
            <p>
              {feature.desc}
            </p>
          </div>
 ))}

        </div>
      </div>

      <div className="flex flex-col justify-center items-center w-full my-12 bg-blue-100 p-8 rounded-xl">
        <h2 className="text-3xl font-bold mb-6">How to Get Started <MessageCircleQuestionIcon className="inline size-8" /></h2>
        <div className="flex flex-col gap-8 mx-auto">
          <div className="flex gap-4 max-w-5xl">
            <p className=" font-bold text-5xl">1</p>
            <div className="flex-1">
              <p className="font-bold text-xl">Define Your Data Needs</p>
              <p className="text-blue-950 text-opacity-80">
                Input your desired date and time range for INSAT satellite data.
                Select specific spectral bands of interest for
                precise data filtering.
              </p>
            </div>
          </div>
          <div className="flex gap-4 max-w-5xl">
            <p className=" font-bold text-5xl">2</p>
            <div className="flex-1">
              <p className="font-bold text-xl">Visualize and Analyze</p>
              <p className="text-blue-950 text-opacity-80">
                Use visualization tools to process and analyze your
                data on the fly. Perform band arithmetic, adjust colors effortlessly.
              </p>
            </div>
          </div>
          <div className="flex gap-4 max-w-5xl">
            <p className=" font-bold text-5xl">3</p>
            <div className="flex-1">
              <p className="font-bold text-xl">Download What You Need</p>
              <p className="text-blue-950 text-opacity-80">
                Select and download specific regions or customized versions of
                your file.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
      <div >
        <p className="text-4xl font-bold mb-2">
          Say goodbye to the hassle of downloading massive files just to access
          a small portion of the data.{" "}
        </p>
        <p className="text-lg">
          With selective streaming, on-the-fly processing, and an intuitive user
          interface, you can streamline your workflow, save bandwidth, and focus
          on what matters most — uncovering the story behind the data.
          Experience the future of geospatial data management today.
        </p>
      </div>
{/* <GlobeDemo /> */}
      </div>

      <footer className=" py-8 mt-16">
        {/* Copyright Section */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            © 2024 Vistaar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
