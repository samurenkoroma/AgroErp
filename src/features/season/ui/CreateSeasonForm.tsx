import {Modal} from "@/components/common/Modal.tsx";
import {CreateSeasonDTO, Season, seasonLib} from "@/entities/season";
import {useUIStore} from "@/stores/uiStore.ts";
import {useState} from "react";

interface CreateSeasonFormProps {
    isOpen: boolean;
    onClose: () => void;
    isEdit: boolean;
    season: Season;
    onConfirm: (data: CreateSeasonDTO) => void;
}

const CreateSeasonForm = ({isOpen, onClose, isEdit, season, onConfirm}: CreateSeasonFormProps) => {
    const {addNotification} = useUIStore();
    const [name, setName] = useState(season.name);
    const [startDate, setStartDate] = useState(seasonLib.getDateString(season.startDate));
    const [endDate, setEndDate] = useState(seasonLib.getDateString(season.endDate));
    const [status, setStatus] = useState(season.status);
    const [error, setError] = useState('');
    const [disableStatus, setDisableStatus] = useState(false)

    const handleConfirm = () => {
        if (!name.trim()) {
            addNotification({type: "warning", message: 'Пожалуйста, введите название'})
            return;
        }
        onConfirm({
            name,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: status
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen}
               onClose={onClose}
               title={isEdit ? 'Редактировать сезон' : 'Создать новый сезон'}>


            <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
                <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-xl">
                    <div className=" space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Название
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (error) setError(error);
                                }}
                                placeholder="Сезон 2026"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Начало
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Конец
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        if (endDate < seasonLib.getDateString(new Date())) {
                                            setStatus('completed')
                                            setDisableStatus(true)
                                        }
                                        setEndDate(e.target.value)
                                    }}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Статус
                            </label>
                            <select
                                onChange={(e) => {
                                    setStatus(e.target.value as Season["status"]);
                                }}
                                value={status}
                                disabled={disableStatus}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                                <option value="planning">Планирование</option>
                                <option value="current">Текущий</option>
                                <option value="completed">Завершен</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Заметки
                            </label>
                            <textarea
                                defaultValue={season.notes}
                                rows={3}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none"
                                placeholder="Дополнительная информация..."
                            />
                        </div>
                    </div>
                    <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                        <button onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleConfirm}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            {isEdit ? 'Сохранить' : 'Создать'}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}


export default CreateSeasonForm;