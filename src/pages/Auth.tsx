
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AuthMode = "login" | "signup";
type Role = "farmer" | "buyer";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthed(true);
        navigate("/dashboard", { replace: true });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthed(true);
        navigate("/dashboard", { replace: true });
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password || (mode === "signup" && (!firstName || !lastName || !role))) {
      toast({ title: "Missing fields", description: "Please fill all required fields." });
      setLoading(false);
      return;
    }
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role,
          }
        }
      });
      if (error) {
        toast({ title: "Signup failed", description: error.message });
      } else {
        toast({ title: "Signup successful", description: "Check your email for a confirmation link (if required)." });
        setMode("login");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login failed", description: error.message });
      } else {
        toast({ title: "Logged in", description: "Welcome back!" });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-2">{mode === "login" ? "Login" : "Sign Up"}</h1>
        <form className="space-y-4" onSubmit={onSubmit} autoComplete="off">
          {mode === "signup" && (
            <>
              <Input
                placeholder="First name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                disabled={loading}
              />
              <Input
                placeholder="Last name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                disabled={loading}
              />
              <div>
                <label className="block mb-1 font-medium text-sm">Role <span className="text-destructive">*</span></label>
                <Select value={role} onValueChange={val => setRole(val as Role)} disabled={loading} required>
                  <SelectTrigger className={`bg-white border ${!role && "border-destructive"}`} id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="buyer">Buyer / Market</SelectItem>
                  </SelectContent>
                </Select>
                {!role && (
                  <span className="text-xs text-destructive block mt-1">Select a role to continue</span>
                )}
              </div>
            </>
          )}
          <Input
            type="email"
            placeholder="Email"
            autoComplete="username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            type="password"
            placeholder="Password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (mode === "login" ? "Logging in..." : "Signing up...") : (mode === "login" ? "Login" : "Sign Up")}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button className="font-medium text-primary hover:underline" onClick={() => setMode("signup")}>Sign up</button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="font-medium text-primary hover:underline" onClick={() => setMode("login")}>Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
