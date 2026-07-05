import { useFormik } from "formik";
import { StepOneFields, stepOneSchema } from "../register.schema";
import InputPassword from "@/components/input-password";

interface StepOneProps {
    onNext: (data: StepOneFields) => void;
}

const StepOne = ({ onNext }: StepOneProps) => {
    const formik = useFormik<StepOneFields>({
        initialValues: {
            email: "",
            password: "",
            repeatPassword: "",
        },
        validationSchema: stepOneSchema,
        onSubmit: async (values) => {
            onNext(values);
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} className="p-8 mx-4 rounded-3xl bg-background max-w-143 md:mx-auto mb-10">
            <h1 className="text-2 text-[28px] font-semibold">Crear tu cuenta</h1>
            <p className="text-text-1 mb-8">Comienza tu proceso de postulación ingresando tus credenciales de acceso.</p>
            <div className="mb-5">
                <label htmlFor="email" className="font-medium text-2 block mb-2">Correo electrónico institucional</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="custom-input"
                    placeholder="ejemplo@licitaciones.gob.pe"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email ? (
                    <p className="text-error mt-1 text-sm">{formik.errors.email}</p>
                ) : null}
            </div>
            <div className="mb-5">
                <InputPassword
                    label="Contraseña"
                    id="password"
                    name="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    error={formik.errors.password}
                    touched={formik.touched.password}
                />
            </div>
            <div className="mb-5">
                <InputPassword
                    label="Confirmar contraseña"
                    id="repeatPassword"
                    name="repeatPassword"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.repeatPassword}
                    error={formik.errors.repeatPassword}
                    touched={formik.touched.repeatPassword}
                />
            </div>
            <button type="submit" className="bg-primary w-full py-4 rounded-xl text-white">
                Continuar
            </button>
        </form>
    );
};

export default StepOne;