import React, { useState } from "react";

interface InputPasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    touched?: boolean;
    icon?: string;
}

const InputPassword: React.FC<InputPasswordProps> = ({
    label,
    error,
    touched,
    icon,
    id,
    className = "",
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="font-medium text-text-2 block mb-2">
                    {label}
                </label>
            )}
            <div
                className={`flex items-center gap-3 w-full rounded-xl py-4.5 px-4 border bg-background transition-colors ${
                    touched && error ? "border-error" : "border-grey-2"
                }`}
            >
                {icon && (
                    <img src={icon} alt="Input icon" className="h-6 w-auto shrink-0" />
                )}
                <input
                    type={showPassword ? "text" : "password"}
                    id={id}
                    className={`w-full bg-transparent outline-none border-0 p-0 text-text-2 placeholder-grey-3 ${className}`}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none flex items-center shrink-0"
                >
                    <img
                        src={showPassword ? "/Icon/eye-slash.svg" : "/Icon/eye.svg"}
                        alt="Toggle password visibility"
                        className="h-6 w-auto"
                    />
                </button>
            </div>
            {touched && error && <p className="text-error mt-1 text-sm">{error}</p>}
        </div>
    );
};

export default InputPassword;
