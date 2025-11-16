import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  department: string;
  category?: string;
}

interface CourseCartContextValue {
  cartItems: CartCourse[];
  cartCount: number;
  addCourseToCart: (course: CartCourse) => void;
  removeCourseFromCart: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
}

const CourseCartContext = createContext<CourseCartContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "degree-path-cart";

export const CourseCartProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cartItems, setCartItems] = useState<CartCourse[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch {
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addCourseToCart = (course: CartCourse) => {
    setCartItems((prev) => {
      if (prev.some((item) => item.id === course.id)) {
        return prev;
      }
      return [...prev, course];
    });
  };

  const removeCourseFromCart = (courseId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== courseId));
  };

  const clearCart = () => setCartItems([]);

  const isInCart = (courseId: string) =>
    cartItems.some((item) => item.id === courseId);

  const value = useMemo(
    () => ({
      cartItems,
      cartCount: cartItems.length,
      addCourseToCart,
      removeCourseFromCart,
      clearCart,
      isInCart,
    }),
    [cartItems],
  );

  return (
    <CourseCartContext.Provider value={value}>
      {children}
    </CourseCartContext.Provider>
  );
};

export const useCourseCart = () => {
  const ctx = useContext(CourseCartContext);
  if (!ctx) throw new Error("useCourseCart must be used within provider");
  return ctx;
};
