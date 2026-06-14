export const SelectionCard = ({
                           option,
                           isSelected,
                           onClick
                       }: {
    option: { value: string; label: string; emoji: string; bg: string; icon?: React.ReactNode };
    isSelected: boolean;
    onClick: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`
      flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
      ${isSelected
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
            : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
        }
    `}
    >
        <div className={`p-2 rounded-full ${option.bg} ${isSelected ? 'ring-2 ring-green-500' : ''}`}>
            <span className="text-2xl">{option.emoji}</span>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{option.label}</span>
    </button>
);