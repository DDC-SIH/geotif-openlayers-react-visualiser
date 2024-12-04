import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="p-4">
      <Button onClick={() => navigate("/order")} >Start</Button>
    </div>
  );
}

export default Home;
