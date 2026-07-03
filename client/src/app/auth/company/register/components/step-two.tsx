const StepTwo = () => {
    return (
        <form className="bg-background border border-background-2 rounded-3xl mx-4 p-8 mb-10">
            <h1>Información Legal</h1>
            <p>
                Los datos se van a autocompletar de
                los registros oficiales.
            </p>
            <div className="flex flex-col gap-2 mb-5">
                <label htmlFor="ruc">RUC</label>
                <input type="text" id="ruc" />
            </div>
            <hr className="border-grey-5 mb-3" />
            <div className="flex flex-col gap-2 mb-3">
                <label htmlFor="companyName">Razón Social</label>
                <input type="text" id="companyName" readOnly />
            </div>
            <div className="flex flex-col gap-2 mb-3">
                <label htmlFor="fiscalAddress">Dirección Fiscal</label>
                <input type="text" id="fiscalAddress" readOnly />
            </div>
            <div className="grid grid-cols-2 mb-3">
                <div className="flex flex-col gap-2">
                    <span className="font-medium text-2">Estado</span>
                    <span className="text-[11px] font-bold w-fit text-success bg-success/5 px-2 py-1 border-[0.5px] border-success rounded-full">ACTIVO</span>
                </div>
                <div className="flex flex-col gap-2 mr-6">
                    <span className="font-medium text-2">Condición</span>
                    <span className="text-[11px] font-bold w-fit text-info bg-info/5 px-2 py-1 border-[0.5px] border-info rounded-full">HABIDO</span>
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
                <span className="text-text-1 text-center block">¿Necesitas ayuda con tu RUC?</span>
                <a href="#" className="text-primary font-semibold text-center block">Contactar soporte</a>
            </div>
            <button type="submit" className="btn btn-primary w-full">Continuar</button>
        </form>
    );
};

export default StepTwo;