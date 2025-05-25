
import { Link } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-gray-600 mb-2">Start building your amazing project here!</p>
        {!user ? (
          <Link to="/auth">
            <Button>Login / Signup</Button>
          </Link>
        ) : (
          <div>
            <p className="text-green-600 mb-2">You are logged in.</p>
            <Link to="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
export default Index;
