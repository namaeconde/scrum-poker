import { ChangeEventHandler } from "react";

interface InputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
}

export default function Input({ label, placeholder, value, onChange }: InputProps) {
    return (
        <div className="flex items-center flex-col gap-2">
            {label && <label>{label}</label>}
            <input
                className="sp-input"
                placeholder={placeholder} value={value} onChange={onChange}
            />
        </div>
    )
}