import { useState } from "react";
import { login as apiLogin, loginWithGoogle } from "@/lib/api";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { IconBox, IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';

const roles = [
  { value: "store_manager", label: "Store Manager" },
  { value: "inventory_analyst", label: "Inventory Analyst" },
  { value: "staff", label: "Warehouse Staff" }, // mapped from warehouse -> staff usually, but keeping consistent with role definition
  { value: "admin", label: "Admin" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // This might not be needed if role comes from backend user
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = (userRole: string) => {
    switch (userRole) {
      case "store_manager":
        navigate("/dashboard/store");
        break;
      case "inventory_analyst":
        navigate("/dashboard/analyst");
        break;
      case "warehouse":
      case "staff":
        navigate("/dashboard/warehouse");
        break;
      case "admin":
        navigate("/dashboard/admin");
        break;
      default:
        navigate("/dashboard/store");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      const data = await apiLogin(email, password);

      // Use useAuth to set state and trigger re-render
      await login(data.access_token);

      toast.success("Login successful!");

      // We can rely on the role selected in dropdown or the one from the user profile.
      // Usually backend tells us the role. For now, let's use the one from dropdown if available, 
      // or we rely on what useAuth fetches.
      // Ideally, login() updates the user state, so we can check it. 
      // But Since login is async and state update might be slightly delayed in effect if we tried to read 'user' immediately from context here
      // we can try to trust the user input for redirection or wait.
      // However, the best way is to let the user be redirected based on the role we just established.
      // Since `login` in AuthContext calls `getMe`, we can't easily get the role *back* from `login` unless we modify it to return user.

      // For now, let's assume valid login.
      // If the user selected a role, we might want to respect it for where to go, 
      // but typically the backend dictates the role.

      // Let's assume the user knows their role or we default. 
      // If we want to be strict, we should read the role from the token or the user profile.

      // Temporary: use the selected role if available, otherwise default
      if (role) {
        handleNavigation(role);
      } else {
        // If no role selected, maybe use a default or fetch details.
        // Since we just called login(), the simple navigation works.
        navigate("/dashboard/store");
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    console.log("🟢 Google Auth Response Received:", credentialResponse);
    try {
      setIsLoading(true);
      console.log("🔄 Sending token to backend for verification...");
      const data = await loginWithGoogle(credentialResponse);
      console.log("✅ Backend Verification Successful:", data);

      await login(data.access_token);

      toast.success("Google Login successful!");
      navigate("/dashboard/analyst"); // Default for Google Login for now
    } catch (error: any) {
      console.error("❌ Google Login Process Failed:", error);
      toast.error(error.message || "Google Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <IconBox className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">IDFS</h1>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@ikea.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <IconEyeOff className="h-5 w-5" />
                    ) : (
                      <IconEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role (Optional)</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role" className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Login Failed')}
                  useOneTap
                />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
