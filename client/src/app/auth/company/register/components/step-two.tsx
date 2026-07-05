import { useState } from "react";
import { useFormik } from "formik";
import { StepTwoFields, stepTwoSchema } from "../register.schema";
import { verifyRucService } from "@/services/auth.service";

interface StepTwoProps {
    onNext: (data: StepTwoFields) => void;
}

const StepTwo = ({ onNext }: StepTwoProps) => {
    const [isVerifying, setIsVerifying] = useState(false);

    const formik = useFormik<StepTwoFields>({
        initialValues: {
            ruc: "",
            companyName: "",
            taxStatus: "HABIDO",
            fiscalAddress: "",
            fiscalStatus: true,
        },
        validationSchema: stepTwoSchema,
        onSubmit: (values) => {
            onNext(values);
        },
    });

    const handleRucChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // Sanitizar el input para que solo contenga números y un máximo de 11 dígitos
        const val = e.target.value.replace(/\D/g, "").slice(0, 11);
        formik.setFieldValue("ruc", val);

        if (val.length === 11) {
            setIsVerifying(true);
            try {
                const data = await verifyRucService(val);
                formik.setFieldValue("companyName", data.companyName);
                formik.setFieldValue("fiscalAddress", data.fiscalAddress);
                formik.setFieldValue("taxStatus", data.taxStatus);
                formik.setFieldValue("fiscalStatus", data.fiscalStatus);
            } catch (error) {
                console.error("Error al verificar el RUC:", error);
                const msg = error instanceof Error ? error.message : "No se pudo verificar el RUC.";
                formik.setFieldError("ruc", msg);
                formik.setFieldValue("companyName", "");
                formik.setFieldValue("fiscalAddress", "");
                formik.setFieldValue("taxStatus", "HABIDO");
                formik.setFieldValue("fiscalStatus", true);
            } finally {
                setIsVerifying(false);
            }
        } else {
            // Solo limpiar si actualmente tienen algún valor para evitar re-renders innecesarios
            if (formik.values.companyName !== "") {
                formik.setFieldValue("companyName", "");
                formik.setFieldValue("fiscalAddress", "");
                formik.setFieldValue("taxStatus", "HABIDO");
                formik.setFieldValue("fiscalStatus", true);
            }
        }
    };

    return (
        <form onSubmit={formik.handleSubmit} className="bg-background border border-background-2 rounded-3xl mx-4 p-8 mb-10 max-w-143 md:mx-auto">
            <h1>Información Legal</h1>
            <p>
                Los datos se van a autocompletar de
                los registros oficiales.
            </p>
            <div className="flex flex-col gap-2 mb-5">
                <label htmlFor="ruc">RUC</label>
                <input
                    type="text"
                    id="ruc"
                    name="ruc"
                    onChange={handleRucChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.ruc}
                    disabled={isVerifying}
                    className="custom-input"
                />
                {isVerifying && (
                    <p className="text-info text-[13px] mt-1">Consultando SUNAT...</p>
                )}
                {formik.touched.ruc && formik.errors.ruc ? (
                    <p className="text-error text-sm mt-1">{formik.errors.ruc}</p>
                ) : null}
            </div>
            <hr className="border-grey-5 mb-3" />
            <div className="flex flex-col gap-2 mb-3">
                <label htmlFor="companyName">Razón Social</label>
                <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    readOnly
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.companyName}
                    className="custom-input bg-background-2 text-label-text"
                />
                {formik.touched.companyName && formik.errors.companyName ? (
                    <p className="text-error text-sm mt-1">{formik.errors.companyName}</p>
                ) : null}
            </div>
            <div className="flex flex-col gap-2 mb-3">
                <label htmlFor="fiscalAddress">Dirección Fiscal</label>
                <input
                    type="text"
                    id="fiscalAddress"
                    name="fiscalAddress"
                    readOnly
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.fiscalAddress}
                    className="custom-input bg-background-2 text-label-text"
                />
                {formik.touched.fiscalAddress && formik.errors.fiscalAddress ? (
                    <p className="text-error text-sm mt-1">{formik.errors.fiscalAddress}</p>
                ) : null}
            </div>
            <div className="grid grid-cols-2 mb-3">
                <div className="flex flex-col gap-2">
                    <span className="font-medium text-2">Estado</span>
                    <span className="text-[11px] font-bold w-fit text-success bg-success/5 px-2 py-1 border-[0.5px] border-success rounded-full">
                        {formik.values.fiscalStatus ? "ACTIVO" : "INACTIVO"}
                    </span>
                </div>
                <div className="flex flex-col gap-2 mr-6">
                    <span className="font-medium text-2">Condición</span>
                    <span className="text-[11px] font-bold w-fit text-info bg-info/5 px-2 py-1 border-[0.5px] border-info rounded-full">
                        {formik.values.taxStatus}
                    </span>
                </div>
            </div>
            {/* information box */}
            <div className="flex gap-4 p-4 bg-[#eff6ff] rounded-xl mb-8">
                <img src="/Icon/info.svg" alt="Icono informativo" className="h-5 w-auto" />
                <div className="flex flex-col gap-1">
                    <h2 className="text-sm font-bold">¿Por qué no puedo editar?</h2>
                    <p className="text-[13px] text-text-1 leading-normal">
                        Para garantizar la transparencia, los datos se sincronizan directamente con
                        la base de datos de SUNAT. Si hay errores, deberá actualizarlos en su
                        ficha RUC.
                    </p>
                </div>
            </div>
            <div className="mb-5">
                <span className="text-text-1 text-center block mb-2">¿Necesitas ayuda con tu RUC?</span>
                <a href="#" className="text-primary font-semibold flex items-center gap-2 justify-center text-center">
                    Contactar soporte <img src="/Icon/link.svg" alt="Icono de enlace" className="h-3 w-auto" />
                </a>
            </div>
            <button type="submit" className="btn btn-primary w-full">Continuar</button>
        </form>
    );
};

export default StepTwo;