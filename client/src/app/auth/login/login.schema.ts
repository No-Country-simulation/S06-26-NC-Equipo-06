import * as Yup from "yup";

export const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email("El correo electrónico no es válido")
        .required("El correo electrónico es requerido"),
    password: Yup.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .required("La contraseña es requerida"),
});

export type LoginFields = Yup.InferType<typeof loginSchema>;
