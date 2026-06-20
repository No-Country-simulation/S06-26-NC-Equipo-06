import axios from "axios";

const base_url = process.env.NEXT_PUBLIC_API_URL;

export interface VerifyMunicipalResponse {
    success: boolean;
    message: string;
    code?: string;
}

/**
 * Verifica si un subdominio/slug municipal existe en el backend.
 * Endpoint: GET /api/v1/municipalities/verify/{slug}
 */
export const verifyMunicipalSlugService = async (slug: string): Promise<VerifyMunicipalResponse> => {
    try {
        const response = await axios.get(`${base_url}/api/v1/municipalities/verify/${slug}`);
        
        if (!response.data) {
            throw new Error("El servidor respondió correctamente pero sin datos.");
        }

        return response.data as VerifyMunicipalResponse;
    } catch (error) {
        let errorMessage = "No se pudo verificar el municipio";

        if (axios.isAxiosError(error)) {
            if (error.response) {
                const apiResponse = error.response.data as VerifyMunicipalResponse | undefined;
                if (apiResponse && typeof apiResponse.success !== "undefined") {
                    return apiResponse;
                }
                errorMessage = `Error del servidor (${error.response.status})`;
            } else if (error.request) {
                errorMessage = "No se recibió respuesta del servidor. Verifica tu conexión.";
            } else {
                errorMessage = error.message;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};
