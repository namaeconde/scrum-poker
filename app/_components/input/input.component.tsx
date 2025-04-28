import {ChangeEventHandler, KeyboardEventHandler} from "react";

interface InputProps {
    label?: string;
    placeholder?: string;
    defaultValue?: string;
    value?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}

export default function InputComponent({ label, placeholder, defaultValue, value, onChange, onKeyDown }: InputProps) {
    return (
        <div className="flex items-center flex-col gap-2">
            {label && <label>{label}</label>}
            <input
                className="sp-input"
                placeholder={placeholder}
                defaultValue={defaultValue}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
            />
        </div>
    )
}