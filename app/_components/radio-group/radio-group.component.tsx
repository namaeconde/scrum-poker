import { ChangeEventHandler } from "react";

interface RadioGroupProps {
    radioButtons: {
        name: string;
        value: string;
        isChecked?: boolean;
    }[],
    isDisabled?: boolean;
    onChange?: ChangeEventHandler<HTMLInputElement>;
}

export default function RadioGroupComponent({ radioButtons, isDisabled, onChange }: RadioGroupProps) {
    return (
        <div className={`flex gap-2 ${isDisabled && 'opacity-40'}`}>
            {radioButtons.map(({name, value, isChecked}, i) => {
                return (
                    <div key={i} className="flex items-center me-4">
                        <input type="radio" id={name} name="radio-group" value={value}
                               className="hidden peer"
                               disabled={isDisabled}
                               checked={isChecked}
                               onChange={onChange}
                        />
                        <label htmlFor={name}
                               className="sp-radio-button">
                            <div className="w-full text-lg">{name}</div>
                        </label>
                    </div>
                )
            })}
        </div>
    )
}