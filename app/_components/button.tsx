interface ButtonProps {
    text: string;
    onClick?: () => void;
}

export default function Button({ text, onClick }: ButtonProps) {
    return (
        <button
            className="sp-button"
            onClick={onClick}>{text}
        </button>
    )
}