interface StepIndicatorProps {
    currentStep: number;
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
    const steps = [
        { number: 1, label: "Tipo Perfil" },
        { number: 2, label: "Datos Empresa" },
        { number: 3, label: "Finalizar" },
    ];

    return (
        <div className="flex items-center justify-between w-full max-w-sm mx-auto pt-4 pb-12 px-6">
            {steps.map((step, idx) => {
                const isActive = step.number === currentStep;
                const isCompleted = step.number < currentStep;

                return (
                    <div key={step.number} className="flex items-center flex-1 last:flex-none">
                        {/* Node */}
                        <div className="flex flex-col items-center relative">
                            {/* Circle */}
                            <div
                                className={`size-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${isActive || isCompleted
                                        ? "bg-primary text-white"
                                        : "bg-white border-2 border-grey-3 text-grey-4"
                                    }`}
                            >
                                {isCompleted ? (
                                    <svg
                                        className="size-5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                ) : (
                                    step.number
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={`absolute top-12 text-[12px] font-bold whitespace-nowrap transition-colors duration-300 ${isActive || isCompleted ? "text-primary" : "text-grey-4"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Line */}
                        {idx < steps.length - 1 && (
                            <div className="flex-1 h-0.5 bg-grey-3 mx-4">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: isCompleted ? "100%" : "0%" }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StepIndicator;