import { logoutService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

const useAuth = () => {
    const router = useRouter();

    const logout = async () => {
        try {
            await logoutService();
            router.push("/");
            router.refresh();
        } catch (error) {
            console.log(error);
        }
    };

    return { logout };
};

export default useAuth;