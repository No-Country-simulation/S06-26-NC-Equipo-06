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
    taxStatus: Yup.string()
        .oneOf(["HABIDO", "NO_HABIDO", "NO_HALLADO"], "El estado de contribuyente no es válido")
        .required("El estado de contribuyente es requerido"),
    fiscalAddress: Yup.string()
        .required("La dirección fiscal es requerida"),
    fiscalStatus: Yup.boolean()
        .required("El estado fiscal es requerido"),
});

export const stepOneSchema = Yup.object().shape({
    email: Yup.string()
        .email("El correo electrónico no es válido")
        .required("El correo electrónico es requerido"),
    password: Yup.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .required("La contraseña es requerida"),
    repeatPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
        .required("La confirmación de la contraseña es requerida"),
});

export type StepOneFields = Yup.InferType<typeof stepOneSchema>;
export type RegisterFields = Yup.InferType<typeof registerSchema>;
