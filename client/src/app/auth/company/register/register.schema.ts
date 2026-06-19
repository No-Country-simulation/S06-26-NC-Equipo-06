import * as Yup from "yup";

export const registerSchema = Yup.object().shape({
    email: Yup.string()
        .email("El correo electrónico no es válido")
        .required("El correo electrónico es requerido"),
    password: Yup.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .required("La contraseña es requerida"),
    ruc: Yup.string()
        .matches(/^\d{11}$/, "El RUC debe tener exactamente 11 dígitos numéricos")
        .required("El RUC es requerido"),
    companyName: Yup.string()
        .min(3, "El nombre de la empresa debe tener al menos 3 caracteres")
        .required("El nombre de la empresa es requerido"),
});

export type RegisterFields = Yup.InferType<typeof registerSchema>;
