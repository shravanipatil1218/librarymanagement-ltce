import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Library } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Library className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-display font-bold mb-2">LibraHub</h1>
        <p className="text-muted-foreground mb-6">Modern Library Management System</p>
        <Button onClick={() => navigate("/")}>Get Started</Button>
      </div>
    </div>
  );
};

export default Index;
