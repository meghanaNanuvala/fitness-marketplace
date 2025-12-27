import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AllItemsPage from "./pages/MainPage/AllItemsPage";
import ProfilePage from "./pages/MainPage/ProfilePage";
import SellerItemsPage from "./pages/Seller/SellerItemsPage";
import ItemDetailsPage from "./pages/MainPage/ItemDetailsPage";
import SearchItems from "./pages/SearchItems";
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import AdminPage from "./pages/Admin/AdminPage";
import CartPage from "./pages/MainPage/CartPage";
import BoughtItemsPage from "./pages/MainPage/BoughtItemsPage";
import CheckoutPage from "./pages/CheckoutPage";

function AppContent() {
  const location = useLocation();

  // Get user from localStorage
  const savedUser = localStorage.getItem("currentUser");

  // Normalize & Fix user data
  const currentUser = savedUser
    ? (() => {
        const user = JSON.parse(savedUser);

        const normalizedUser = {
          ...user,
          userId: user.userId ?? user.id,
          id: user.id ?? user.userId,
          isAdmin: (user.userId ?? user.id) === "12", // CHANGE WHO IS ADMIN
        };

        // Rewrite corrected user into localStorage
        localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
        return normalizedUser;
      })()
    : null;

  const isAdminPath = location.pathname.startsWith("/admin");

  // Pages that DO NOT show navbar
  const hideNavbarPages = ["/", "/register", "/forgot-password"];
  const shouldShowNavbar = currentUser && !hideNavbarPages.includes(location.pathname);

  // Decide which navbar to show
  let ActiveNavbar = null;
  if (shouldShowNavbar) {
    if (currentUser.isAdmin && isAdminPath) {
      ActiveNavbar = <AdminNavbar user={currentUser} />;
    } else {
      ActiveNavbar = <Navbar user={currentUser} />;
    }
  }

  return (
    <>
      {ActiveNavbar}

      <Routes>
        <Route path="/landing-page" element={<AllItemsPage />} />
        <Route path="/AllItemsPage" element={<SearchItems />} /> 
        <Route path="/sell" element={<SellerItemsPage />} />
        <Route path="/profile" element={<ProfilePage user={currentUser}/>} /> 
        <Route path="/adminprofile" element={<ProfilePage user={currentUser}/>} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/landing-page" element={<AllItemsPage />} />
        <Route path="/AllItemsPage" element={<SearchItems />} />
        <Route path="/sell" element={<SellerItemsPage />} />
        <Route path="/profile" element={<ProfilePage user={currentUser} />} />
        <Route path="/adminprofile" element={<ProfilePage user={currentUser} />} />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            currentUser?.isAdmin ? (
              <AdminPage />
            ) : (
              <div className="max-w-xl mx-auto p-10 mt-20 text-center border-4 border-red-200 bg-red-50 rounded-xl text-red-700">
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p>You do not have administrative privileges to view this page.</p>
              </div>
            )
          }
        />

        <Route path="/item/:id" element={<ItemDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/bought-items" element={<BoughtItemsPage />} />

        <Route path="*" element={<div className="p-6">404 - Page not found</div>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
