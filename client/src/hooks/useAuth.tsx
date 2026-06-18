import { useContext } from "react";
import { AuthContext, AuthContextType } from "@/context/AuthContext";

const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
};

export default useAuth;