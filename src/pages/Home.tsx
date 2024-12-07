import { GlobeDemo } from "@/components/GlobeDemo";
import { Button } from "@/components/ui/button";
import { useAppContext } from "../../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { Fingerprint, MessageCircleQuestionIcon } from "lucide-react";
import MiniMap from "@/components/MiniMap";

function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAppContext();
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
          <p className=" mb-2">
            Handling large geospatial datasets has never been easier. Our
            platform empowers users to optimize, visualize, and download GeoTIFF
            and HDF5 files with unmatched efficiency. Whether you're a
            meteorologist, researcher, or data analyst, our tools are tailored
            to help you extract insights, manipulate data, and make informed
            decisions — all in real-time.
          </p>
          <div className="flex gap-2">
            {isLoggedIn ? (
              <Button onClick={() => navigate("/preview")} className="w-fit">
                Start
              </Button>
            ) : (
              <Button onClick={() => navigate("/sign-in")} className="w-fit">
                Login
              </Button>
            )}

            <Button
              onClick={() => navigate("#")}
              variant={"outline"}
              className="w-fit"
            >
              View Demo
            </Button>
          </div>
        </div>
        <MiniMap geotiffUrl="https://somehowgetsplotted.s3.ap-south-1.amazonaws.com/somehowgetsplotted/IMG_VIS_optimized.tif" zoomOut zoomedToTheBounding mapHeight="400px" />
      </div>

      <div className="flex flex-col justify-center items-center w-full">
        <h1 className="text-4xl font-bold mt-8 mb-6">
          Powerful Features at Your <span className="bg-clip-text text-transparent bg-gradient-to-l from-zinc-700 to-zinc-500">Fingertips</span>{" "}
          <Fingerprint className="inline" />
        </h1>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-2xl border text-center flex flex-col justify-center  items-center hover:bg-zinc-50 transition-all duration-100">
            <p className="my-2 rounded-full border w-12 h-12 font-bold text-center items-center flex justify-center text-2xl">
              1
            </p>
            <p className="font-bold text-2xl">Real-Time Visualization</p>
            <p>
              Instantly preview TIFF and HDF5 files with high-resolution
              interactive maps.
            </p>
          </div>
          <div className="p-4 rounded-2xl border text-center flex flex-col justify-center  items-center hover:bg-zinc-50 transition-all duration-100">
            <p className="my-2 rounded-full border w-12 h-12 font-bold text-center items-center flex justify-center text-2xl">
              2
            </p>
            <p className="font-bold text-2xl">Cloud-Optimized Processing</p>
            <p>
              Stream and manipulate large files without downloading the entire
              dataset.
            </p>
          </div>
          <div className="p-4 rounded-2xl border text-center flex flex-col justify-center  items-center hover:bg-zinc-50 transition-all duration-100">
            <p className="my-2 rounded-full border w-12 h-12 font-bold text-center items-center flex justify-center text-2xl">
              3
            </p>
            <p className="font-bold text-2xl">Selective Downloads</p>
            <p>
              Download specific regions or data layers to save bandwidth and
              time.
            </p>
          </div>
          <div className="p-4 rounded-2xl border text-center flex flex-col justify-center  items-center hover:bg-zinc-50 transition-all duration-100">
            <p className="my-2 rounded-full border w-12 h-12 font-bold text-center items-center flex justify-center text-2xl">
              4
            </p>
            <p className="font-bold text-2xl">Custom Manipulations</p>
            <p>
              Perform band arithmetic, adjust colors, and create custom
              visualizations on-the-fly.
            </p>
          </div>
          <div className="p-4 rounded-2xl border text-center flex flex-col justify-center  items-center hover:bg-zinc-50 transition-all duration-100">
            <p className="my-2 rounded-full border w-12 h-12 font-bold text-center items-center flex justify-center text-2xl">
              5
            </p>
            <p className="font-bold text-2xl">User-Friendly Interface</p>
            <p>
              Navigate and process your data seamlessly with our intuitive
              tools.
            </p>
          </div>
          <div className="p-4 rounded-2xl border text-center flex flex-col justify-center  items-center hover:bg-zinc-50 transition-all duration-100">
            <p className="my-2 rounded-full border w-12 h-12 font-bold text-center items-center flex justify-center text-2xl">
              6
            </p>
            <p className="font-bold text-2xl">Secure File Management</p>
            <p>Your data is encrypted and stored securely in the cloud.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center w-full my-12">
        <h2 className="text-3xl font-bold mb-6">How to Get Started <MessageCircleQuestionIcon className="inline size-8" /></h2>
        <div className="flex flex-col gap-6 mx-auto">
          <div className="flex gap-4 max-w-5xl">
            <p className=" font-bold text-6xl">1</p>
            <div className="flex-1">
              <p className="font-bold text-xl">Define Your Data Needs</p>
              <p>
                Input your desired date and time range for INSAT satellite data.
                Select specific spectral bands or regions of interest for
                precise data filtering.
              </p>
            </div>
          </div>
          <div className="flex gap-4 max-w-5xl">
            <p className=" font-bold text-6xl">2</p>
            <div className="flex-1">
              <p className="font-bold text-xl">Visualize and Analyze</p>
              <p>
                Use the in-built visualization tools to process and analyze your
                data on the fly. Perform band arithmetic, adjust colors, and
                create custom visualizations effortlessly.
              </p>
            </div>
          </div>
          <div className="flex gap-4 max-w-5xl">
            <p className=" font-bold text-6xl">3</p>
            <div className="flex-1">
              <p className="font-bold text-xl">Download What You Need</p>
              <p>
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
<GlobeDemo />
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
