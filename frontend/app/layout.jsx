import PropTypes from "prop-types";
import { AuthProvider } from "@/src/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Question Hub",
  description: "Question bank and test management platform",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
};

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RootLayout;
