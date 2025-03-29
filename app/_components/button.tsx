interface ButtonProps {
    text: string;
    onClick?: () => void;
    isDisabled?: boolean;
}

export default function Button({ text, onClick, isDisabled }: ButtonProps) {
    return (
        <button
            disabled={isDisabled}
            className="sp-button"
            onClick={onClick}>{text}
        </button>
    )
}