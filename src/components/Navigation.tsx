import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import rotundaImg from "@/components/images/rotunda_4.png";
import {
  LayoutDashboard,
  GitBranch,
  BookOpen,
  CheckSquare,
  FileCheck,
  LogOut,
  ShoppingCart,
  X,
} from "lucide-react";
import { useCourseCart } from "@/contexts/CourseCartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    cartItems,
    cartCount,
    removeCourseFromCart,
    clearCart,
  } = useCourseCart();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/plan-ahead", label: "Plan Ahead", icon: GitBranch },
    { path: "/progression", label: "Progression", icon: GitBranch },
    { path: "/catalog", label: "Course Catalog", icon: BookOpen },
    { path: "/requirements", label: "Requirements", icon: CheckSquare },
    { path: "/advisor", label: "Advisor Approval", icon: FileCheck },
    { path: "/registration", label: "Registration", icon: CheckSquare },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-1 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 mr-6 -ml-3">
              <img
                src={rotundaImg}
                alt="Lehigh stained glass dome"
                className="w-12 h-12 rounded-full object-cover sm:w-12 sm:h-12"
              />
              <span className="hidden sm:inline font-semibold text-sm tracking-wide">
                Degree Path
              </span>
            </Link>
            <div className="hidden md:flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="relative gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Course Cart</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col h-full">
                  {cartItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No courses added yet. Browse the catalog to add courses to your cart.
                    </p>
                  ) : (
                    <>
                      <ScrollArea className="flex-1">
                        <div className="space-y-3 pr-3">
                          {cartItems.map((course) => (
                            <div
                              key={course.id}
                              className="border rounded-lg p-3 text-sm flex items-start justify-between gap-2"
                            >
                              <div>
                                <div className="font-semibold">
                                  {course.code}
                                </div>
                                <div className="text-muted-foreground">
                                  {course.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {course.credits} credits · {course.department}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCourseFromCart(course.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={clearCart}
                      >
                        Clear Cart
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
