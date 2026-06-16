import crypto from "crypto";
import { hashRefreshToken } from "./hash.refresh.token";

export const generateRefreshToken = () => {

    const refreshToken = crypto.randomBytes(64).toString("hex");
    const hashed = hashRefreshToken(refreshToken);

    return { refreshToken, hashed };

}